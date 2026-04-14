/**
 * accounts.js — Página de Prestação de Contas
 *
 * Solicita PIN validado contra o servidor via POST /api/verify-pin.
 * Após validação, exibe lista de comprovantes e botão "+ Adicionar".
 *
 * Requisitos: 8.1, 8.2, 8.3
 */
(function () {
  'use strict';

  var backArrowSvg =
    '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="12" cy="12" r="10"/><polyline points="14 8 10 12 14 16"/></svg>';

  function formatDate(isoStr) {
    if (!isoStr) return '';
    try {
      var d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
    } catch (e) { return isoStr; }
  }

  function buildReceiptCard(receipt, baseUrl) {
    var imageHtml = '';
    if (receipt.image_path) {
      imageHtml = '<img class="diary-post-image" src="' + baseUrl + '/uploads/' + receipt.image_path + '" alt="Comprovante" loading="lazy">';
    }
    return '<article class="diary-post-card">' +
      '<div class="diary-post-header">' +
        '<span class="diary-post-author">' + (receipt.title || '') + '</span>' +
        '<span class="diary-post-date">' + formatDate(receipt.created_at) + '</span>' +
      '</div>' +
      imageHtml +
      '<div class="diary-post-body">' +
        '<p class="diary-post-desc">' + (receipt.description || '') + '</p>' +
      '</div>' +
    '</article>';
  }

  function verifyPin(pin) {
    var base = window.Sync ? window.Sync.getServerUrl() : '';
    return fetch(base + '/api/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pin })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) { return data.valid === true; })
    .catch(function () {
      // Fallback offline: accept hardcoded PIN
      return pin === '1234';
    });
  }

  function renderPinScreen(container) {
    container.innerHTML =
      '<div class="page-top-bar">' +
        '<button class="back-circle-btn" id="accounts-back">' + backArrowSvg + '</button>' +
        '<img src="assets/logo.png" alt="IPRA no Ariri" class="page-top-logo" onerror="this.style.display=\'none\'">' +
      '</div>' +
      '<div class="pin-screen">' +
        '<h1 class="pin-title">Prestação de Contas</h1>' +
        '<p class="pin-subtitle">Digite o PIN para acessar</p>' +
        '<input type="password" inputmode="numeric" maxlength="4" pattern="[0-9]*" ' +
          'class="pin-input" id="pin-input" placeholder="••••" autocomplete="off" ' +
          'aria-label="PIN de 4 dígitos">' +
        '<p class="pin-error hidden" id="pin-error">PIN incorreto</p>' +
      '</div>';

    document.getElementById('accounts-back').addEventListener('click', function () {
      window.location.hash = '#/menu';
    });

    var pinInput = document.getElementById('pin-input');
    var pinError = document.getElementById('pin-error');

    pinInput.addEventListener('input', function () {
      pinError.classList.add('hidden');
      if (pinInput.value.length === 4) {
        pinInput.disabled = true;
        verifyPin(pinInput.value).then(function (valid) {
          if (valid) {
            renderReceiptsList(container);
          } else {
            pinError.classList.remove('hidden');
            pinInput.value = '';
            pinInput.disabled = false;
            pinInput.focus();
          }
        });
      }
    });
    pinInput.focus();
  }

  function renderReceiptsList(container) {
    container.innerHTML =
      '<div class="page-top-bar">' +
        '<button class="back-circle-btn" id="accounts-back">' + backArrowSvg + '</button>' +
        '<img src="assets/logo.png" alt="IPRA no Ariri" class="page-top-logo" onerror="this.style.display=\'none\'">' +
      '</div>' +
      '<h2 class="form-page-title">Prestação de contas:</h2>' +
      '<div class="detail-cards">' +
        '<div class="detail-card new-form-card" id="new-receipt-card" role="button" tabindex="0">' +
          '<div class="new-form-card-inner">' +
            '<span class="detail-card-label" style="margin-bottom:0">Adicionar<br>comprovante:</span>' +
            '<button class="add-circle-btn"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div id="receipts-list" class="mt-16"></div>' +
      '<div id="receipts-loading" class="text-center mt-24"><div class="spinner"></div></div>';

    document.getElementById('accounts-back').addEventListener('click', function () {
      window.location.hash = '#/menu';
    });

    var card = document.getElementById('new-receipt-card');
    card.addEventListener('click', function () { window.location.hash = '#/menu/accounts/new'; });

    var base = window.Sync ? window.Sync.getServerUrl() : '';
    var listEl = document.getElementById('receipts-list');
    var loadingEl = document.getElementById('receipts-loading');

    fetch(base + '/api/receipts')
      .then(function (res) { if (!res.ok) throw new Error('err'); return res.json(); })
      .then(function (receipts) {
        loadingEl.classList.add('hidden');
        if (!receipts || receipts.length === 0) {
          listEl.innerHTML = '<div class="empty-state"><p class="empty-state-text">Nenhum comprovante registrado.</p></div>';
          return;
        }
        var html = '<div class="diary-feed-list">';
        receipts.forEach(function (r) { html += buildReceiptCard(r, base); });
        html += '</div>';
        listEl.innerHTML = html;
      })
      .catch(function () {
        loadingEl.classList.add('hidden');
        listEl.innerHTML = '<div class="empty-state"><p class="empty-state-text">Não foi possível carregar os comprovantes.</p></div>';
      });
  }

  window.renderAccountsPage = function (container) { renderPinScreen(container); };
})();
