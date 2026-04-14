/**
 * receipt-new.js — Novo Comprovante (Prestação de Contas)
 *
 * Layout: botão voltar + logo no topo, "Novo comprovante:" título,
 * campos Título, Descrição, Comprovante (upload), botão "Enviar".
 *
 * Requisitos: 8.4
 */
(function () {
  'use strict';

  var backArrowSvg =
    '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="12" cy="12" r="10"/><polyline points="14 8 10 12 14 16"/></svg>';

  var uploadSvg =
    '<svg class="form-upload-icon" viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M44 40c6.6 0 12-4.5 12-10s-5.4-10-12-10c-.7 0-1.4.1-2 .2C40.3 14.1 34.6 10 28 10c-8.8 0-16 6.3-16 14 0 .3 0 .7.1 1C6.5 26.2 2 30.6 2 36c0 6 5.4 10 12 10h6"/>' +
      '<polyline points="24 38 32 30 40 38"/>' +
      '<line x1="32" y1="30" x2="32" y2="52"/>' +
    '</svg>';

  function readFileAsBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(new Error('Erro ao ler imagem')); };
      reader.readAsDataURL(file);
    });
  }

  function showToast(message, isError) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'toast' + (isError ? ' toast-error' : '');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () { if (toast.parentNode) toast.remove(); }, 3000);
  }

  function renderNewReceiptPage(container) {
    var html =
      '<div class="page-top-bar">' +
        '<button class="back-circle-btn" id="receipt-back-btn">' + backArrowSvg + '</button>' +
        '<img src="assets/logo.png" alt="IPRA no Ariri" class="page-top-logo" onerror="this.style.display=\'none\'">' +
      '</div>' +
      '<h2 class="form-page-title">Novo comprovante:</h2>' +
      '<form id="new-receipt-form" novalidate>' +
        '<div class="form-section">' +
          '<p class="form-section-label">Título:</p>' +
          '<input type="text" class="form-field-box" id="receipt-title" autocomplete="off" required>' +
          '<p class="form-error hidden" id="receipt-title-error">Informe o título do comprovante.</p>' +
        '</div>' +
        '<div class="form-section">' +
          '<p class="form-section-label">Descrição:</p>' +
          '<textarea class="form-field-box" id="receipt-description" rows="5" style="resize:vertical;min-height:100px"></textarea>' +
        '</div>' +
        '<div class="form-section">' +
          '<p class="form-section-label">Comprovante:</p>' +
          '<div class="form-upload-area" id="receipt-image-upload-area">' +
            uploadSvg +
            '<input type="file" accept="image/*" id="receipt-image" aria-label="Upload de comprovante">' +
          '</div>' +
        '</div>' +
        '<button type="submit" class="form-submit-btn" id="receipt-submit-btn">Enviar</button>' +
      '</form>';

    container.innerHTML = html;

    document.getElementById('receipt-back-btn').addEventListener('click', function () {
      window.location.hash = '#/menu/accounts';
    });

    var imageInput = document.getElementById('receipt-image');
    var uploadArea = document.getElementById('receipt-image-upload-area');
    imageInput.addEventListener('change', function () {
      var file = imageInput.files && imageInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var prev = uploadArea.querySelector('.image-upload-preview');
        if (prev) prev.remove();
        var img = document.createElement('img');
        img.className = 'image-upload-preview';
        img.src = reader.result;
        img.alt = 'Pré-visualização';
        uploadArea.appendChild(img);
        uploadArea.classList.add('has-preview');
        var icon = uploadArea.querySelector('.form-upload-icon');
        if (icon) icon.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('new-receipt-form').addEventListener('submit', function (e) {
      e.preventDefault();
      handleSubmit();
    });
  }

  function handleSubmit() {
    var titleError = document.getElementById('receipt-title-error');
    var submitBtn = document.getElementById('receipt-submit-btn');
    var title = document.getElementById('receipt-title').value.trim();
    var description = document.getElementById('receipt-description').value.trim();
    var imageInput = document.getElementById('receipt-image');
    var imageFile = imageInput.files && imageInput.files[0];

    if (!title) { titleError.classList.remove('hidden'); return; }
    titleError.classList.add('hidden');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    var syncAvailable = window.Sync && typeof window.Sync.ping === 'function';
    var check = syncAvailable ? window.Sync.ping() : Promise.resolve(false);

    check.then(function (isOnline) {
      return isOnline
        ? sendOnline(title, description, imageFile)
        : saveOffline(title, description, imageFile);
    }).then(function () {
      showToast('Comprovante enviado!', false);
      window.location.hash = '#/menu/accounts';
    }).catch(function () {
      return saveOffline(title, description, imageFile).then(function () {
        showToast('Sem conexão. Salvo localmente.', false);
        window.location.hash = '#/menu/accounts';
      });
    }).catch(function () {
      showToast('Erro ao enviar comprovante.', true);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar';
    });
  }

  function sendOnline(title, description, imageFile) {
    var base = window.Sync ? window.Sync.getServerUrl() : '';
    var imgP = (imageFile && window.resizeImage) ? window.resizeImage(imageFile) : Promise.resolve(imageFile);
    return imgP.then(function (processed) {
      var fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      if (processed) fd.append('image', processed, 'image.jpg');
      return fetch(base + '/api/receipts', { method: 'POST', body: fd })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    });
  }

  function saveOffline(title, description, imageFile) {
    var resP = (imageFile && window.resizeImage) ? window.resizeImage(imageFile) : Promise.resolve(imageFile);
    return resP.then(function (processed) {
      var dataP = processed ? readFileAsBase64(processed) : Promise.resolve(null);
      return dataP.then(function (b64) {
        return window.DB.addPending('pending_receipts', {
          type: 'receipt',
          data: { title: title, description: description, image: b64 }
        });
      });
    });
  }

  window.renderNewReceiptPage = renderNewReceiptPage;
})();
