/**
 * diary.js — Página do Diário de Bordo
 *
 * Layout: logo (esquerda) + "Diário de Bordo" (direita) no topo.
 * Card "Nova postagem:" com botão + circular verde.
 * Feed de postagens sem avatar/foto de perfil.
 * Cada post: nome (esquerda) + data (direita), imagem, título, descrição.
 *
 * Requisitos: 7.1, 7.2
 */
(function () {
  'use strict';

  function formatDate(isoStr) {
    if (!isoStr) return '';
    try {
      var d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      var day = String(d.getDate()).padStart(2, '0');
      var month = String(d.getMonth() + 1).padStart(2, '0');
      var year = d.getFullYear();
      var hours = String(d.getHours()).padStart(2, '0');
      var minutes = String(d.getMinutes()).padStart(2, '0');
      return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
    } catch (e) { return isoStr; }
  }

  function buildPostCard(post, baseUrl) {
    var authorName = post.volunteer_name || 'Anônimo';
    var dateStr = formatDate(post.created_at);

    var imageHtml = '';
    if (post.image_path) {
      var imageUrl = baseUrl + '/uploads/' + post.image_path;
      imageHtml = '<img class="diary-post-image" src="' + imageUrl + '" alt="Imagem da postagem" loading="lazy">';
    }

    return '<article class="diary-post-card">' +
      '<div class="diary-post-header">' +
        '<span class="diary-post-author">' + authorName + '</span>' +
        '<span class="diary-post-date">' + dateStr + '</span>' +
      '</div>' +
      imageHtml +
      '<div class="diary-post-body">' +
        '<h3 class="diary-post-title">' + (post.title || '') + '</h3>' +
        '<p class="diary-post-desc">' + (post.description || '') + '</p>' +
      '</div>' +
    '</article>';
  }

  function renderDiaryPage(container) {
    var html =
      '<div class="page-top-bar">' +
        '<img src="assets/logo.png" alt="IPRA no Ariri" class="page-top-logo" onerror="this.style.display=\'none\'">' +
        '<h1 class="page-top-title">Diário de Bordo</h1>' +
      '</div>' +
      '<div class="detail-cards">' +
        '<div class="detail-card new-form-card" id="new-post-card" role="button" tabindex="0" aria-label="Nova postagem">' +
          '<div class="new-form-card-inner">' +
            '<span class="detail-card-label" style="margin-bottom:0">Nova<br>postagem:</span>' +
            '<button class="add-circle-btn" aria-label="Adicionar postagem">' +
              '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div id="diary-feed" class="mt-16"></div>' +
      '<div id="diary-loading" class="text-center mt-24"><div class="spinner"></div></div>';

    container.innerHTML = html;

    var card = document.getElementById('new-post-card');
    function goNew() { window.location.hash = '#/diary/new'; }
    card.addEventListener('click', goNew);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goNew(); }
    });

    var base = window.Sync ? window.Sync.getServerUrl() : '';
    var feedEl = document.getElementById('diary-feed');
    var loadingEl = document.getElementById('diary-loading');

    fetch(base + '/api/posts')
      .then(function (res) {
        if (!res.ok) throw new Error('err');
        return res.json();
      })
      .then(function (posts) {
        loadingEl.classList.add('hidden');
        if (!posts || posts.length === 0) {
          feedEl.innerHTML =
            '<div class="empty-state">' +
              '<p class="empty-state-text">Nenhuma postagem ainda.<br>Seja o primeiro a compartilhar!</p>' +
            '</div>';
          return;
        }
        var feedHtml = '<div class="diary-feed-list">';
        posts.forEach(function (post) { feedHtml += buildPostCard(post, base); });
        feedHtml += '</div>';
        feedEl.innerHTML = feedHtml;
      })
      .catch(function () {
        loadingEl.classList.add('hidden');
        feedEl.innerHTML =
          '<div class="empty-state"><p class="empty-state-text">Não foi possível carregar as postagens.</p></div>';
      });
  }

  window.renderDiaryPage = renderDiaryPage;
})();
