/**
 * receipt-new.js — Novo Comprovante (Prestação de Contas)
 *
 * Campos: Título, Descrição, Imagem do comprovante (upload), botão "Enviar"
 * Salva no IndexedDB se offline, envia ao servidor se online.
 *
 * Requisitos: 8.4
 */
(function () {
  'use strict';

  /**
   * Read a File as base64 data URL.
   * @param {File} file
   * @returns {Promise<string>}
   */
  function readFileAsBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(new Error('Erro ao ler imagem')); };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Show a toast message at the bottom of the screen.
   * @param {string} message
   * @param {boolean} isError
   */
  function showToast(message, isError) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'toast' + (isError ? ' toast-error' : '');
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function () {
      if (toast.parentNode) toast.remove();
    }, 3000);
  }

  /**
   * Render the new receipt page into the given container.
   * @param {HTMLElement} container
   */
  function renderNewReceiptPage(container) {
    var html =
      '<button class="back-btn" id="receipt-back-btn">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>' +
        'Voltar' +
      '</button>' +
      '<div class="page-header">' +
        '<h1 class="page-title">Novo Comprovante</h1>' +
      '</div>' +
      '<form id="new-receipt-form" novalidate>' +
        // Título
        '<div class="form-group">' +
          '<label class="form-label" for="receipt-title">Título</label>' +
          '<input type="text" class="form-input" id="receipt-title" placeholder="Título do comprovante" autocomplete="off" required>' +
          '<p class="form-error hidden" id="receipt-title-error">Informe o título do comprovante.</p>' +
        '</div>' +
        // Descrição
        '<div class="form-group">' +
          '<label class="form-label" for="receipt-description">Descrição</label>' +
          '<textarea class="form-textarea" id="receipt-description" placeholder="Descreva o comprovante..." rows="5"></textarea>' +
        '</div>' +
        // Imagem
        '<div class="form-group">' +
          '<label class="form-label">Imagem do comprovante</label>' +
          '<div class="image-upload" id="receipt-image-upload-area">' +
            '<svg class="image-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
              '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>' +
              '<circle cx="8.5" cy="8.5" r="1.5"/>' +
              '<polyline points="21 15 16 10 5 21"/>' +
            '</svg>' +
            '<span class="image-upload-text">Toque para adicionar foto</span>' +
            '<input type="file" accept="image/*" id="receipt-image" aria-label="Upload de imagem do comprovante">' +
          '</div>' +
        '</div>' +
        // Submit
        '<button type="submit" class="btn btn-primary btn-full" id="receipt-submit-btn">Enviar</button>' +
      '</form>';

    container.innerHTML = html;

    // --- Wire up events ---

    // Back button
    document.getElementById('receipt-back-btn').addEventListener('click', function () {
      window.location.hash = '#/menu/accounts';
    });

    // Image preview
    var imageInput = document.getElementById('receipt-image');
    var uploadArea = document.getElementById('receipt-image-upload-area');

    imageInput.addEventListener('change', function () {
      var file = imageInput.files && imageInput.files[0];
      if (!file) return;

      var reader = new FileReader();
      reader.onload = function () {
        var existingPreview = uploadArea.querySelector('.image-upload-preview');
        if (existingPreview) existingPreview.remove();

        var img = document.createElement('img');
        img.className = 'image-upload-preview';
        img.src = reader.result;
        img.alt = 'Pré-visualização';
        uploadArea.appendChild(img);
        uploadArea.classList.add('has-preview');

        var icon = uploadArea.querySelector('.image-upload-icon');
        var text = uploadArea.querySelector('.image-upload-text');
        if (icon) icon.classList.add('hidden');
        if (text) text.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    });

    // Form submission
    var form = document.getElementById('new-receipt-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      handleSubmit();
    });
  }

  /**
   * Handle receipt submission: validate, check connectivity, send or save offline.
   */
  function handleSubmit() {
    var titleError = document.getElementById('receipt-title-error');
    var submitBtn = document.getElementById('receipt-submit-btn');

    // 1. Gather field values
    var title = document.getElementById('receipt-title').value.trim();
    var description = document.getElementById('receipt-description').value.trim();
    var imageInput = document.getElementById('receipt-image');
    var imageFile = imageInput.files && imageInput.files[0];

    // 2. Validate title is not empty
    if (!title) {
      titleError.classList.remove('hidden');
      return;
    }
    titleError.classList.add('hidden');

    // 3. Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    // 4. Check connectivity and submit
    var syncAvailable = window.Sync && typeof window.Sync.ping === 'function';

    var connectivityCheck = syncAvailable
      ? window.Sync.ping()
      : Promise.resolve(false);

    connectivityCheck.then(function (isOnline) {
      if (isOnline) {
        return sendOnline(title, description, imageFile);
      } else {
        return saveOffline(title, description, imageFile);
      }
    }).then(function () {
      showToast('Comprovante enviado com sucesso!', false);
      window.location.hash = '#/menu/accounts';
    }).catch(function () {
      // If online send failed, try saving offline as fallback
      return saveOffline(title, description, imageFile)
        .then(function () {
          showToast('Sem conexão. Salvo localmente.', false);
          window.location.hash = '#/menu/accounts';
        });
    }).catch(function () {
      showToast('Erro ao enviar comprovante.', true);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar';
    });
  }

  /**
   * Send receipt data to server via POST /api/receipts as multipart/form-data.
   */
  function sendOnline(title, description, imageFile) {
    var base = window.Sync ? window.Sync.getServerUrl() : '';

    var imagePromise = (imageFile && window.resizeImage)
      ? window.resizeImage(imageFile)
      : Promise.resolve(imageFile);

    return imagePromise.then(function (processedImage) {
      var formData = new FormData();

      formData.append('title', title);
      formData.append('description', description);
      if (processedImage) formData.append('image', processedImage, 'image.jpg');

      return fetch(base + '/api/receipts', {
        method: 'POST',
        body: formData
      }).then(function (res) {
        if (!res.ok) throw new Error('Erro ao enviar comprovante: ' + res.status);
        return res.json();
      });
    });
  }

  /**
   * Save receipt data to IndexedDB for offline sync.
   * Image is stored as base64 data URL.
   */
  function saveOffline(title, description, imageFile) {
    var resizePromise = (imageFile && window.resizeImage)
      ? window.resizeImage(imageFile)
      : Promise.resolve(imageFile);

    return resizePromise.then(function (processedImage) {
      var dataPromise = processedImage
        ? readFileAsBase64(processedImage)
        : Promise.resolve(null);

      return dataPromise.then(function (imageBase64) {
        var receiptData = {
          title: title,
          description: description,
          image: imageBase64
        };

        return window.DB.addPending('pending_receipts', {
          type: 'receipt',
          data: receiptData
        });
      });
    });
  }

  // Expose globally for app.js router
  window.renderNewReceiptPage = renderNewReceiptPage;
})();