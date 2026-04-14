/**
 * post-new.js — Nova Postagem do Diário de Bordo
 *
 * Layout: botão voltar + logo no topo, campos com estilo underline,
 * upload com ícone nuvem, botão "Publicar" arredondado.
 *
 * Requisitos: 7.2, 7.3
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

  function renderNewPostPage(container) {
    var html =
      '<div class="page-top-bar">' +
        '<button class="back-circle-btn" id="post-back-btn">' + backArrowSvg + '</button>' +
        '<img src="assets/logo.png" alt="IPRA no Ariri" class="page-top-logo" onerror="this.style.display=\'none\'">' +
      '</div>' +
      '<h2 class="form-page-title">Nova Postagem:</h2>' +
      '<form id="new-post-form" novalidate>' +
        '<div class="form-section form-row-pair">' +
          '<div class="form-row-half">' +
            '<p class="form-section-label">Nome:</p>' +
            '<input type="text" class="form-field-box" id="post-author-name" autocomplete="off">' +
          '</div>' +
          '<div class="form-row-half">' +
            '<p class="form-section-label">Data:</p>' +
            '<input type="text" class="form-field-box" id="post-date" readonly>' +
          '</div>' +
        '</div>' +
        '<div class="form-section">' +
          '<p class="form-section-label">Título:</p>' +
          '<input type="text" class="form-field-underline" id="post-title" autocomplete="off" required>' +
          '<p class="form-error hidden" id="title-error">Informe o título da postagem.</p>' +
        '</div>' +
        '<div class="form-section">' +
          '<p class="form-section-label">Descrição:</p>' +
          '<textarea class="form-field-underline" id="post-description" rows="5"></textarea>' +
        '</div>' +
        '<div class="form-section">' +
          '<p class="form-section-label">Imagem:</p>' +
          '<div class="form-upload-area" id="post-image-upload-area">' +
            uploadSvg +
            '<input type="file" accept="image/*" id="post-image" aria-label="Upload de imagem">' +
          '</div>' +
        '</div>' +
        '<button type="submit" class="form-submit-btn" id="post-submit-btn">Publicar</button>' +
      '</form>';

    container.innerHTML = html;

    // Pre-fill name from localStorage and current date
    var nameInput = document.getElementById('post-author-name');
    var dateInput = document.getElementById('post-date');
    var savedName = localStorage.getItem('volunteer_name') || '';
    nameInput.value = savedName;

    var now = new Date();
    var dd = String(now.getDate()).padStart(2, '0');
    var mm = String(now.getMonth() + 1).padStart(2, '0');
    var yyyy = now.getFullYear();
    var hh = String(now.getHours()).padStart(2, '0');
    var min = String(now.getMinutes()).padStart(2, '0');
    dateInput.value = dd + '/' + mm + '/' + yyyy + ' ' + hh + ':' + min;

    document.getElementById('post-back-btn').addEventListener('click', function () {
      window.location.hash = '#/diary';
    });

    var imageInput = document.getElementById('post-image');
    var uploadArea = document.getElementById('post-image-upload-area');
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

    document.getElementById('new-post-form').addEventListener('submit', function (e) {
      e.preventDefault();
      handleSubmit();
    });
  }

  function handleSubmit() {
    var titleError = document.getElementById('title-error');
    var submitBtn = document.getElementById('post-submit-btn');
    var title = document.getElementById('post-title').value.trim();
    var description = document.getElementById('post-description').value.trim();
    var imageInput = document.getElementById('post-image');
    var imageFile = imageInput.files && imageInput.files[0];

    if (!title) { titleError.classList.remove('hidden'); return; }
    titleError.classList.add('hidden');

    var volunteerName = document.getElementById('post-author-name').value.trim() || localStorage.getItem('volunteer_name') || '';
    // Save name back to localStorage if changed
    if (volunteerName) localStorage.setItem('volunteer_name', volunteerName);
    submitBtn.disabled = true;
    submitBtn.textContent = 'Publicando...';

    var syncAvailable = window.Sync && typeof window.Sync.ping === 'function';
    var check = syncAvailable ? window.Sync.ping() : Promise.resolve(false);

    check.then(function (isOnline) {
      return isOnline
        ? sendOnline(volunteerName, title, description, imageFile)
        : saveOffline(volunteerName, title, description, imageFile);
    }).then(function () {
      showToast('Postagem publicada!', false);
      window.location.hash = '#/diary';
    }).catch(function () {
      return saveOffline(volunteerName, title, description, imageFile).then(function () {
        showToast('Sem conexão. Salvo localmente.', false);
        window.location.hash = '#/diary';
      });
    }).catch(function () {
      showToast('Erro ao publicar.', true);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Publicar';
    });
  }

  function sendOnline(volunteerName, title, description, imageFile) {
    var base = window.Sync ? window.Sync.getServerUrl() : '';
    var imgP = (imageFile && window.resizeImage) ? window.resizeImage(imageFile) : Promise.resolve(imageFile);
    return imgP.then(function (processed) {
      var fd = new FormData();
      fd.append('volunteer_name', volunteerName);
      fd.append('title', title);
      fd.append('description', description);
      if (processed) fd.append('image', processed, 'image.jpg');
      return fetch(base + '/api/posts', { method: 'POST', body: fd })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    });
  }

  function saveOffline(volunteerName, title, description, imageFile) {
    var resP = (imageFile && window.resizeImage) ? window.resizeImage(imageFile) : Promise.resolve(imageFile);
    return resP.then(function (processed) {
      var dataP = processed ? readFileAsBase64(processed) : Promise.resolve(null);
      return dataP.then(function (b64) {
        return window.DB.addPending('pending_posts', {
          type: 'post',
          data: { volunteer_name: volunteerName, title: title, description: description, image: b64 }
        });
      });
    });
  }

  window.renderNewPostPage = renderNewPostPage;
})();
