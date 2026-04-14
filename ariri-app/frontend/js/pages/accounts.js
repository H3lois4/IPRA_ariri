/**
 * accounts.js — Página de Prestação de Contas
 *
 * Solicita PIN de 4 dígitos antes de exibir conteúdo.
 * Após validação, exibe lista de comprovantes (título, data, imagem, descrição)
 * e botão "+ Adicionar comprovante".
 *
 * Requisitos: 8.1, 8.2, 8.3
 */
(function () {
  'use strict';

  var CORRECT_PIN = '1234';

  /**
   * Format an ISO date string to Brazilian format.
   * @param {string} isoStr
   * @returns {string}
   */
  function formatDate(isoStr) {
    if (!isoStr) return '';
    try {
      var d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      var day = String(d.getDate()).padStart(2, '0');
      var month = String(d.getMonth() + 1).padStart(2, '0');
      var year = d.getFullYear();
      return day + '/' + month + '/' + year;
    } catch (e) {
      return isoStr;
    }
  }

  /**
   * Build HTML for a single receipt card.
   * @param {object} receipt
   * @param {string} baseUrl
   * @returns {string}
   */
  function buildReceiptCard(receipt, baseUrl) {
    var imageHtml = '';
    if (receipt.image_path) {
      var imageUrl = baseUrl + '/uploads/' + receipt.image_path;
      imageHtml = '<img class="receipt-card-image" src="' + imageUrl + '" alt="Comprovante" loading="lazy">';
    }

    return (
      '<article class="receipt-card">' +
        imageHtml +
        '<div class="receipt-card-body">' +
          '<h2 class="receipt-title">' + (receipt.title || '') + '</h2>' +
          '<p class="receipt-date">' + formatDate(receipt.created_at) + '</p>' +
          '<p class="receipt-description">' + (receipt.description || '') + '</p>' +
        '</div>' +
      '</article>'
    );
  }

  /**
   * Render the PIN screen.
   * @param {HTMLElement} container
   */
  function renderPinScreen(container) {
    container.innerHTML =
      '<button class="back-btn" id="accounts-back-btn">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>' +
        'Voltar' +
      '</button>' +
      '<div class="pin-screen">' +
        '<h1 class="pin-title">Prestação de Contas</h1>' +
        '<p class="pin-subtitle">Digite o PIN para acessar</p>' +
        '<input type="password" inputmode="numeric" maxlength="4" pattern="[0-9]*" ' +
          'class="pin-input" id="pin-input" placeholder="••••" autocomplete="off" ' +
          'aria-label="PIN de 4 dígitos">' +
        '<p class="pin-error hidden" id="pin-error">PIN incorreto</p>' +
      '</div>';

    document.getElementById('accounts-back-btn').addEventListener('click', function () {
      window.location.hash = '#/menu';
    });

    var pinInput = document.getElementById('pin-input');
    var pinError = document.getElementById('pin-error');

    pinInput.addEventListener('input', function () {
      // Hide error on new input
      pinError.classList.add('hidden');

      if (pinInput.value.length === 4) {
        if (pinInput.value === CORRECT_PIN) {
          renderReceiptsList(container);
        } else {
          pinError.classList.remove('hidden');
          pinInput.value = '';
        }
      }
    });

    pinInput.focus();
  }

  /**
   * Render the receipts list after PIN validation.
   * @param {HTMLElement} container
   */
  function renderReceiptsList(container) {
    container.innerHTML =
      '<button class="back-btn" id="accounts-back-btn">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>' +
        'Voltar' +
      '</button>' +
      '<div class="page-header">' +
        '<h1 class="page-title">Prestação de Contas</h1>' +
      '</div>' +
      '<button class="btn btn-primary btn-full" id="new-receipt-btn">+ Adicionar comprovante</button>' +
      '<div id="receipts-list" class="mt-16"></div>' +
      '<div id="receipts-loading" class="text-center mt-24"><div class="spinner"></div></div>';

    document.getElementById('accounts-back-btn').addEventListener('click', function () {
      window.location.hash = '#/menu';
    });

    document.getElementById('new-receipt-btn').addEventListener('click', function () {
      window.location.hash = '#/menu/accounts/new';
    });

    var base = window.Sync ? window.Sync.getServerUrl() : '';
    var listEl = document.getElementById('receipts-list');
    var loadingEl = document.getElementById('receipts-loading');

    fetch(base + '/api/receipts')
      .then(function (res) {
        if (!res.ok) throw new Error('Erro ao carregar comprovantes');
        return res.json();
      })
      .then(function (receipts) {
        loadingEl.classList.add('hidden');

        if (!receipts || receipts.length === 0) {
          listEl.innerHTML =
            '<div class="empty-state">' +
              '<svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
                '<rect x="2" y="3" width="20" height="18" rx="2"/>' +
                '<line x1="2" y1="9" x2="22" y2="9"/>' +
              '</svg>' +
              '<p class="empty-state-text">Nenhum comprovante registrado.</p>' +
            '</div>';
          return;
        }

        var html = '';
        receipts.forEach(function (receipt) {
          html += buildReceiptCard(receipt, base);
        });
        listEl.innerHTML = html;
      })
      .catch(function () {
        loadingEl.classList.add('hidden');
        listEl.innerHTML =
          '<div class="empty-state">' +
            '<p class="empty-state-text">Não foi possível carregar os comprovantes.<br>Verifique a conexão.</p>' +
          '</div>';
      });
  }

  /**
   * Main render function for the accounts page.
   * @param {HTMLElement} container
   */
  function renderAccountsPage(container) {
    renderPinScreen(container);
  }

  // Expose globally for app.js router
  window.renderAccountsPage = renderAccountsPage;
})();
