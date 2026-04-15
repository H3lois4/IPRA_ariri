(function () {
  'use strict';
  var backSvg = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="14 8 10 12 14 16"/></svg>';

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    var parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  function esc(str) {
    if (!str) return '—';
    var div = document.createElement('div'); div.textContent = str; return div.innerHTML;
  }

  function buildField(label, value) {
    return '<div class="vol-field-row"><span class="vol-field-label">' + label + ':</span> <span class="vol-field-value">' + (value || '—') + '</span></div>';
  }

  window.renderVolunteerProfilePage = function (container, params) {
    var id = params && params.id;
    container.innerHTML =
      '<div class="page-top-bar">' +
        '<button class="back-circle-btn" id="prof-back">' + backSvg + '</button>' +
        '<img src="assets/logo.png" alt="IPRA no Ariri" class="page-top-logo" onerror="this.style.display=\'none\'">' +
      '</div>' +
      '<div id="prof-content"><div class="spinner"></div></div>';

    document.getElementById('prof-back').addEventListener('click', function () { window.location.hash = '#/menu/team'; });

    if (!id) { document.getElementById('prof-content').innerHTML = '<div class="empty-state"><p class="empty-state-text">Voluntário não encontrado.</p></div>'; return; }

    var base = window.Sync ? window.Sync.getServerUrl() : '';
    fetch(base + '/api/volunteers/' + encodeURIComponent(id))
      .then(function (r) { if (!r.ok) throw new Error('err'); return r.json(); })
      .then(function (v) {
        var el = document.getElementById('prof-content');
        if (!el) return;

        var initial = (v.full_name || '?').charAt(0).toUpperCase();

        // Build terms images
        var termsHtml = '<div class="vol-doc-box"><span style="color:var(--text-muted);font-size:13px">Nenhum termo</span></div>';
        if (v.terms_path) {
          var termFiles = v.terms_path.split(',');
          termsHtml = '<div style="display:flex;flex-wrap:wrap;gap:8px">';
          termFiles.forEach(function (f) {
            var url = base + '/uploads/' + f.trim();
            termsHtml += '<img src="' + url + '" class="expandable-img" data-full="' + url + '" style="width:80px;height:80px;object-fit:cover;border-radius:8px;cursor:zoom-in" loading="lazy">';
          });
          termsHtml += '</div>';
        }

        el.innerHTML =
          '<div class="vol-profile-header">' +
            '<div class="vol-profile-avatar">' + initial + '</div>' +
            '<span class="vol-profile-name">' + esc(v.full_name) + '</span>' +
          '</div>' +
          '<div class="detail-card" style="min-height:auto;padding:16px">' +
            buildField('RG', esc(v.rg)) +
            buildField('CPF', esc(v.cpf)) +
            buildField('Nascimento', formatDate(v.birth_date)) +
            buildField('Profissão', esc(v.profession)) +
            buildField('E-mail', esc(v.email)) +
            buildField('Telefone', esc(v.phone)) +
            buildField('Endereço', esc(v.address)) +
          '</div>' +
          '<div class="form-section mt-16"><p class="form-section-label">Dados médicos:</p>' +
            '<div class="detail-card" style="min-height:auto;padding:14px"><p style="font-size:14px;color:var(--text-primary)">' + esc(v.medical_data_path) + '</p></div></div>' +
          '<div class="form-section mt-16"><p class="form-section-label">Termos assinados:</p>' + termsHtml + '</div>';

        // Expand images
        el.querySelectorAll('.expandable-img').forEach(function (img) {
          img.addEventListener('click', function () {
            var overlay = document.createElement('div');
            overlay.className = 'image-modal-overlay';
            overlay.innerHTML = '<img src="' + img.getAttribute('data-full') + '" class="image-modal-img">';
            overlay.addEventListener('click', function () { overlay.remove(); });
            document.body.appendChild(overlay);
          });
        });
      })
      .catch(function () {
        var el = document.getElementById('prof-content');
        if (el) el.innerHTML = '<div class="empty-state"><p class="empty-state-text">Não foi possível carregar o perfil.</p></div>';
      });
  };
})();
