/**
 * forms.js — Página de Formulários e Dashboard
 *
 * Exibe botão "+ Novo formulário" no topo.
 * Busca formulários sincronizados via GET /api/forms.
 * Se existem dados, exibe Dashboard com gráfico de barras (quantidade por ação)
 * e gráfico de pizza (distribuição percentual via conic-gradient CSS).
 * Se não há dados, oculta o Dashboard.
 *
 * Requisitos: 5.1, 6.1, 6.2, 6.3, 6.4
 */
(function () {
  'use strict';

  var ACTION_TYPES = [
    'Evangelismo', 'Visitação', 'Oração', 'Aconselhamento',
    'Infantil', 'Manutenção', 'Auxílio ao MEAP', 'Cozinha',
    'Educação', 'Odontologia', 'P. Socorros', 'Outros'
  ];

  var PIE_COLORS = [
    '#1a4731', '#2d6b4a', '#3d8b63', '#4caf7c',
    '#66c295', '#80d4ae', '#a8e0c4', '#c8ecd8',
    '#f9a825', '#ff8f00', '#d32f2f', '#7b1fa2'
  ];

  /**
   * Aggregate form data: count how many forms contain each action type.
   * Returns { counts: { actionName: number }, total: number }
   */
  function aggregateActions(forms) {
    var counts = {};
    var total = 0;

    ACTION_TYPES.forEach(function (action) {
      counts[action] = 0;
    });

    forms.forEach(function (form) {
      var actions = form.actions || [];
      actions.forEach(function (action) {
        if (counts[action] !== undefined) {
          counts[action]++;
          total++;
        }
      });
    });

    return { counts: counts, total: total };
  }

  /**
   * Build the bar chart HTML.
   */
  function buildBarChart(counts, maxCount) {
    var html = '<div class="bar-chart">';

    ACTION_TYPES.forEach(function (action) {
      var count = counts[action] || 0;
      var pct = maxCount > 0 ? (count / maxCount) * 100 : 0;

      html +=
        '<div class="bar-row">' +
          '<span class="bar-label">' + action + '</span>' +
          '<div class="bar-track">' +
            '<div class="bar-fill" style="width:' + pct + '%"></div>' +
          '</div>' +
          '<span class="bar-value">' + count + '</span>' +
        '</div>';
    });

    html += '</div>';
    return html;
  }

  /**
   * Build the pie chart HTML using CSS conic-gradient.
   */
  function buildPieChart(counts, total) {
    if (total === 0) {
      return '<div class="pie-chart"><span class="text-muted">Sem dados</span></div>';
    }

    // Build conic-gradient stops
    var stops = [];
    var cumulative = 0;

    ACTION_TYPES.forEach(function (action, i) {
      var count = counts[action] || 0;
      if (count === 0) return;

      var pct = (count / total) * 100;
      var start = cumulative;
      cumulative += pct;
      stops.push(PIE_COLORS[i] + ' ' + start.toFixed(1) + '% ' + cumulative.toFixed(1) + '%');
    });

    var gradient = 'conic-gradient(' + stops.join(', ') + ')';

    // Build legend
    var legendHtml = '<div style="display:flex;flex-direction:column;gap:4px;flex:1;min-width:0">';
    ACTION_TYPES.forEach(function (action, i) {
      var count = counts[action] || 0;
      if (count === 0) return;
      var pct = ((count / total) * 100).toFixed(0);
      legendHtml +=
        '<div style="display:flex;align-items:center;gap:6px;font-size:11px">' +
          '<span style="width:10px;height:10px;border-radius:50%;background:' + PIE_COLORS[i] + ';flex-shrink:0"></span>' +
          '<span style="color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + action + ' (' + pct + '%)</span>' +
        '</div>';
    });
    legendHtml += '</div>';

    var html =
      '<div class="pie-chart" style="flex-direction:row;gap:16px;align-items:center">' +
        '<div style="width:120px;height:120px;border-radius:50%;background:' + gradient + ';flex-shrink:0"></div>' +
        legendHtml +
      '</div>';

    return html;
  }

  /**
   * Build the full dashboard HTML.
   */
  function buildDashboard(forms) {
    var agg = aggregateActions(forms);
    var counts = agg.counts;
    var total = agg.total;

    // Find max count for bar chart scaling
    var maxCount = 0;
    ACTION_TYPES.forEach(function (action) {
      if (counts[action] > maxCount) maxCount = counts[action];
    });

    var html =
      '<div class="dashboard">' +
        '<h2 class="dashboard-title">Dashboard</h2>' +
        '<div class="chart-container">' +
          '<p class="chart-label">Quantidade por ação</p>' +
          buildBarChart(counts, maxCount) +
        '</div>' +
        '<div class="chart-container">' +
          '<p class="chart-label">Distribuição percentual</p>' +
          buildPieChart(counts, total) +
        '</div>' +
      '</div>';

    return html;
  }

  /**
   * Render the forms page into the given container.
   * @param {HTMLElement} container
   */
  function renderFormsPage(container) {
    // Header + new form button
    var html =
      '<div class="page-header">' +
        '<h1 class="page-title">Formulários</h1>' +
      '</div>' +
      '<button class="btn btn-primary btn-full" id="new-form-btn">+ Novo formulário</button>' +
      '<div id="forms-dashboard"></div>' +
      '<div id="forms-loading" class="text-center mt-24"><div class="spinner"></div></div>';

    container.innerHTML = html;

    // Wire up new form button
    document.getElementById('new-form-btn').addEventListener('click', function () {
      window.location.hash = '#/forms/new';
    });

    // Fetch forms from server
    var base = window.Sync ? window.Sync.getServerUrl() : '';
    var dashboardEl = document.getElementById('forms-dashboard');
    var loadingEl = document.getElementById('forms-loading');

    fetch(base + '/api/forms')
      .then(function (res) {
        if (!res.ok) throw new Error('Erro ao carregar formulários');
        return res.json();
      })
      .then(function (forms) {
        loadingEl.classList.add('hidden');

        if (forms && forms.length > 0) {
          dashboardEl.innerHTML = buildDashboard(forms);
        }
        // If no forms, dashboard stays empty (hidden)
      })
      .catch(function () {
        loadingEl.classList.add('hidden');
        // Offline or error — no dashboard shown
      });
  }

  // Expose globally for app.js router
  window.renderFormsPage = renderFormsPage;
})();
