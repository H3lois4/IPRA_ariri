/**
 * IPRA no Ariri — Splash Screen (splash.js)
 *
 * Exibe logo "IPRA no Ariri" centralizado sobre fundo creme (#faf6ee)
 * com elementos em verde escuro (#1a4731).
 * Exibe versículo Marcos 16:15.
 * Ao tocar/clicar em qualquer área, navega para #/info.
 *
 * Requisitos: 1.1, 1.2, 1.3
 */

(function () {
  'use strict';

  /**
   * Renderiza a Splash Screen no container fornecido.
   * @param {HTMLElement} container — elemento #app
   */
  window.renderSplashPage = function (container) {
    container.innerHTML =
      '<div class="splash-screen" id="splash-area" role="button" tabindex="0" aria-label="Toque para continuar">' +
        '<div class="splash-logo">IPRA no Ariri</div>' +
        '<p class="splash-verse">' +
          '\u201CIde ao mundo, pregai o evangelho a toda criatura.\u201D' +
          '<cite>Marcos 16:15</cite>' +
        '</p>' +
        '<p class="splash-tap-hint">Toque para continuar</p>' +
      '</div>';

    var splashArea = document.getElementById('splash-area');

    function goToInfo() {
      window.location.hash = '#/info';
    }

    splashArea.addEventListener('click', goToInfo);
    splashArea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goToInfo();
      }
    });
  };
})();
