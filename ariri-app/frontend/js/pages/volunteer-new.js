(function () {
  'use strict';
  var backSvg = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="14 8 10 12 14 16"/></svg>';
  var uploadSvg = '<svg class="form-upload-icon" viewBox="0 0 64 64" width="40" height="40" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M44 40c6.6 0 12-4.5 12-10s-5.4-10-12-10c-.7 0-1.4.1-2 .2C40.3 14.1 34.6 10 28 10c-8.8 0-16 6.3-16 14 0 .3 0 .7.1 1C6.5 26.2 2 30.6 2 36c0 6 5.4 10 12 10h6"/><polyline points="24 38 32 30 40 38"/><line x1="32" y1="30" x2="32" y2="52"/></svg>';

  function toast(msg, err) {
    var e = document.querySelector('.toast'); if (e) e.remove();
    var t = document.createElement('div'); t.className = 'toast' + (err ? ' toast-error' : ''); t.textContent = msg; document.body.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.remove(); }, 3000);
  }

  window.renderNewVolunteerPage = function (container) {
    container.innerHTML =
      '<div class="page-top-bar">' +
        '<button class="back-circle-btn" id="vol-back">' + backSvg + '</button>' +
      '</div>' +
      '<h2 class="form-page-title">Novo Voluntário:</h2>' +
      '<form id="vol-form" novalidate>' +
        '<div class="form-section"><p class="form-section-label">Nome completo: *</p>' +
          '<div class="detail-card" style="min-height:auto;padding:14px"><input type="text" class="form-field-underline" id="vol-name" style="border:none" required></div>' +
          '<p class="form-error hidden" id="vol-name-err">Informe o nome.</p></div>' +
        '<div class="form-section"><p class="form-section-label">RG:</p>' +
          '<div class="detail-card" style="min-height:auto;padding:14px"><input type="text" class="form-field-underline" id="vol-rg" style="border:none"></div></div>' +
        '<div class="form-section"><p class="form-section-label">CPF:</p>' +
          '<div class="detail-card" style="min-height:auto;padding:14px"><input type="text" class="form-field-underline" id="vol-cpf" style="border:none"></div></div>' +
        '<div class="form-section"><p class="form-section-label">Data de nascimento:</p>' +
          '<div class="detail-card" style="min-height:auto;padding:14px"><input type="date" class="form-field-underline" id="vol-birth" style="border:none"></div></div>' +
        '<div class="form-section"><p class="form-section-label">Profissão:</p>' +
          '<div class="detail-card" style="min-height:auto;padding:14px"><input type="text" class="form-field-underline" id="vol-profession" style="border:none"></div></div>' +
        '<div class="form-section"><p class="form-section-label">E-mail:</p>' +
          '<div class="detail-card" style="min-height:auto;padding:14px"><input type="email" class="form-field-underline" id="vol-email" style="border:none"></div></div>' +
        '<div class="form-section"><p class="form-section-label">Telefone:</p>' +
          '<div class="detail-card" style="min-height:auto;padding:14px"><input type="tel" class="form-field-underline" id="vol-phone" style="border:none"></div></div>' +
        '<div class="form-section"><p class="form-section-label">Endereço:</p>' +
          '<div class="detail-card" style="min-height:auto;padding:14px"><input type="text" class="form-field-underline" id="vol-address" style="border:none"></div></div>' +
        '<div class="form-section"><p class="form-section-label">Dados médicos:</p>' +
          '<div class="detail-card" style="min-height:auto;padding:14px"><textarea class="form-field-underline" id="vol-medical" rows="3" style="border:none"></textarea></div></div>' +
        '<div class="form-section"><p class="form-section-label">Termos assinados (imagens):</p>' +
          '<div class="form-upload-area" id="vol-terms-area" style="min-height:100px">' + uploadSvg +
            '<input type="file" accept="image/*" id="vol-terms" multiple></div>' +
          '<div id="vol-terms-preview" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px"></div></div>' +
        '<button type="submit" class="form-submit-btn" id="vol-sub">Cadastrar</button>' +
      '</form>';

    document.getElementById('vol-back').addEventListener('click', function () { window.location.hash = '#/menu/team'; });

    // Terms preview (multiple images)
    var termsInput = document.getElementById('vol-terms');
    var previewDiv = document.getElementById('vol-terms-preview');
    termsInput.addEventListener('change', function () {
      previewDiv.innerHTML = '';
      var files = termsInput.files;
      for (var i = 0; i < files.length; i++) {
        (function (file) {
          var reader = new FileReader();
          reader.onload = function () {
            var img = document.createElement('img');
            img.src = reader.result;
            img.style.cssText = 'width:60px;height:60px;object-fit:cover;border-radius:8px';
            previewDiv.appendChild(img);
          };
          reader.readAsDataURL(file);
        })(files[i]);
      }
      if (files.length > 0) {
        var icon = document.getElementById('vol-terms-area').querySelector('.form-upload-icon');
        if (icon) icon.classList.add('hidden');
      }
    });

    document.getElementById('vol-form').addEventListener('submit', function (e) { e.preventDefault(); doSubmit(); });
  };

  function doSubmit() {
    var nameErr = document.getElementById('vol-name-err'), btn = document.getElementById('vol-sub');
    var name = document.getElementById('vol-name').value.trim();
    if (!name) { nameErr.classList.remove('hidden'); return; }
    nameErr.classList.add('hidden');

    btn.disabled = true; btn.textContent = 'Cadastrando...';

    var base = window.Sync ? window.Sync.getServerUrl() : '';
    var fd = new FormData();
    fd.append('full_name', name);
    fd.append('rg', document.getElementById('vol-rg').value.trim());
    fd.append('cpf', document.getElementById('vol-cpf').value.trim());
    fd.append('birth_date', document.getElementById('vol-birth').value);
    fd.append('profession', document.getElementById('vol-profession').value.trim());
    fd.append('email', document.getElementById('vol-email').value.trim());
    fd.append('phone', document.getElementById('vol-phone').value.trim());
    fd.append('address', document.getElementById('vol-address').value.trim());
    fd.append('medical_data', document.getElementById('vol-medical').value.trim());

    var termsFiles = document.getElementById('vol-terms').files;
    for (var i = 0; i < termsFiles.length; i++) {
      fd.append('terms', termsFiles[i]);
    }

    fetch(base + '/api/volunteers', { method: 'POST', body: fd })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function () {
        toast('Voluntário cadastrado!', false);
        window.location.hash = '#/menu/team';
      })
      .catch(function (err) {
        console.error('Volunteer submit error:', err);
        toast('Erro ao cadastrar. Verifique a conexão.', true);
        btn.disabled = false; btn.textContent = 'Cadastrar';
      });
  }
})();
