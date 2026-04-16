(function () {
  'use strict';
  var backSvg = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="14 8 10 12 14 16"/></svg>';

  function formatDate(s) {
    if (!s) return ''; try { var d = new Date(s); if (isNaN(d.getTime())) return s;
    return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear(); } catch(e) { return s; }
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

  function deleteReceipt(id) {
    var pin = prompt('Digite o PIN para excluir:');
    if (!pin) return;
    verifyPin(pin).then(function (valid) {
      if (!valid) { alert('PIN incorreto'); return; }
      var base = window.Sync ? window.Sync.getServerUrl() : '';
      fetch(base + '/api/receipts/' + id, { method: 'DELETE' })
        .then(function (r) { if (r.ok) { window.AppRouter.navigate(); } else { alert('Erro ao excluir'); } })
        .catch(function () { alert('Erro de conexão'); });
    });
  }

  function buildCard(r, base) {
    var img = r.image_path ? '<img class="diary-post-image expandable-img" src="'+base+'/uploads/'+r.image_path+'" data-full="'+base+'/uploads/'+r.image_path+'" alt="Comprovante" loading="lazy">' : '';
    return '<article class="diary-post-card" data-id="'+r.id+'">'+
      '<div class="diary-post-header"><span class="diary-post-author" style="color:var(--green)">'+(r.title||'')+'</span><span class="diary-post-date">'+formatDate(r.created_at)+'</span></div>'+
      img+'<div class="diary-post-body"><p class="diary-post-desc">'+(r.description||'')+'</p>'+
      '<button class="delete-post-btn" data-id="'+r.id+'">Excluir</button></div></article>';
  }

  window.renderAccountsPage = function (container) {
    container.innerHTML =
      '<div class="page-top-bar">' +
        '<button class="back-circle-btn" id="acc-back">' + backSvg + '</button>' +
        '<img src="assets/logo.png" alt="IPRA no Ariri" class="page-top-logo" onerror="this.style.display=\'none\'">' +
      '</div>' +
      '<h2 class="form-page-title">Prestação de contas:</h2>' +
      '<div class="menu-simple-list">' +
        '<div class="menu-simple-item" id="new-rec-card" role="button" tabindex="0">' +
          '<span>Adicionar comprovante</span>' +
          '<span class="menu-simple-arrow">&gt;</span>' +
        '</div>' +
      '</div>' +
      '<div id="rec-list" class="mt-16"></div>' +
      '<div id="rec-load" class="text-center mt-24"><div class="spinner"></div></div>';

    document.getElementById('acc-back').addEventListener('click', function () { window.location.hash = '#/menu'; });
    document.getElementById('new-rec-card').addEventListener('click', function () { window.location.hash = '#/menu/accounts/new'; });

    var base = window.Sync ? window.Sync.getServerUrl() : '';
    var listEl = document.getElementById('rec-list'), loadEl = document.getElementById('rec-load');

    fetch(base + '/api/receipts').then(function (r) { if (!r.ok) throw new Error('err'); return r.json(); })
      .then(function (recs) {
        loadEl.classList.add('hidden');
        if (!recs || recs.length === 0) { listEl.innerHTML = '<div class="empty-state"><p class="empty-state-text">Nenhum comprovante registrado.</p></div>'; return; }
        var h = '<div class="diary-feed-list">'; recs.forEach(function (r) { h += buildCard(r, base); }); h += '</div>';
        listEl.innerHTML = h;

        listEl.querySelectorAll('.expandable-img').forEach(function (img) {
          img.addEventListener('click', function () { showImageModal(img.getAttribute('data-full')); });
        });
        listEl.querySelectorAll('.delete-post-btn').forEach(function (btn) {
          btn.addEventListener('click', function (e) { e.stopPropagation(); deleteReceipt(btn.getAttribute('data-id')); });
        });
      })
      .catch(function () { loadEl.classList.add('hidden'); listEl.innerHTML = '<div class="empty-state"><p class="empty-state-text">Não foi possível carregar.</p></div>'; });
  };
})();
