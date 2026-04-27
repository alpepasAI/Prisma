/**
 * PRISMA — Interactive Dashboard (js/interactive.js)
 * Dashboard rendering, Chart.js integration, tabs, accordions, KV-cache calculator.
 */

import { getArticleId, getArticleById } from './data.js';
import { updateSEO } from './ui.js';

// Module-level state for the KV cache chart instance
let kvChartInst = null;

// ─── MAIN INIT ────────────────────────────────────────────────────────────────

export async function initInteractive() {
  const articleId = getArticleId();
  if (!articleId) { window.location.href = 'index.html'; return; }

  const article = await getArticleById(articleId);
  if (!article || !article.formats?.interactive?.available) {
    window.location.href = `article.html?id=${articleId || ''}`;
    return;
  }

  // Update "back to article" link
  const backBtn = document.getElementById('btn-back');
  if (backBtn) backBtn.href = `article.html?id=${articleId}`;

  const lang     = window.i18n.getLang();
  const dataFile = article.formats.interactive.dataFile;

  const loadAndRender = async (lng) => {
    try {
      const res  = await fetch(`data/${lng}/${dataFile}?v=4`, { cache: 'no-store' });
      const data = await res.json();
      renderInteractive(data);
    } catch (e) {
      console.error('Error loading interactive data:', e);
    }
  };

  await loadAndRender(lang);

  window.addEventListener('langchange', async () => {
    await loadAndRender(window.i18n.getLang());
  });
}

// ─── RENDER DASHBOARD ─────────────────────────────────────────────────────────

export function renderInteractive(data) {
  document.title = `PRISMA — ${data.title}`;
  updateSEO(`PRISMA — ${data.title}`, data.subtitle);

  // Apply theme
  const html = document.documentElement;
  if (data.theme) html.classList.add(`theme-${data.theme}`);
  else            html.classList.remove('theme-stone', 'theme-indigo');

  const subtitleEl  = document.getElementById('interactive-subtitle');
  const desktopNav  = document.getElementById('desktop-nav');
  const mobileNav   = document.getElementById('mobile-nav');
  const contentArea = document.getElementById('interactive-content');

  if (subtitleEl) subtitleEl.textContent = data.subtitle;

  // Build nav
  let desktopNavHtml = '';
  let mobileNavHtml  = '';
  data.nav.forEach((item, i) => {
    const active = i === 0 ? ' active' : '';
    desktopNavHtml += `<a data-target="${item.id}" class="interactive-nav-item${active}">${item.label}</a>`;
    mobileNavHtml  += `<option value="${item.id}">${item.label}</option>`;
  });
  if (desktopNav) desktopNav.innerHTML = desktopNavHtml;
  if (mobileNav)  mobileNav.innerHTML  = mobileNavHtml;

  // Build sections
  let sectionsHtml = '';
  data.nav.forEach((item, i) => {
    const active = i === 0 ? ' active' : '';
    sectionsHtml += `<section id="${item.id}" class="content-section${active}">${data.sections[item.id]}</section>`;
  });
  if (contentArea) contentArea.innerHTML = sectionsHtml;

  // Navigation switching
  const navItems = document.querySelectorAll('.interactive-nav-item');
  const sections = document.querySelectorAll('.content-section');

  const switchSection = (targetId) => {
    navItems.forEach(item => item.classList.toggle('active', item.getAttribute('data-target') === targetId));
    if (mobileNav) mobileNav.value = targetId;
    sections.forEach(s => s.classList.toggle('active', s.id === targetId));
    if (contentArea) contentArea.scrollTo({ top: 0, behavior: 'smooth' });
    initInteractiveCharts(data.chartData);
  };

  navItems.forEach(item => {
    item.addEventListener('click', (e) => switchSection(e.target.getAttribute('data-target')));
  });
  if (mobileNav) {
    mobileNav.addEventListener('change', (e) => switchSection(e.target.value));
  }

  // Post-render setup
  initInteractiveCharts(data.chartData);
  initInteractiveChecklist(data.checklistData);
  initAccordions();
  initTabs();
}

// ─── TABS ─────────────────────────────────────────────────────────────────────

export function initTabs() {
  // Generic data-attribute tabs
  document.querySelectorAll('[data-tab-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const group    = btn.getAttribute('data-tab-btn');
      const targetId = btn.getAttribute('data-tab-id');

      document.querySelectorAll(`[data-tab-btn="${group}"]`).forEach(b => {
        const isTarget = b.getAttribute('data-tab-id') === targetId;
        b.classList.toggle('active', isTarget);
        if (group === 'foundations') {
          b.classList.toggle('tab-active', isTarget);
          b.classList.toggle('bg-stone-100', !isTarget);
          b.classList.toggle('text-stone-500', !isTarget);
        }
      });

      document.querySelectorAll(`[data-tab-content="${group}"]`).forEach(c => {
        const isTarget = c.getAttribute('data-tab-id') === targetId;
        c.classList.toggle('hidden', !isTarget);
        c.classList.toggle('block', isTarget);
      });
    });
  });

  // Article 003 ACID/BASE tabs
  const btnAcid = document.getElementById('btn-acid');
  const btnBase = document.getElementById('btn-base');
  if (btnAcid && btnBase) {
    const contentAcid = document.getElementById('content-acid');
    const contentBase = document.getElementById('content-base');
    const setActive = (type) => {
      const isAcid = type === 'acid';
      btnAcid.className = `flex-1 py-4 font-bold text-center transition-colors ${isAcid ? 'tab-active' : 'interactive-box text-on-surface-variant'}`;
      btnBase.className = `flex-1 py-4 font-bold text-center transition-colors ${!isAcid ? 'tab-active' : 'interactive-box text-on-surface-variant'}`;
      contentAcid?.classList.toggle('hidden', !isAcid);
      contentAcid?.classList.toggle('block', isAcid);
      contentBase?.classList.toggle('hidden', isAcid);
      contentBase?.classList.toggle('block', !isAcid);
    };
    btnAcid.addEventListener('click', () => setActive('acid'));
    btnBase.addEventListener('click', () => setActive('base'));
  }

  // Article 003 Pattern tabs (saga/outbox/validation)
  const patternKeys = ['saga', 'outbox', 'validation'];
  const patternBtns = Object.fromEntries(patternKeys.map(k => [k, document.getElementById(`btn-${k}`)]));
  const patternDiags = Object.fromEntries(patternKeys.map(k => [k, document.getElementById(`diagram-${k}`)]));

  if (patternBtns.saga) {
    const setPattern = (key) => {
      patternKeys.forEach(k => {
        const isActive = k === key;
        if (patternBtns[k]) {
          patternBtns[k].className = `text-left px-4 py-3 rounded-lg border-2 transition-all font-bold ${isActive ? 'border-amber-500 bg-amber-50 text-amber-500' : 'interactive-box border-stone-200 text-on-surface-variant'}`;
        }
        if (patternDiags[k]) {
          patternDiags[k].classList.toggle('hidden', !isActive);
          patternDiags[k].classList.toggle('block', isActive);
        }
      });
    };
    patternKeys.forEach(k => patternBtns[k]?.addEventListener('click', () => setPattern(k)));
  }
}

// ─── ACCORDIONS ───────────────────────────────────────────────────────────────

export function initAccordions() {
  // .risk-toggle (Article 003)
  const riskToggles = document.querySelectorAll('.risk-toggle');
  riskToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const content  = toggle.nextElementSibling;
      const icon     = toggle.querySelector('span');
      const isHidden = content.classList.contains('hidden');
      content.classList.toggle('hidden', !isHidden);
      if (icon) icon.textContent = isHidden ? '−' : '+';
      riskToggles.forEach(other => {
        if (other !== toggle) {
          other.nextElementSibling.classList.add('hidden');
          const oi = other.querySelector('span');
          if (oi) oi.textContent = '+';
        }
      });
    });
  });

  // .risk-header (standard PRISMA accordions)
  document.querySelectorAll('.risk-header').forEach(header => {
    header.addEventListener('click', () => {
      const accordion = header.parentElement;
      const content   = header.nextElementSibling;
      const isActive  = accordion.classList.toggle('active');
      if (content) content.classList.toggle('active', isActive);
    });
  });
}

// ─── CHARTS ───────────────────────────────────────────────────────────────────

export function initInteractiveCharts(chartData) {
  if (!chartData || typeof Chart === 'undefined') return;

  Chart.defaults.color       = '#a8a29e';
  Chart.defaults.borderColor = 'rgba(68, 64, 60, 0.3)';
  Chart.defaults.font.family = "'Inter', sans-serif";

  const safeInit = (id, config) => {
    const canvas = document.getElementById(id);
    if (!canvas) return null;
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    return new Chart(canvas, config);
  };

  // Article 001/002 – Radar
  if (chartData.radar) {
    safeInit('threatRadarChart', {
      type: 'radar',
      data: {
        labels: chartData.radar.labels,
        datasets: [
          { label: 'Node.js', data: chartData.radar.node, backgroundColor: 'rgba(76,215,246,0.2)', borderColor: '#4cd7f6', pointBackgroundColor: '#4cd7f6' },
          { label: 'PHP',     data: chartData.radar.php,  backgroundColor: 'rgba(208,188,255,0.2)', borderColor: '#d0bcff', pointBackgroundColor: '#d0bcff' }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 10, grid: { color: 'rgba(255,255,255,0.1)' }, angleLines: { color: 'rgba(255,255,255,0.1)' } } } }
    });
  }

  // Bar (dependency scale)
  if (chartData.bar) {
    ['dependencyScaleChart', 'adoptionChart'].forEach(id => {
      safeInit(id, {
        type: 'bar',
        data: { 
          labels: chartData.bar.labels, 
          datasets: [
            { label: id === 'adoptionChart' ? 'Open Source' : 'NPM Packages', data: chartData.bar.data, backgroundColor: '#4edea3', borderRadius: 4 },
            ...(chartData.bar.secondaryData ? [{ label: 'Enterprise', data: chartData.bar.secondaryData, backgroundColor: '#d0bcff', borderRadius: 4 }] : [])
          ] 
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } } }
      });
    });
  }

  // Doughnut
  if (chartData.doughnut) {
    ['doughnutChart', 'ecosystemDoughnut', 'attackVectorsChart'].forEach(id => {
      safeInit(id, {
        type: 'doughnut',
        data: {
          labels: chartData.doughnut.labels,
          datasets: [{ data: chartData.doughnut.data, backgroundColor: id === 'ecosystemDoughnut' ? ['#f43f5e','#f59e0b','#3b82f6','#10b981'] : ['#4cd7f6','#4edea3','#d0bcff','#ffb4ab'] }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#ffffff', padding: 20 } } } }
      });
    });
  }

  // Article 003 – Performance
  if (chartData.performance) {
    const perfChart = safeInit('performanceChart', {
      type: 'bar',
      data: { labels: chartData.performance.labels, datasets: [{ label: 'Write Throughput (TPS)', data: chartData.performance.values, backgroundColor: ['#78716c','#d97706'], borderRadius: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } } } }
    });
    if (perfChart) {
      const btnWrite = document.getElementById('chart-toggle-write');
      const btnRead  = document.getElementById('chart-toggle-read');
      if (btnWrite && btnRead) {
        btnWrite.onclick = () => { btnWrite.classList.add('active'); btnRead.classList.remove('active'); perfChart.data.labels = chartData.performance.labels; perfChart.data.datasets[0].data = chartData.performance.values; perfChart.data.datasets[0].label = 'Write Throughput (TPS)'; perfChart.update(); };
        btnRead.onclick  = () => { btnRead.classList.add('active'); btnWrite.classList.remove('active'); perfChart.data.labels = chartData.performance.secondaryLabels; perfChart.data.datasets[0].data = chartData.performance.secondaryValues; perfChart.data.datasets[0].label = 'Read Latency (ms)'; perfChart.update(); };
      }
    }
  }

  // Article 004 – TurboQuant distribution
  if (chartData.distribution) {
    safeInit('distributionChart', {
      type: 'line',
      data: chartData.distribution,
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { display: false }, x: { grid: { color: 'rgba(255,255,255,0.05)' } } } }
    });
  }

  // Article 004 – KV Cache
  if (chartData.kvCache) {
    const kv = safeInit('kvCacheChart', {
      type: 'bar',
      data: {
        labels: [window.i18n.t('memory_footprint') || 'Memory Footprint'],
        datasets: [
          { label: 'Base FP16 (TB)', data: [2.62], backgroundColor: 'rgba(168,162,158,0.3)', borderColor: '#a8a29e', borderWidth: 1, borderRadius: 6 },
          { label: 'TurboQuant (TB)', data: [0.32], backgroundColor: '#818cf8', borderRadius: 6 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } } } }
    });
    if (kv) { kvChartInst = kv; initKVCacheCalculator(); }
  }

  // Article 004 – Hardware bandwidth
  if (chartData.hardware) {
    safeInit('hardwareChart', {
      type: 'bar',
      data: { labels: chartData.hardware.labels, datasets: [{ label: 'Bandwidth (TB/s)', data: chartData.hardware.values, backgroundColor: ['#4cd7f6','#d0bcff','#4edea3'] }] },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } } } }
    });
  }

  // Article 004 – Tail bound
  if (chartData.tailBound) {
    safeInit('tailBoundChart', {
      type: 'line',
      data: {
        labels: chartData.tailBound.labels,
        datasets: [
          { label: 'TurboQuant', data: chartData.tailBound.turbo, borderColor: '#4edea3', borderWidth: 3, tension: 0.2 },
          { label: 'RaBitQ',     data: chartData.tailBound.rabit, borderColor: '#ffb4ab', borderDash: [5,5], tension: 0.2 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { type: 'logarithmic', grid: { color: 'rgba(255,255,255,0.05)' } } } }
    });
  }
}

// ─── CHECKLIST ────────────────────────────────────────────────────────────────

export function initInteractiveChecklist(checklistData) {
  if (!checklistData) return;
  const container    = document.getElementById('mitigationChecklist') || document.getElementById('mcpChecklist');
  const scoreDisplay = document.getElementById('scoreDisplay');
  if (!container || !scoreDisplay) return;

  let checkedCount = 0;
  const total      = checklistData.length;

  const updateScore = () => {
    scoreDisplay.textContent = `${checkedCount} / ${total} ${window.i18n.t('implemented') || 'Implemented'}`;
  };

  container.innerHTML = checklistData.map(item => `
    <li id="li-${item.id}">
      <div style="margin-top:4px;"><input type="checkbox" id="${item.id}" style="pointer-events:none;"></div>
      <div>
        <label class="font-bold text-on-surface" style="pointer-events:none;">${item.label}</label>
        <p class="text-sm text-on-surface-variant" style="pointer-events:none;margin-top:4px;">${item.desc}</p>
      </div>
    </li>
  `).join('');

  checklistData.forEach(item => {
    const li = document.getElementById(`li-${item.id}`);
    li.addEventListener('click', () => {
      const cb = document.getElementById(item.id);
      cb.checked = !cb.checked;
      li.classList.toggle('checked', cb.checked);
      checkedCount += cb.checked ? 1 : -1;
      updateScore();
    });
  });

  updateScore();
}

// ─── KV CACHE CALCULATOR ──────────────────────────────────────────────────────

export function initKVCacheCalculator() {
  const uSlider    = document.getElementById('usersSlider');
  const tSlider    = document.getElementById('tokensSlider');
  const uLabel     = document.getElementById('usersLabel');
  const tLabel     = document.getElementById('tokensLabel');
  const totalText  = document.getElementById('totalMemoryText');
  if (!uSlider || !tSlider || !totalText) return;

  // Replace nodes to remove old listeners
  const newU = uSlider.cloneNode(true);
  const newT = tSlider.cloneNode(true);
  uSlider.parentNode.replaceChild(newU, uSlider);
  tSlider.parentNode.replaceChild(newT, tSlider);

  const update = () => {
    const u = parseInt(newU.value);
    const t = parseInt(newT.value);
    if (uLabel) uLabel.innerText = u;
    if (tLabel) tLabel.innerText = t.toLocaleString();

    const tbTotal      = (640 * u * t) / (1024 * 1024 * 1024);
    const turboQuantTb = tbTotal / 8;
    totalText.innerText = tbTotal.toFixed(2);

    if (kvChartInst) {
      kvChartInst.data.datasets[0].data = [tbTotal];
      kvChartInst.data.datasets[1].data = [turboQuantTb];
      kvChartInst.update();
    }
  };

  newU.addEventListener('input', update);
  newT.addEventListener('input', update);
  update();
}
