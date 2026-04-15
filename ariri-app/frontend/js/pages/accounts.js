(function () {
  'use strict';
  var backSvg = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="14 8 10 12 14 16"/></svg>';

  function formatDate(s) {
    if (!s) return ''; try { var d = new Date(s); if (isNaN(d.getTime())) return s;
    return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear(); } catch(e) { return s; }
  }

  function buildCard(r, base) {
    var img = r.image_path ? '<img class="diary-post-image" src="'+base+'/uploads/'+r.image_path+'" alt="Comprovante" loading="lazy">' : '';
    return '<article class="diary-post-card">'+
      '<div class="diary-post-header"><span class="diary-post-author" style="color:var(--green)">'+(r.title||'')+'</span><span class="diary-post-date">'+formatDate(r.created_at)+'</span></div>'+
      img+'<div class="diary-post-body"><p class="diary-post-desc">'+(r.description||'')+'</p></div></article>';
  }

  // No PIN needed to view — go straight to list
  window.renderAccountsPage = function (container) {
    container.innerHTML =
      '<div class="page-top-bar">' +
        '<button class="back-circle-btn" id="acc-back">' + backSvg + '</button>' +
        '<img src="assets/logo.png" alt="IPRA no Ariri" class="page-top-logo" onerror="this.style.display=\'none\'">' +
      '</div>' +
      '<h2 class="form-page-title">Prestação de contas:</h2>' +
      '<div class="detail-cards">' +
        '<div class="detail-card new-form-card" id="new-rec-card" role="button" tabindex="0">' +
          '<div class="new-form-card-inner">' +
            '<span class="detail-card-label" style="margin-bottom:0">Adicionar<br>comprovante:</span>' +
            '<button class="add-circle-btn"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div id="rec-list" class="mt-16"></div>' +
      '<div id="rec-load" class="text-center mt-24"><div class="spinner"></div></div>';

    document.getElementById('acc-back').addEventListener('click', function () { window.location.hash = '#/menu'; });
    document.getElementById('new-rec-card').addEventListener('click', function () { window.location.hash = '#/menu/accounts/new'; });

    var base = window.Sync ? window.Sync.getServerUrl() : '';
    var listEl = document.getElementById('rec-list'), loadEl = document.getElementById('rec-load');

    fetch(base + '/api/receipts')
      .then(function (r) { if (!r.ok) throw new Error('err'); return r.json(); })
      .then(function (recs) {
        loadEl.classList.add('hidden');
        if (!recs || recs.length === 0) { listEl.innerHTML = '<div class="empty-state"><p class="empty-state-text">Nenhum comprovante registrado.</p></div>'; return; }
        var h = '<div class="diary-feed-list">'; recs.forEach(function (r) { h += buildCard(r, base); }); h += '</div>';
        listEl.innerHTML = h;
      })
      .catch(function () { loadEl.classList.add('hidden'); listEl.innerHTML = '<div class="empty-state"><p class="empty-state-text">Não foi possível carregar.</p></div>'; });
  };
})();
