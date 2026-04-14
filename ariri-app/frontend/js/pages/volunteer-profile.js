/**
 * volunteer-profile.js — Perfil completo do voluntário
 *
 * Layout: botão voltar + logo no topo, avatar + nome,
 * dados pessoais em lista simples, termos e dados médicos.
 *
 * Requisitos: 9.4
 */
(function () {
  'use strict';

  var backArrowSvg =
    '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="12" cy="12" r="10"/><polyline points="14 8 10 12 14 16"/></svg>';

  var docSvg =
    '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="var(--green)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
      '<polyline points="14 2 14 8 20 8"/>' +
      '<polyline points="8 16 12 12 16 16"/>' +
      '<line x1="12" y1="12" x2="12" y2="20"/>' +
    '</svg>';

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    var parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  function esc(str) {
    if (!str) return '—';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderVolunteerProfilePage(container, params) {
    var volunteerId = params && params.id;

    container.innerHTML =
      '<div class="page-top-bar">' +
        '<button class="back-circle-btn" id="profile-back">' + backArrowSvg + '</button>' +
        '<img src="assets/logo.png" alt="IPRA no Ariri" class="page-top-logo" onerror="this.style.display=\'none\'">' +
      '</div>' +
      '<div id="profile-content"><div class="spinner"></div></div>';

    document.getElementById('profile-back').addEventListener('click', function () {
      window.location.hash = '#/menu/team';
    });

    if (!volunteerId) {
      document.getElementById('profile-content').innerHTML =
        '<div class="empty-state"><p class="empty-state-text">Voluntário não encontrado.</p></div>';
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

        var initial = (v.full_name || '?').charAt(0).toUpperCase();
        var avatarHtml = '<div class="vol-profile-avatar">' + initial + '</div>';
        if (v.profile_image) {
          avatarHtml = '<img class="vol-profile-avatar" src="' + base + '/uploads/' + v.profile_image + '" alt="' + esc(v.full_name) + '">';
        }

        var html =
          '<div class="vol-profile-header">' +
            avatarHtml +
            '<span class="vol-profile-name">' + esc(v.full_name) + '</span>' +
          '</div>' +
          '<div class="vol-profile-data">' +
            '<p>' + esc(v.rg) + '</p>' +
            '<p>' + esc(v.cpf) + '</p>' +
            '<p>' + formatDate(v.birth_date) + '</p>' +
            '<p>' + esc(v.gender) + '</p>' +
            '<p>' + esc(v.profession) + '</p>' +
            '<p>' + esc(v.email) + '</p>' +
            '<p>' + esc(v.phone) + '</p>' +
            '<p>' + esc(v.address) + '</p>' +
          '</div>' +
          '<div class="vol-profile-docs">' +
            '<p class="form-section-label">Termos assinados:</p>' +
            '<div class="vol-doc-box">' +
              (v.terms_path
                ? '<a href="' + base + '/uploads/' + v.terms_path + '" target="_blank" rel="noopener">' + docSvg + '</a>'
                : docSvg) +
            '</div>' +
          '</div>' +
          '<div class="vol-profile-docs">' +
            '<p class="form-section-label">Dados médicos:</p>' +
            '<div class="vol-doc-box">' +
              (v.medical_data_path
                ? '<a href="' + base + '/uploads/' + v.medical_data_path + '" target="_blank" rel="noopener">' + docSvg + '</a>'
                : docSvg) +
            '</div>' +
          '</div>';

        contentEl.innerHTML = html;
      })
      .catch(function () {
        var contentEl = document.getElementById('profile-content');
        if (contentEl) {
          contentEl.innerHTML = '<div class="empty-state"><p class="empty-state-text">Não foi possível carregar o perfil.</p></div>';
        }
      });
  }

  window.renderVolunteerProfilePage = renderVolunteerProfilePage;
})();
