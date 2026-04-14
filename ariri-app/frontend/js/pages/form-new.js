/**
 * form-new.js — Novo Formulário de Ação
 *
 * Layout: botão voltar + logo no topo, "Formulário:" título,
 * checkboxes em grid 3 colunas, descrição, pessoas atendidas,
 * imagem (upload com ícone nuvem), botão "Enviar".
 *
 * Requisitos: 5.2, 5.3, 5.4, 2.3
 */
(function () {
  'use strict';

  var ACTION_TYPES = [
    'Evangelismo', 'Infantil', 'Educação',
    'Visitação', 'Manutenção', 'Odontologia',
    'Oração', 'Auxílio ao MEAP', 'P. Socorros',
    'Aconselhamento', 'Cozinha', 'Outros'
  ];

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

  function buildCheckboxGrid() {
    var html = '<div class="form-checkbox-grid">';
    ACTION_TYPES.forEach(function (action, i) {
      html +=
        '<label class="form-check-item">' +
          '<input type="checkbox" name="actions" value="' + action + '">' +
          '<span>' + action + '</span>' +
        '</label>';
    });
    html += '</div>';
    return html;
  }

  function renderNewFormPage(container) {
    var html =
      '<div class="page-top-bar">' +
        '<button class="back-circle-btn" id="form-back-btn">' + backArrowSvg + '</button>' +
        '<img src="assets/logo.png" alt="IPRA no Ariri" class="page-top-logo" onerror="this.style.display=\'none\'">' +
      '</div>' +
      '<h2 class="form-page-title">Formulário:</h2>' +
      '<form id="new-form" novalidate>' +
        '<div class="form-section">' +
          '<p class="form-section-label">Ação realizada:</p>' +
          buildCheckboxGrid() +
          '<p class="form-error hidden" id="actions-error">Selecione ao menos uma ação.</p>' +
        '</div>' +
        '<div class="form-section">' +
          '<p class="form-section-label">Descrição:</p>' +
          '<textarea class="form-field-underline" id="field-description" rows="5" placeholder=""></textarea>' +
        '</div>' +
        '<div class="form-section">' +
          '<p class="form-section-label">Pessoas atendidas:</p>' +
          '<input type="number" class="form-field-underline" id="field-people-served" min="1" value="1" inputmode="numeric" style="max-width:120px">' +
        '</div>' +
        '<div class="form-section">' +
          '<p class="form-section-label">Imagem:</p>' +
          '<div class="form-upload-area" id="image-upload-area">' +
            uploadSvg +
            '<input type="file" accept="image/*" id="field-image" aria-label="Upload de imagem">' +
          '</div>' +
        '</div>' +
        '<button type="submit" class="form-submit-btn" id="form-submit-btn">Enviar</button>' +
      '</form>';

    container.innerHTML = html;

    document.getElementById('form-back-btn').addEventListener('click', function () {
      window.location.hash = '#/forms';
    });

    // Image preview
    var imageInput = document.getElementById('field-image');
    var uploadArea = document.getElementById('image-upload-area');
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

    document.getElementById('new-form').addEventListener('submit', function (e) {
      e.preventDefault();
      handleSubmit();
    });
  }

  function handleSubmit() {
    var actionsError = document.getElementById('actions-error');
    var submitBtn = document.getElementById('form-submit-btn');

    var checkboxes = document.querySelectorAll('input[name="actions"]:checked');
    var selectedActions = [];
    checkboxes.forEach(function (cb) { selectedActions.push(cb.value); });

    if (selectedActions.length === 0) {
      actionsError.classList.remove('hidden');
      return;
    }
    actionsError.classList.add('hidden');

    var description = document.getElementById('field-description').value.trim();
    var peopleServed = document.getElementById('field-people-served').value || '1';
    var imageInput = document.getElementById('field-image');
    var imageFile = imageInput.files && imageInput.files[0];
    var volunteerName = localStorage.getItem('volunteer_name') || '';

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    var syncAvailable = window.Sync && typeof window.Sync.ping === 'function';
    var connectivityCheck = syncAvailable ? window.Sync.ping() : Promise.resolve(false);

    connectivityCheck.then(function (isOnline) {
      if (isOnline) {
        return sendOnline(volunteerName, selectedActions, description, peopleServed, imageFile);
      } else {
        return saveOffline(volunteerName, selectedActions, description, peopleServed, imageFile);
      }
    }).then(function () {
      showToast('Formulário salvo com sucesso!', false);
      window.location.hash = '#/forms';
    }).catch(function () {
      return saveOffline(volunteerName, selectedActions, description, peopleServed, imageFile)
        .then(function () {
          showToast('Sem conexão. Salvo localmente.', false);
          window.location.hash = '#/forms';
        });
    }).catch(function () {
      showToast('Erro ao salvar formulário.', true);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar';
    });
  }

  function sendOnline(volunteerName, actions, description, peopleServed, imageFile) {
    var base = window.Sync ? window.Sync.getServerUrl() : '';
    var imagePromise = (imageFile && window.resizeImage)
      ? window.resizeImage(imageFile) : Promise.resolve(imageFile);

    return imagePromise.then(function (processed) {
      var fd = new FormData();
      fd.append('volunteer_name', volunteerName);
      fd.append('actions', JSON.stringify(actions));
      fd.append('description', description);
      fd.append('people_served', peopleServed);
      if (processed) fd.append('image', processed, 'image.jpg');
      return fetch(base + '/api/forms', { method: 'POST', body: fd })
        .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); });
    });
  }

  function saveOffline(volunteerName, actions, description, peopleServed, imageFile) {
    var resizePromise = (imageFile && window.resizeImage)
      ? window.resizeImage(imageFile) : Promise.resolve(imageFile);
    return resizePromise.then(function (processed) {
      var dataPromise = processed ? readFileAsBase64(processed) : Promise.resolve(null);
      return dataPromise.then(function (imageBase64) {
        return window.DB.addPending('pending_forms', {
          type: 'form',
          data: {
            volunteer_name: volunteerName,
            actions: actions,
            description: description,
            people_served: parseInt(peopleServed, 10) || 1,
            image: imageBase64
          }
        });
      });
    });
  }

  window.renderNewFormPage = renderNewFormPage;
})();
