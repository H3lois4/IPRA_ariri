/**
 * volunteer-profile.js — Página de perfil completo do voluntário
 *
 * Exibe perfil completo: foto, nome, RG, CPF, data de nascimento,
 * sexo, profissão, e-mail, telefone, endereço, termos e dados médicos.
 * Busca dados via GET /api/volunteers/{id}.
 *
 * Requisitos: 9.4
 */
(function () {
  'use strict';

  /**
   * Format an ISO date string (YYYY-MM-DD) to DD/MM/YYYY.
   * @param {string|null} dateStr
   * @returns {string}
   */
  function formatDate(dateStr) {
    if (!dateStr) return '—';
    var parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  /**
   * Escape HTML special characters.
   * @param {string} str
   * @returns {string}
   */
  function esc(str) {
    if (!str) return '—';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Build a single profile field row.
   * @param {string} label
   * @param {string} value
   * @returns {string}
   */
  function buildField(label, value) {
    return (
      '<div class="profile-field">' +
        '<span class="profile-field-label">' + esc(label) + '</span>' +
        '<span class="profile-field-value">' + (value || '—') + '</span>' +
      '</div>'
    );
  }

  /**
   * Build a document link/image element for terms or medical data.
   * @param {string|null} path
   * @param {string} baseUrl
   * @param {string} altText
   * @returns {string}
   */
  function buildDocumentLink(path, baseUrl, altText) {
    if (!path) return '—';
    var url = baseUrl + '/uploads/' + path;
    var ext = path.split('.').pop().toLowerCase();
    var imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

    if (imageExts.indexOf(ext) !== -1) {
      return '<a href="' + url + '" target="_blank" rel="noopener">' +
        '<img src="' + url + '" alt="' + esc(altText) + '" ' +
        'style="max-width:100%;border-radius:8px;margin-top:4px" loading="lazy">' +
      '</a>';
    }
    return '<a href="' + url + '" target="_blank" rel="noopener" ' +
      'class="btn btn-secondary btn-full mt-8">Ver documento</a>';
  }

  /**
   * Render the volunteer profile page.
   * @param {HTMLElement} container
   * @param {object} params - Route params with params.id
   */
  function renderVolunteerProfilePage(container, params) {
    var volunteerId = params && params.id;

    // Back button + loading state
    container.innerHTML =
      '<button class="back-btn" id="profile-back-btn">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>' +
        'Voltar' +
      '</button>' +
      '<div id="profile-content">' +
        '<div class="spinner"></div>' +
      '</div>';

    document.getElementById('profile-back-btn').addEventListener('click', function () {
      window.location.hash = '#/menu/team';
    });

    if (!volunteerId) {
      document.getElementById('profile-content').innerHTML =
        '<div class="empty-state">' +
          '<p class="empty-state-text">Voluntário não encontrado.</p>' +
        '</div>';
      return;
    }

    var base = window.Sync ? window.Sync.getServerUrl() : '';

    fetch(base + '/api/volunteers/' + encodeURIComponent(volunteerId))
      .then(function (res) {
        if (!res.ok) throw new Error('not_found');
        return res.json();
      })
      .then(function (v) {
        var contentEl = document.getElementById('profile-content');
        if (!contentEl) return;

        // Avatar
        var avatarHtml;
        if (v.profile_image) {
          var imgUrl = base + '/uploads/' + v.profile_image;
          avatarHtml = '<img class="profile-avatar" src="' + imgUrl + '" alt="' + esc(v.full_name) + '" loading="lazy">';
        } else {
          var initial = (v.full_name || '?').charAt(0).toUpperCase();
          avatarHtml = '<div class="profile-avatar">' + initial + '</div>';
        }

        var html =
          // Profile header
          '<div class="profile-header">' +
            avatarHtml +
            '<h1 class="profile-name">' + esc(v.full_name) + '</h1>' +
          '</div>' +

          // Personal info section
          '<div class="profile-section">' +
            '<h2 class="profile-section-title">Dados Pessoais</h2>' +
            buildField('RG', esc(v.rg)) +
            buildField('CPF', esc(v.cpf)) +
            buildField('Data de Nascimento', formatDate(v.birth_date)) +
            buildField('Sexo', esc(v.gender)) +
            buildField('Profissão', esc(v.profession)) +
          '</div>' +

          // Contact section
          '<div class="profile-section">' +
            '<h2 class="profile-section-title">Contato</h2>' +
            buildField('E-mail', esc(v.email)) +
            buildField('Telefone', esc(v.phone)) +
            buildField('Endereço', esc(v.address)) +
          '</div>' +

          // Documents section
          '<div class="profile-section">' +
            '<h2 class="profile-section-title">Documentos</h2>' +
            '<div class="profile-field" style="flex-direction:column;gap:4px">' +
              '<span class="profile-field-label">Termos</span>' +
              '<span class="profile-field-value" style="max-width:100%;text-align:left">' +
                buildDocumentLink(v.terms_path, base, 'Termos') +
              '</span>' +
            '</div>' +
            '<div class="profile-field" style="flex-direction:column;gap:4px">' +
              '<span class="profile-field-label">Dados Médicos</span>' +
              '<span class="profile-field-value" style="max-width:100%;text-align:left">' +
                buildDocumentLink(v.medical_data_path, base, 'Dados Médicos') +
              '</span>' +
            '</div>' +
          '</div>';

        contentEl.innerHTML = html;
      })
      .catch(function () {
        var contentEl = document.getElementById('profile-content');
        if (!contentEl) return;
        contentEl.innerHTML =
          '<div class="empty-state">' +
            '<p class="empty-state-text">Não foi possível carregar o perfil.<br>Verifique a conexão.</p>' +
          '</div>';
      });
  }

  // Expose globally for app.js router
  window.renderVolunteerProfilePage = renderVolunteerProfilePage;
})();
