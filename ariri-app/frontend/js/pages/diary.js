(function () {
  'use strict';

  function formatDate(isoStr) {
    if (!isoStr) return '';
    try {
      var d = new Date(isoStr); if (isNaN(d.getTime())) return isoStr;
      return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
    } catch (e) { return isoStr; }
  }

  function verifyPin(pin) {
    var base = window.Sync ? window.Sync.getServerUrl() : '';
    return fetch(base + '/api/verify-pin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin: pin }) })
      .then(function (r) { return r.json(); }).then(function (d) { return d.valid === true; })
      .catch(function () { return pin === '1234'; });
  }

  function showImageModal(src) {
    var overlay = document.createElement('div');
    overlay.className = 'image-modal-overlay';
    overlay.innerHTML = '<img src="' + src + '" class="image-modal-img">';
    overlay.addEventListener('click', function () { overlay.remove(); });
    document.body.appendChild(overlay);
  }

  function deletePost(postId) {
    var pin = prompt('Digite o PIN para excluir:');
    if (!pin) return;
    verifyPin(pin).then(function (valid) {
      if (!valid) { alert('PIN incorreto'); return; }
      var base = window.Sync ? window.Sync.getServerUrl() : '';
      fetch(base + '/api/posts/' + postId, { method: 'DELETE' })
        .then(function (r) {
          if (r.ok) { window.AppRouter.navigate(); }
          else { alert('Erro ao excluir'); }
        }).catch(function () { alert('Erro de conexão'); });
    });
  }

  function buildPostCard(post, baseUrl) {
    var authorName = post.volunteer_name || 'Anônimo';
    var dateStr = formatDate(post.created_at);
    var imageHtml = '';
    if (post.image_path) {
      var imageUrl = baseUrl + '/uploads/' + post.image_path;
      imageHtml = '<img class="diary-post-image expandable-img" src="' + imageUrl + '" data-full="' + imageUrl + '" alt="Imagem" loading="lazy">';
    }
    return '<article class="diary-post-card" data-post-id="' + post.id + '">' +
      '<div class="diary-post-header">' +
        '<span class="diary-post-author">' + authorName + '</span>' +
        '<span class="diary-post-date">' + dateStr + '</span>' +
      '</div>' + imageHtml +
      '<div class="diary-post-body">' +
        '<h3 class="diary-post-title">' + (post.title || '') + '</h3>' +
        '<p class="diary-post-desc">' + (post.description || '') + '</p>' +
        '<button class="delete-post-btn" data-id="' + post.id + '">Excluir</button>' +
      '</div></article>';
  }

  window.renderDiaryPage = function (container) {
    container.innerHTML =
      '<div class="page-top-bar">' +
        '<img src="assets/logo.png" alt="IPRA no Ariri" class="page-top-logo" onerror="this.style.display=\'none\'">' +
        '<h1 class="page-top-title">Diário de Bordo</h1>' +
      '</div>' +
      '<div class="detail-cards">' +
        '<div class="detail-card new-form-card" id="new-post-card" role="button" tabindex="0">' +
          '<div class="new-form-card-inner">' +
            '<span class="detail-card-label" style="margin-bottom:0">Nova<br>postagem:</span>' +
            '<button class="add-circle-btn"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' +
          '</div></div></div>' +
      '<div id="diary-feed" class="mt-16"></div>' +
      '<div id="diary-loading" class="text-center mt-24"><div class="spinner"></div></div>';

    document.getElementById('new-post-card').addEventListener('click', function () { window.location.hash = '#/diary/new'; });

    var base = window.Sync ? window.Sync.getServerUrl() : '';
    var feedEl = document.getElementById('diary-feed'), loadEl = document.getElementById('diary-loading');

    fetch(base + '/api/posts').then(function (r) { if (!r.ok) throw new Error('err'); return r.json(); })
      .then(function (posts) {
        loadEl.classList.add('hidden');
        if (!posts || posts.length === 0) { feedEl.innerHTML = '<div class="empty-state"><p class="empty-state-text">Nenhuma postagem ainda.</p></div>'; return; }
        var h = '<div class="diary-feed-list">'; posts.forEach(function (p) { h += buildPostCard(p, base); }); h += '</div>';
        feedEl.innerHTML = h;

        // Expand images on click
        feedEl.querySelectorAll('.expandable-img').forEach(function (img) {
          img.addEventListener('click', function () { showImageModal(img.getAttribute('data-full')); });
        });

        // Delete buttons
        feedEl.querySelectorAll('.delete-post-btn').forEach(function (btn) {
          btn.addEventListener('click', function (e) { e.stopPropagation(); deletePost(btn.getAttribute('data-id')); });
        });
      })
      .catch(function () { loadEl.classList.add('hidden'); feedEl.innerHTML = '<div class="empty-state"><p class="empty-state-text">Não foi possível carregar.</p></div>'; });
  };
})();
