/**
 * team.js — Página de Dados da Equipe
 *
 * Solicita PIN de 4 dígitos antes de exibir conteúdo.
 * Após validação, exibe lista de voluntários com nome e foto/avatar.
 * Ao tocar em um nome, navega para #/menu/team/:id.
 *
 * Requisitos: 9.1, 9.2, 9.3
 */
(function () {
  'use strict';

  var CORRECT_PIN = '1234';

  /**
   * Build HTML for a single team member item.
   * @param {object} volunteer
   * @param {string} baseUrl
   * @returns {string}
   */
  function buildTeamItem(volunteer, baseUrl) {
    var avatarHtml;
    if (volunteer.profile_image) {
      var imageUrl = baseUrl + '/uploads/' + volunteer.profile_image;
      avatarHtml = '<img class="team-avatar" src="' + imageUrl + '" alt="' + (volunteer.full_name || '') + '" loading="lazy">';
    } else {
      var initial = (volunteer.full_name || '?').charAt(0).toUpperCase();
      avatarHtml = '<div class="team-avatar">' + initial + '</div>';
    }

    return (
      '<div class="team-item" data-id="' + volunteer.id + '">' +
        avatarHtml +
        '<span class="team-name">' + (volunteer.full_name || '') + '</span>' +
      '</div>'
    );
  }

  /**
   * Render the PIN screen.
   * @param {HTMLElement} container
   */
  function renderPinScreen(container) {
    container.innerHTML =
      '<button class="back-btn" id="team-back-btn">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>' +
        'Voltar' +
      '</button>' +
      '<div class="pin-screen">' +
        '<h1 class="pin-title">Dados da Equipe</h1>' +
        '<p class="pin-subtitle">Digite o PIN para acessar</p>' +
        '<input type="password" inputmode="numeric" maxlength="4" pattern="[0-9]*" ' +
          'class="pin-input" id="pin-input" placeholder="••••" autocomplete="off" ' +
          'aria-label="PIN de 4 dígitos">' +
        '<p class="pin-error hidden" id="pin-error">PIN incorreto</p>' +
      '</div>';

    document.getElementById('team-back-btn').addEventListener('click', function () {
      window.location.hash = '#/menu';
    });

    var pinInput = document.getElementById('pin-input');
    var pinError = document.getElementById('pin-error');

    pinInput.addEventListener('input', function () {
      pinError.classList.add('hidden');

      if (pinInput.value.length === 4) {
        if (pinInput.value === CORRECT_PIN) {
          renderTeamList(container);
        } else {
          pinError.classList.remove('hidden');
          pinInput.value = '';
        }
      }
    });

    pinInput.focus();
  }

  /**
   * Render the volunteers list after PIN validation.
   * @param {HTMLElement} container
   */
  function renderTeamList(container) {
    container.innerHTML =
      '<button class="back-btn" id="team-back-btn">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>' +
        'Voltar' +
      '</button>' +
      '<div class="page-header">' +
        '<h1 class="page-title">Dados da Equipe</h1>' +
      '</div>' +
      '<div id="team-list" class="team-list"></div>' +
      '<div id="team-loading" class="text-center mt-24"><div class="spinner"></div></div>';

    document.getElementById('team-back-btn').addEventListener('click', function () {
      window.location.hash = '#/menu';
    });

    var base = window.Sync ? window.Sync.getServerUrl() : '';
    var listEl = document.getElementById('team-list');
    var loadingEl = document.getElementById('team-loading');

    fetch(base + '/api/volunteers')
      .then(function (res) {
        if (!res.ok) throw new Error('Erro ao carregar voluntários');
        return res.json();
      })
      .then(function (volunteers) {
        loadingEl.classList.add('hidden');

        if (!volunteers || volunteers.length === 0) {
          listEl.innerHTML =
            '<div class="empty-state">' +
              '<svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
                '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>' +
                '<circle cx="9" cy="7" r="4"/>' +
                '<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>' +
                '<path d="M16 3.13a4 4 0 0 1 0 7.75"/>' +
              '</svg>' +
              '<p class="empty-state-text">Nenhum voluntário cadastrado.</p>' +
            '</div>';
          return;
        }

        var html = '';
        volunteers.forEach(function (v) {
          html += buildTeamItem(v, base);
        });
        listEl.innerHTML = html;

        // Attach click handlers for navigation
        var items = listEl.querySelectorAll('.team-item');
        items.forEach(function (item) {
          item.addEventListener('click', function () {
            var id = item.getAttribute('data-id');
            window.location.hash = '#/menu/team/' + id;
          });
        });
      })
      .catch(function () {
        loadingEl.classList.add('hidden');
        listEl.innerHTML =
          '<div class="empty-state">' +
            '<p class="empty-state-text">Não foi possível carregar os voluntários.<br>Verifique a conexão.</p>' +
          '</div>';
      });
  }

  /**
   * Main render function for the team page.
   * @param {HTMLElement} container
   */
  function renderTeamPage(container) {
    renderPinScreen(container);
  }

  // Expose globally for app.js router
  window.renderTeamPage = renderTeamPage;
})();
