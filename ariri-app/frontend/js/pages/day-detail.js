/**
 * IPRA no Ariri — Página de Detalhe do Dia (day-detail.js)
 *
 * Carrega dados do /api/schedule (com cache local) e renderiza
 * seções de Cronograma, Cardápio e Materiais para o dia selecionado.
 *
 * Requisitos: 4.2, 4.3
 */

(function () {
  'use strict';

  // Cache dos dados do schedule para evitar re-fetch a cada navegação
  var _scheduleCache = null;

  var backArrowSvg =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="15 18 9 12 15 6"/></svg>';

  var MEAL_LABELS = {
    breakfast: 'Café da manhã',
    lunch: 'Almoço',
    dinner: 'Jantar'
  };

  /**
   * Fetch schedule data from the API, using cache if available.
   * @returns {Promise<Object|null>}
   */
  function fetchSchedule() {
    if (_scheduleCache) {
      return Promise.resolve(_scheduleCache);
    }

    var base = window.Sync ? window.Sync.getServerUrl() : '';
    var url = base + '/api/schedule';

    return fetch(url, { method: 'GET' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        _scheduleCache = data;
        return data;
      })
      .catch(function () {
        return null;
      });
  }

  /**
   * Find a day object by its id.
   * @param {Object} data - The schedule data
   * @param {string} dayId - The day identifier (sabado, domingo, etc.)
   * @returns {Object|null}
   */
  function findDay(data, dayId) {
    if (!data || !data.days) return null;
    for (var i = 0; i < data.days.length; i++) {
      if (data.days[i].id === dayId) return data.days[i];
    }
    return null;
  }

  /**
   * Render the error/empty state.
   */
  function renderError(container) {
    container.innerHTML =
      '<button class="back-btn" id="day-detail-back">' + backArrowSvg + ' Voltar</button>' +
      '<div class="empty-state">' +
        '<p class="empty-state-text">Dados não disponíveis</p>' +
      '</div>';

    document.getElementById('day-detail-back').addEventListener('click', function () {
      window.location.hash = '#/info';
    });
  }

  /**
   * Build the schedule section HTML.
   */
  function buildScheduleSection(schedule) {
    if (!schedule || schedule.length === 0) return '';

    var html =
      '<div class="day-detail-section">' +
        '<h2 class="section-title">Cronograma</h2>';

    for (var i = 0; i < schedule.length; i++) {
      var item = schedule[i];
      html +=
        '<div class="schedule-item">' +
          '<span class="schedule-time">' + (item.time || '') + '</span>' +
          '<span class="schedule-activity">' + (item.activity || '') + '</span>' +
        '</div>';
    }

    html += '</div>';
    return html;
  }

  /**
   * Build the menu (cardápio) section HTML.
   */
  function buildMenuSection(menu) {
    if (!menu) return '';

    var meals = ['breakfast', 'lunch', 'dinner'];
    var hasContent = false;
    for (var i = 0; i < meals.length; i++) {
      if (menu[meals[i]]) { hasContent = true; break; }
    }
    if (!hasContent) return '';

    var html =
      '<div class="day-detail-section">' +
        '<h2 class="section-title">Cardápio</h2>';

    for (var j = 0; j < meals.length; j++) {
      var key = meals[j];
      if (menu[key]) {
        html +=
          '<div class="menu-meal">' +
            '<div class="menu-meal-label">' + MEAL_LABELS[key] + '</div>' +
            '<div class="menu-meal-content">' + menu[key] + '</div>' +
          '</div>';
      }
    }

    html += '</div>';
    return html;
  }

  /**
   * Build the materials section HTML.
   */
  function buildMaterialsSection(materials) {
    if (!materials || materials.length === 0) return '';

    var html =
      '<div class="day-detail-section">' +
        '<h2 class="section-title">Materiais</h2>' +
        '<div class="materials-list">';

    for (var i = 0; i < materials.length; i++) {
      html += '<span class="material-tag">' + materials[i] + '</span>';
    }

    html += '</div></div>';
    return html;
  }

  /**
   * Main render function exposed as window.renderDayDetailPage.
   * @param {HTMLElement} container
   * @param {Object} params - Contains params.day (sabado, domingo, segunda, terca)
   */
  window.renderDayDetailPage = function (container, params) {
    var dayId = params && params.day ? params.day : '';

    // Show loading spinner
    container.innerHTML =
      '<button class="back-btn" id="day-detail-back-loading">' + backArrowSvg + ' Voltar</button>' +
      '<div class="spinner"></div>';

    document.getElementById('day-detail-back-loading').addEventListener('click', function () {
      window.location.hash = '#/info';
    });

    // Fetch and render
    fetchSchedule().then(function (data) {
      if (!data) {
        renderError(container);
        return;
      }

      var day = findDay(data, dayId);
      if (!day) {
        renderError(container);
        return;
      }

      var html =
        '<button class="back-btn" id="day-detail-back-main">' + backArrowSvg + ' Voltar</button>' +
        '<div class="page-header">' +
          '<h1 class="page-title">' + day.label + '</h1>' +
          (day.date ? '<p class="page-subtitle">' + day.date + '</p>' : '') +
        '</div>';

      html += buildScheduleSection(day.schedule);
      html += buildMenuSection(day.menu);
      html += buildMaterialsSection(day.materials);

      container.innerHTML = html;

      document.getElementById('day-detail-back-main').addEventListener('click', function () {
        window.location.hash = '#/info';
      });
    });
  };
})();
