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
  if (!articleId) { window.location.href = './'; return; }

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
      renderInteractive(data, article);
    } catch (e) {
      console.error('Error loading interactive data:', e);
    }
  };

  await loadAndRender(lang);

  window.addEventListener('langchange', async () => {
    await loadAndRender(window.i18n.getLang(), article);
  });
}

// ─── RENDER DASHBOARD ─────────────────────────────────────────────────────────

export function renderInteractive(data, article) {
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

  const lang = window.i18n.getLang();
  if (subtitleEl) subtitleEl.textContent = article.i18n[lang].title;

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

  // Article 005 – Ubuntu Performance
  if (chartData.ubuntuPerf) {
    const ubuntuPerf = safeInit('ubuntuPerfChart', {
      type: 'bar',
      data: {
        labels: chartData.ubuntuPerf.speed.labels,
        datasets: [
          { label: 'Ubuntu 24.04 LTS', data: chartData.ubuntuPerf.speed.data24, backgroundColor: 'rgba(168,162,158,0.3)', borderRadius: 4 },
          { label: 'Ubuntu 26.04 LTS', data: chartData.ubuntuPerf.speed.data26, backgroundColor: '#E95420', borderRadius: 4 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, title: { display: true, text: chartData.ubuntuPerf.speed.labelY } } } }
    });
    if (ubuntuPerf) {
      const btnSpeed = document.getElementById('btn-perf-speed');
      const btnRes   = document.getElementById('btn-perf-res');
      const context  = document.getElementById('perf-context');
      if (btnSpeed && btnRes) {
        btnSpeed.onclick = () => {
          btnSpeed.classList.add('active'); btnRes.classList.remove('active');
          ubuntuPerf.data.labels = chartData.ubuntuPerf.speed.labels;
          ubuntuPerf.data.datasets[0].data = chartData.ubuntuPerf.speed.data24;
          ubuntuPerf.data.datasets[1].data = chartData.ubuntuPerf.speed.data26;
          ubuntuPerf.options.scales.y.title.text = chartData.ubuntuPerf.speed.labelY;
          ubuntuPerf.update();
          if (context) context.textContent = window.i18n.getLang() === 'es' ? 'Mostrando Velocidad: Nota la reducción drástica en los tiempos de arranque de Snaps.' : 'Showing Speed Metrics: Note the drastic reduction in Snap Application cold start times.';
        };
        btnRes.onclick = () => {
          btnRes.classList.add('active'); btnSpeed.classList.remove('active');
          ubuntuPerf.data.labels = chartData.ubuntuPerf.resources.labels;
          ubuntuPerf.data.datasets[0].data = chartData.ubuntuPerf.resources.data24;
          ubuntuPerf.data.datasets[1].data = chartData.ubuntuPerf.resources.data26;
          ubuntuPerf.options.scales.y.title.text = chartData.ubuntuPerf.resources.labelY;
          ubuntuPerf.update();
          if (context) context.textContent = window.i18n.getLang() === 'es' ? 'Mostrando Recursos: 26.04 usa más RAM nativa por la IA, pero reduce el espacio en disco.' : 'Showing Resources: 26.04 uses more RAM due to AI, but reduces disk footprint.';
        };
      }
    }
  }

  // Article 005 – Ubuntu Sentiment
  if (chartData.ubuntuSentiment) {
    safeInit('ubuntuSentimentChart', {
      type: 'doughnut',
      data: {
        labels: chartData.ubuntuSentiment.labels,
        datasets: [{
          data: chartData.ubuntuSentiment.data,
          backgroundColor: ['#10b981', '#4edea3', 'rgba(168,162,158,0.2)', '#f43f5e'],
          borderWidth: 0
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right', labels: { color: '#a8a29e', boxWidth: 12, usePointStyle: true } } } }
    });
    initUbuntuQuiz();
  }
  // Article 006 – RAG Cost Analysis (4 datasets matching original draft)
  if (chartData.ragCost) {
    const initialData = calcRagCosts(10000);
    const ragChart = safeInit('ragCostChart', {
      type: 'line',
      data: {
        labels: ['Month 1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','Month 12'],
        datasets: [
          {
            label: 'Local Hardware (Phi-4 14B)',
            data: initialData.localCosts,
            borderColor: '#059669',
            backgroundColor: 'rgba(5,150,105,0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.1
          },
          {
            label: 'VPS / Cloud Server',
            data: initialData.vpsCosts,
            borderColor: '#d97706',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.1
          },
          {
            label: 'Cloud API (Standard)',
            data: initialData.apiStdCosts,
            borderColor: '#0284c7',
            borderWidth: 2,
            tension: 0.1
          },
          {
            label: 'Cloud API (GPT-5.5)',
            data: initialData.apiAdvCosts,
            borderColor: '#dc2626',
            borderWidth: 2,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          tooltip: {
            callbacks: {
              label: ctx => {
                let label = ctx.dataset.label ? ctx.dataset.label + ': ' : '';
                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(ctx.parsed.y);
                return label;
              }
            }
          },
          legend: { position: 'bottom', labels: { color: '#a8a29e', padding: 20, usePointStyle: true } }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.05)' },
            title: { display: true, text: 'Cumulative Cost (USD)', color: '#a8a29e' },
            ticks: { color: '#a8a29e', callback: v => '$' + v }
          },
          x: { grid: { display: false }, ticks: { color: '#a8a29e' } }
        }
      }
    });
    if (ragChart) initRagCostCalculator(ragChart);
  }

  initRagStepExplorer();
}

// ─── ARTICLE 006: RAG COST FORMULAS ───────────────────────────────────────────

function calcRagCosts(queriesPerMonth) {
  const HW_COST = 1500;
  const VPS_MONTHLY = 150;
  const API_CHEAP_PER_1K = 0.005;
  const API_EXP_PER_1K   = 0.05;
  const months = Array.from({length: 12}, (_, i) => i + 1);
  const apiStdMonthly = (queriesPerMonth * 1000 / 1000) * API_CHEAP_PER_1K;
  const apiAdvMonthly = (queriesPerMonth * 1000 / 1000) * API_EXP_PER_1K;
  return {
    localCosts:  months.map(() => HW_COST),
    vpsCosts:    months.map(m => m * VPS_MONTHLY),
    apiStdCosts: months.map(m => m * apiStdMonthly),
    apiAdvCosts: months.map(m => m * apiAdvMonthly)
  };
}

// ─── ARTICLE 006: RAG STEP EXPLORER ───────────────────────────────────────────

export function initRagStepExplorer() {
  const panel = document.getElementById('rag-step-panel');
  if (!panel) return;

  const buttons = document.querySelectorAll('[data-rag-step]');
  const details = {
    es: {
      1: "<strong>Consulta de Usuario:</strong> El usuario hace una pregunta, por ej. <em>'¿Cuáles fueron nuestros márgenes en Q3?'</em>. Se aplican guardarraíles para asegurar que la consulta sea pertinente.",
      2: "<strong>Búsqueda Vectorial:</strong> El sistema convierte la consulta en un vector matemático y busca fragmentos documentales similares en la base de datos local.",
      3: "<strong>Recuperación de Contexto:</strong> La base de datos devuelve solo los fragmentos de tus documentos que contienen la respuesta potencial. Esta es la restricción de la 'Base de Conocimiento'.",
      4: "<strong>Inferencia del LLM (Phi-4):</strong> El sistema crea un prompt estricto: <em>'Usando ÚNICAMENTE los siguientes fragmentos, responde la consulta. Si la respuesta no está en el texto, di \"No lo sé\".'</em> El modelo local Phi-4 lo procesa.",
      5: "<strong>Respuesta Final:</strong> El LLM genera una respuesta legible basada completamente en tus documentos locales, evitando totalmente las alucinaciones fuera del contexto proporcionado."
    },
    en: {
      1: "<strong>User Query:</strong> The user asks a question, e.g., <em>'What were our Q3 margins?'</em>. Guardrails are applied here to ensure the question is appropriate.",
      2: "<strong>Vector Search:</strong> The system converts the text query into numbers (vectors) and searches the local Vector Database for mathematically similar document chunks.",
      3: "<strong>Retrieve Context:</strong> The database returns only the specific paragraphs from your loaded documents that contain the answer. This is the 'Knowledge Base' restriction.",
      4: "<strong>LLM Inference (Phi-4):</strong> The system creates a strict prompt: <em>'Using ONLY the following text chunks, answer the user's query. If the answer is not in the text, say \"I don't know\".'</em> The local Phi-4 model processes this.",
      5: "<strong>Final Answer:</strong> The LLM generates a human-readable answer based entirely on your local documents, completely avoiding hallucinations outside the provided context."
    }
  };

  const lang = window.i18n ? window.i18n.getLang() : 'en';

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const step = btn.getAttribute('data-rag-step');
      panel.innerHTML = `<p class="text-on-surface" style="text-align:left;font-size:1rem;">${details[lang][step]}</p>`;
      // highlight selected, reset others
      buttons.forEach(b => {
        b.style.borderColor = '';
        b.style.backgroundColor = '';
      });
      btn.style.borderColor = '#059669';
      btn.style.backgroundColor = 'rgba(5,150,105,0.1)';
    });
  });
}

// ─── ARTICLE 006: RAG COST CALCULATOR ─────────────────────────────────────────

export function initRagCostCalculator(chart) {
  const slider  = document.getElementById('ragUsageSlider');
  const display = document.getElementById('ragQueryDisplay');
  if (!slider || !display) return;

  const update = () => {
    const val = parseInt(slider.value);
    // Logarithmic scale: 1→500, 100→50000
    const minV = Math.log(500);
    const maxV = Math.log(50000);
    const queries = Math.round(Math.exp(minV + (maxV - minV) * (val - 1) / 99));
    display.textContent = new Intl.NumberFormat('en-US').format(queries);

    const { localCosts, vpsCosts, apiStdCosts, apiAdvCosts } = calcRagCosts(queries);
    chart.data.datasets[0].data = localCosts;
    chart.data.datasets[1].data = vpsCosts;
    chart.data.datasets[2].data = apiStdCosts;
    chart.data.datasets[3].data = apiAdvCosts;
    chart.update();
  };

  slider.addEventListener('input', update);
  update();
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

// ─── UBUNTU QUIZ ──────────────────────────────────────────────────────────────

let ubuntuQuizStep = 0;
const ubuntuQuestions = {
  es: [
    "¿Tienes un PC moderno con NPU dedicada o una GPU de gama alta?",
    "¿Eres desarrollador y usas LLMs o asistentes de código locales?",
    "¿Es la estabilidad absoluta crítica para tu trabajo diario ahora mismo?"
  ],
  en: [
    "Do you have a modern PC with a dedicated NPU or a high-end GPU?",
    "Are you a developer who frequently uses local LLMs or AI coding assistants?",
    "Is absolute rock-solid system stability critical for your daily work right now?"
  ]
};

export function initUbuntuQuiz() {
  ubuntuQuizStep = 0;
  window.handleUbuntuQuiz = (answer) => {
    const lang = window.i18n.getLang();
    const qText = document.getElementById('quiz-question');
    
    if (ubuntuQuizStep === 0) {
      if (answer === 'yes') showUbuntuResult('upgrade_now_npu');
      else { ubuntuQuizStep = 1; if (qText) qText.textContent = ubuntuQuestions[lang][1]; }
    } else if (ubuntuQuizStep === 1) {
      if (answer === 'yes') showUbuntuResult('upgrade_now_dev');
      else { ubuntuQuizStep = 2; if (qText) qText.textContent = ubuntuQuestions[lang][2]; }
    } else if (ubuntuQuizStep === 2) {
      if (answer === 'yes') showUbuntuResult('wait');
      else showUbuntuResult('upgrade_general');
    }
  };
  window.resetUbuntuQuiz = () => {
    ubuntuQuizStep = 0;
    const qArea = document.getElementById('quiz-area');
    const rArea = document.getElementById('quiz-result');
    const qText = document.getElementById('quiz-question');
    if (qArea) qArea.classList.remove('hidden');
    if (rArea) rArea.classList.add('hidden');
    if (qText) qText.textContent = ubuntuQuestions[window.i18n.getLang()][0];
  };
}

function showUbuntuResult(type) {
  const lang = window.i18n.getLang();
  const qArea = document.getElementById('quiz-area');
  const rArea = document.getElementById('quiz-result');
  if (qArea) qArea.classList.add('hidden');
  if (rArea) rArea.classList.remove('hidden');

  const title = document.getElementById('result-title');
  const desc  = document.getElementById('result-desc');
  const icon  = document.getElementById('result-icon');

  const results = {
    es: {
      upgrade_now_npu: { icon: '🚀', title: '¡Actualiza ya!', desc: 'Tu hardware está preparado para la IA de 26.04.' },
      upgrade_now_dev: { icon: '💻', title: '¡Recomendado!', desc: 'El nuevo stack de IA y Devbox simplificarán tu trabajo.' },
      wait: { icon: '🛡️', title: 'Espera a la 26.04.1', desc: 'Si priorizas la estabilidad, espera a agosto.' },
      upgrade_general: { icon: '✨', title: 'Seguro Actualizar', desc: 'Las mejoras en GNOME y Snaps valen la pena.' }
    },
    en: {
      upgrade_now_npu: { icon: '🚀', title: 'Upgrade Now!', desc: 'Your hardware is perfectly suited for 26.04 AI.' },
      upgrade_now_dev: { icon: '💻', title: 'Recommended!', desc: 'The new AI stack and Devbox will simplify your work.' },
      wait: { icon: '🛡️', title: 'Wait for 26.04.1', desc: 'If stability is critical, wait until August.' },
      upgrade_general: { icon: '✨', title: 'Safe to Upgrade', desc: 'GNOME and Snap improvements are worth it.' }
    }
  };

  const res = results[lang][type];
  if (icon) icon.textContent = res.icon;
  if (title) title.textContent = res.title;
  if (desc) desc.textContent = res.desc;
}

