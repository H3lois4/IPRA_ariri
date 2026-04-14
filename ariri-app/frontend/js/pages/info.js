/**
 * IPRA no Ariri — Página de Informações (info.js)
 *
 * Exibe 4 cards clicáveis representando os dias da missão.
 * Ao tocar em um card, navega para #/info/:day.
 *
 * Requisitos: 4.1, 4.2
 */

(function () {
  'use strict';

  var DAYS = [
    { id: 'sabado',  label: 'Sábado',  date: '19/07', icon: 'Sáb' },
    { id: 'domingo', label: 'Domingo', date: '20/07', icon: 'Dom' },
    { id: 'segunda', label: 'Segunda', date: '21/07', icon: 'Seg' },
    { id: 'terca',   label: 'Terça',   date: '22/07', icon: 'Ter' }
  ];

  var chevronSvg =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="9 18 15 12 9 6"/></svg>';

  window.renderInfoPage = function (container) {
    var html =
      '<div class="page-header">' +
        '<h1 class="page-title">Informações</h1>' +
        '<p class="page-subtitle">Cronograma da missão</p>' +
      '</div>';

    for (var i = 0; i < DAYS.length; i++) {
      var day = DAYS[i];
      html +=
        '<div class="card card-clickable day-card" data-day="' + day.id + '" role="button" tabindex="0" aria-label="' + day.label + ' — ' + day.date + '">' +
          '<div class="day-card-icon">' + day.icon + '</div>' +
          '<div class="day-card-info">' +
            '<div class="card-title">' + day.label + '</div>' +
            '<div class="card-subtitle">' + day.date + '</div>' +
          '</div>' +
          '<div class="day-card-chevron">' + chevronSvg + '</div>' +
        '</div>';
    }

    container.innerHTML = html;

    // Attach click/keyboard listeners to each card
    var cards = container.querySelectorAll('.day-card[data-day]');
    cards.forEach(function (card) {
      var dayId = card.getAttribute('data-day');

      card.addEventListener('click', function () {
        window.location.hash = '#/info/' + dayId;
      });

      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.location.hash = '#/info/' + dayId;
        }
      });
    });
  };
})();
