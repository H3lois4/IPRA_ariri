/**
 * IPRA no Ariri — Página de Menu (menu.js)
 *
 * Exibe lista com dois itens: "Prestação de contas" e "Dados da equipe".
 * Navega para #/menu/accounts e #/menu/team respectivamente.
 *
 * Requisitos: 10.1, 10.2, 10.3
 */

(function () {
  'use strict';

  window.renderMenuPage = function (container) {
    container.innerHTML =
      '<div class="page-header">' +
        '<h1 class="page-title">Menu</h1>' +
      '</div>' +
      '<ul class="menu-list">' +
        '<li class="menu-item" data-href="#/menu/accounts" role="button" tabindex="0" aria-label="Prestação de contas">' +
          '<span class="menu-item-icon">' +
            '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              '<rect x="2" y="3" width="20" height="18" rx="2"/>' +
              '<line x1="2" y1="9" x2="22" y2="9"/>' +
              '<line x1="9" y1="3" x2="9" y2="21"/>' +
            '</svg>' +
          '</span>' +
          '<span class="menu-item-label">Prestação de contas</span>' +
          '<span class="menu-item-chevron">' +
            '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              '<polyline points="9 6 15 12 9 18"/>' +
            '</svg>' +
          '</span>' +
        '</li>' +
        '<li class="menu-item" data-href="#/menu/team" role="button" tabindex="0" aria-label="Dados da equipe">' +
          '<span class="menu-item-icon">' +
            '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>' +
              '<circle cx="9" cy="7" r="4"/>' +
              '<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>' +
              '<path d="M16 3.13a4 4 0 0 1 0 7.75"/>' +
            '</svg>' +
          '</span>' +
          '<span class="menu-item-label">Dados da equipe</span>' +
          '<span class="menu-item-chevron">' +
            '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              '<polyline points="9 6 15 12 9 18"/>' +
            '</svg>' +
          '</span>' +
        '</li>' +
      '</ul>';

    // Attach click and keyboard handlers to menu items
    var items = container.querySelectorAll('.menu-item[data-href]');
    items.forEach(function (item) {
      var href = item.getAttribute('data-href');

      item.addEventListener('click', function () {
        window.location.hash = href;
      });

      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.location.hash = href;
        }
      });
    });
  };
})();
