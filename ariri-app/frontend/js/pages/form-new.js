/**
 * form-new.js — Novo Formulário de Ação e Pessoa Atendida
 *
 * Campos: Ação realizada (checkboxes múltiplos com 12 opções),
 *         Nome completo, Idade, Localidade, Descrição, Imagem (upload)
 * Valida que ao menos uma ação está selecionada antes de enviar.
 * Salva no IndexedDB se offline, envia ao servidor se online.
 * Associa automaticamente o volunteer_name do localStorage.
 *
 * Requisitos: 5.2, 5.3, 5.4, 2.3
 */
(function () {
  'use strict';

  var ACTION_TYPES = [
    'Evangelismo', 'Visitação', 'Oração', 'Aconselhamento',
    'Infantil', 'Manutenção', 'Auxílio ao MEAP', 'Cozinha',
    'Educação', 'Odontologia', 'P. Socorros', 'Outros'
  ];

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
   * Build the checkbox group HTML for action types.
   */
  function buildCheckboxGroup() {
    var html = '<div class="checkbox-group">';
    ACTION_TYPES.forEach(function (action, i) {
      html +=
        '<label class="checkbox-item">' +
          '<input type="checkbox" name="actions" value="' + action + '" id="action-' + i + '">' +
          '<span>' + action + '</span>' +
        '</label>';
    });
    html += '</div>';
    return html;
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
   * Render the new form page into the given container.
   * @param {HTMLElement} container
   */
  function renderNewFormPage(container) {
    var html =
      '<button class="back-btn" id="form-back-btn">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>' +
        'Voltar' +
      '</button>' +
      '<div class="page-header">' +
        '<h1 class="page-title">Novo Formulário</h1>' +
      '</div>' +
      '<form id="new-form" novalidate>' +
        // Ações realizadas
        '<div class="form-group">' +
          '<label class="form-label">Ação realizada</label>' +
          buildCheckboxGroup() +
          '<p class="form-error hidden" id="actions-error">Selecione ao menos uma ação.</p>' +
        '</div>' +
        // Nome completo
        '<div class="form-group">' +
          '<label class="form-label" for="field-full-name">Nome completo</label>' +
          '<input type="text" class="form-input" id="field-full-name" placeholder="Nome da pessoa atendida" autocomplete="off">' +
        '</div>' +
        // Idade
        '<div class="form-group">' +
          '<label class="form-label" for="field-age">Idade</label>' +
          '<input type="number" class="form-input" id="field-age" placeholder="Idade" min="0" max="150" inputmode="numeric">' +
        '</div>' +
        // Localidade
        '<div class="form-group">' +
          '<label class="form-label" for="field-locality">Localidade</label>' +
          '<input type="text" class="form-input" id="field-locality" placeholder="Comunidade ou localidade" autocomplete="off">' +
        '</div>' +
        // Descrição
        '<div class="form-group">' +
          '<label class="form-label" for="field-description">Descrição</label>' +
          '<textarea class="form-textarea" id="field-description" placeholder="Descreva a ação realizada..." rows="4"></textarea>' +
        '</div>' +
        // Imagem
        '<div class="form-group">' +
          '<label class="form-label">Imagem</label>' +
          '<div class="image-upload" id="image-upload-area">' +
            '<svg class="image-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
              '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>' +
              '<circle cx="8.5" cy="8.5" r="1.5"/>' +
              '<polyline points="21 15 16 10 5 21"/>' +
            '</svg>' +
            '<span class="image-upload-text">Toque para adicionar foto</span>' +
            '<input type="file" accept="image/*" id="field-image" aria-label="Upload de imagem">' +
          '</div>' +
        '</div>' +
        // Submit
        '<button type="submit" class="btn btn-primary btn-full" id="form-submit-btn">Enviar</button>' +
      '</form>';

    container.innerHTML = html;

    // --- Wire up events ---

    // Back button
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
        // Show preview
        var existingPreview = uploadArea.querySelector('.image-upload-preview');
        if (existingPreview) existingPreview.remove();

        var img = document.createElement('img');
        img.className = 'image-upload-preview';
        img.src = reader.result;
        img.alt = 'Pré-visualização';
        uploadArea.appendChild(img);
        uploadArea.classList.add('has-preview');

        // Hide icon and text
        var icon = uploadArea.querySelector('.image-upload-icon');
        var text = uploadArea.querySelector('.image-upload-text');
        if (icon) icon.classList.add('hidden');
        if (text) text.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    });

    // Form submission
    var form = document.getElementById('new-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      handleSubmit();
    });
  }


  /**
   * Handle form submission: validate, check connectivity, send or save offline.
   */
  function handleSubmit() {
    var actionsError = document.getElementById('actions-error');
    var submitBtn = document.getElementById('form-submit-btn');

    // 1. Gather selected actions
    var checkboxes = document.querySelectorAll('input[name="actions"]:checked');
    var selectedActions = [];
    checkboxes.forEach(function (cb) {
      selectedActions.push(cb.value);
    });

    // 2. Validate at least one action
    if (selectedActions.length === 0) {
      actionsError.classList.remove('hidden');
      return;
    }
    actionsError.classList.add('hidden');

    // 3. Gather field values
    var fullName = document.getElementById('field-full-name').value.trim();
    var age = document.getElementById('field-age').value;
    var locality = document.getElementById('field-locality').value.trim();
    var description = document.getElementById('field-description').value.trim();
    var imageInput = document.getElementById('field-image');
    var imageFile = imageInput.files && imageInput.files[0];

    // 4. Get volunteer_name from localStorage
    var volunteerName = localStorage.getItem('volunteer_name') || '';

    // 5. Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    // 6. Check connectivity and submit
    var syncAvailable = window.Sync && typeof window.Sync.ping === 'function';

    var connectivityCheck = syncAvailable
      ? window.Sync.ping()
      : Promise.resolve(false);

    connectivityCheck.then(function (isOnline) {
      if (isOnline && imageFile) {
        // Online with image: send as multipart/form-data
        return sendOnline(volunteerName, selectedActions, fullName, age, locality, description, imageFile);
      } else if (isOnline && !imageFile) {
        // Online without image: send as multipart/form-data (no file)
        return sendOnline(volunteerName, selectedActions, fullName, age, locality, description, null);
      } else {
        // Offline: save to IndexedDB
        return saveOffline(volunteerName, selectedActions, fullName, age, locality, description, imageFile);
      }
    }).then(function () {
      showToast('Formulário salvo com sucesso!', false);
      window.location.hash = '#/forms';
    }).catch(function (err) {
      // If online send failed, try saving offline as fallback
      return saveOffline(volunteerName, selectedActions, fullName, age, locality, description, imageFile)
        .then(function () {
          showToast('Sem conexão. Salvo localmente.', false);
          window.location.hash = '#/forms';
        });
    }).catch(function (err) {
      showToast('Erro ao salvar formulário.', true);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar';
    });
  }

  /**
   * Send form data to server via POST /api/forms as multipart/form-data.
   */
  function sendOnline(volunteerName, actions, fullName, age, locality, description, imageFile) {
    var base = window.Sync ? window.Sync.getServerUrl() : '';

    var imagePromise = (imageFile && window.resizeImage)
      ? window.resizeImage(imageFile)
      : Promise.resolve(imageFile);

    return imagePromise.then(function (processedImage) {
      var formData = new FormData();

      formData.append('volunteer_name', volunteerName);
      formData.append('actions', JSON.stringify(actions));
      formData.append('full_name', fullName);
      if (age) formData.append('age', age);
      formData.append('locality', locality);
      formData.append('description', description);
      if (processedImage) formData.append('image', processedImage, 'image.jpg');

      return fetch(base + '/api/forms', {
        method: 'POST',
        body: formData
      }).then(function (res) {
        if (!res.ok) throw new Error('Erro ao enviar formulário: ' + res.status);
        return res.json();
      });
    });
  }

  /**
   * Save form data to IndexedDB for offline sync.
   * Image is stored as base64 data URL.
   */
  function saveOffline(volunteerName, actions, fullName, age, locality, description, imageFile) {
    var resizePromise = (imageFile && window.resizeImage)
      ? window.resizeImage(imageFile)
      : Promise.resolve(imageFile);

    return resizePromise.then(function (processedImage) {
      var dataPromise = processedImage
        ? readFileAsBase64(processedImage)
        : Promise.resolve(null);

      return dataPromise.then(function (imageBase64) {
        var formData = {
          volunteer_name: volunteerName,
          actions: actions,
          full_name: fullName,
          age: age ? parseInt(age, 10) : null,
          locality: locality,
          description: description,
          image: imageBase64
        };

        return window.DB.addPending('pending_forms', {
          type: 'form',
          data: formData
        });
      });
    });
  }

  // Expose globally for app.js router
  window.renderNewFormPage = renderNewFormPage;
})();
