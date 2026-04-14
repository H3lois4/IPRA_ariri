/**
 * diary.js — Página do Diário de Bordo (feed de postagens)
 *
 * Exibe feed ordenado por data decrescente (mais recente primeiro).
 * Cada postagem com: avatar/inicial do autor, nome, data, imagem, título e descrição.
 * Botão "+ Nova postagem" no topo.
 *
 * Requisitos: 7.1, 7.2
 */
(function () {
  'use strict';

  /**
   * Format an ISO date string to a human-readable Brazilian format.
   * @param {string} isoStr
   * @returns {string}
   */
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
      return day + '/' + month + '/' + year + ' às ' + hours + ':' + minutes;
    } catch (e) {
      return isoStr;
    }
  }

  /**
   * Get the first letter of a name for the avatar.
   * @param {string} name
   * @returns {string}
   */
  function getInitial(name) {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }

  /**
   * Build HTML for a single post card.
   * @param {object} post
   * @param {string} baseUrl
   * @returns {string}
   */
  function buildPostCard(post, baseUrl) {
    var initial = getInitial(post.volunteer_name);
    var authorName = post.volunteer_name || 'Anônimo';
    var dateStr = formatDate(post.created_at);

    var imageHtml = '';
    if (post.image_path) {
      var imageUrl = baseUrl + '/uploads/' + post.image_path;
      imageHtml = '<img class="post-card-image" src="' + imageUrl + '" alt="Imagem da postagem" loading="lazy">';
    }

    var html =
      '<article class="post-card">' +
        '<div class="post-card-header">' +
          '<div class="post-avatar" aria-hidden="true">' + initial + '</div>' +
          '<div class="post-meta">' +
            '<div class="post-author">' + authorName + '</div>' +
            '<div class="post-date">' + dateStr + '</div>' +
          '</div>' +
        '</div>' +
        imageHtml +
        '<div class="post-card-body">' +
          '<h2 class="post-title">' + (post.title || '') + '</h2>' +
          '<p class="post-description">' + (post.description || '') + '</p>' +
        '</div>' +
      '</article>';

    return html;
  }

  /**
   * Render the diary page into the given container.
   * @param {HTMLElement} container
   */
  function renderDiaryPage(container) {
    var html =
      '<div class="page-header">' +
        '<h1 class="page-title">Diário de Bordo</h1>' +
      '</div>' +
      '<button class="btn btn-primary btn-full" id="new-post-btn">+ Nova postagem</button>' +
      '<div id="diary-feed" class="mt-16"></div>' +
      '<div id="diary-loading" class="text-center mt-24"><div class="spinner"></div></div>';

    container.innerHTML = html;

    // Wire up new post button
    document.getElementById('new-post-btn').addEventListener('click', function () {
      window.location.hash = '#/diary/new';
    });

    // Fetch posts from server
    var base = window.Sync ? window.Sync.getServerUrl() : '';
    var feedEl = document.getElementById('diary-feed');
    var loadingEl = document.getElementById('diary-loading');

    fetch(base + '/api/posts')
      .then(function (res) {
        if (!res.ok) throw new Error('Erro ao carregar postagens');
        return res.json();
      })
      .then(function (posts) {
        loadingEl.classList.add('hidden');

        if (!posts || posts.length === 0) {
          feedEl.innerHTML =
            '<div class="empty-state">' +
              '<svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
                '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>' +
                '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' +
              '</svg>' +
              '<p class="empty-state-text">Nenhuma postagem ainda.<br>Seja o primeiro a compartilhar!</p>' +
            '</div>';
          return;
        }

        // Posts are already ordered by created_at desc from the API
        var feedHtml = '<div class="feed">';
        posts.forEach(function (post) {
          feedHtml += buildPostCard(post, base);
        });
        feedHtml += '</div>';
        feedEl.innerHTML = feedHtml;
      })
      .catch(function () {
        loadingEl.classList.add('hidden');
        feedEl.innerHTML =
          '<div class="empty-state">' +
            '<p class="empty-state-text">Não foi possível carregar as postagens.<br>Verifique a conexão.</p>' +
          '</div>';
      });
  }

  // Expose globally for app.js router
  window.renderDiaryPage = renderDiaryPage;
})();
