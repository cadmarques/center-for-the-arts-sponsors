document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  let sponsors = [];

  try {
    const res = await fetch('data/sponsors.json');
    if (!res.ok) throw new Error('Erro ao carregar sponsors.json');
    sponsors = await res.json();
  } catch (error) {
    console.error(error);
    document.getElementById('regularGrid').innerHTML = 
      `<div class="no-results">⚠️ Não foi possível carregar os sponsors.</div>`;
    return;
  }

  renderVIP(sponsors);
  renderRegular(sponsors);
  initSlideshow();
  initSearch(sponsors);
});

// ===== VIP CARDS (sempre visíveis, nunca filtrados) =====
function renderVIP(sponsors) {
  const grid = document.getElementById('vipGrid');
  if (!grid) return;
  grid.innerHTML = '';
  sponsors.filter(s => s.type === 'vip').forEach(s => grid.appendChild(createCard(s)));
}

// ===== REGULAR CARDS (com filtro exclusivo) =====
function renderRegular(sponsors, filter = '') {
  const grid = document.getElementById('regularGrid');
  const info = document.getElementById('resultsInfo');
  if (!grid || !info) return;

  grid.innerHTML = '';
  const query = filter.toLowerCase().trim();
  
  // Base: apenas sponsors não-VIP
  let filtered = sponsors.filter(s => s.type === 'regular');
  
  // Filtro apenas nesta lista
  if (query) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query) ||
      s.keywords.some(k => k.toLowerCase().includes(query))
    );
  }

  info.textContent = query
    ? (filtered.length > 0 
        ? `${filtered.length} sponsor${filtered.length !== 1 ? 'es' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`
        : `Nenhum resultado para "${filter}"`)
    : `${filtered.length} sponsors`;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="no-results"><span>🔍</span>${query ? `Nenhum resultado para "${filter}"` : 'Nenhum sponsor registado.'}</div>`;
    return;
  }
  filtered.forEach(s => grid.appendChild(createCard(s)));
}

// ===== CRIAR CARD =====
function createCard(sponsor) {
  const card = document.createElement('div');
  card.className = `sponsor-card ${sponsor.type === 'vip' ? 'vip' : ''}`;
  
  const imgHTML = sponsor.image 
    ? `<img src="${sponsor.image}" alt="${sponsor.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'placeholder-img\\'>${getInitials(sponsor.name)}</div>'" />`
    : `<div class="placeholder-img">${getInitials(sponsor.name)}</div>`;
  
  const badgeHTML = sponsor.type === 'vip' ? '<div class="vip-badge">★ VIP</div>' : '';
  const keywordsHTML = sponsor.keywords.map(k => `<span class="keyword-tag">${k}</span>`).join('');

  card.innerHTML = `
    ${badgeHTML}
    <div class="card-image">${imgHTML}</div>
    <div class="card-body">
      <div class="card-name">${sponsor.name}</div>
      <div class="card-desc">${sponsor.description}</div>
      <div class="card-keywords">${keywordsHTML}</div>
      <span class="card-link">Ver detalhes →</span>
    </div>
  `;

  // Placeholder para futura página de detalhe
  card.addEventListener('click', () => {
    // Quando tiveres a página de detalhe: window.open(`sponsor.html?id=${sponsor.id}`, '_blank');
    console.log(`[Preview] Abrir página para: ${sponsor.name} (ID: ${sponsor.id})`);
  });

  return card;
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

// ===== SLIDESHOW =====
function initSlideshow() {
  const container = document.getElementById('slideshow');
  const dotsBox = document.getElementById('slideDots');
  if (!container || !dotsBox) return;

  const slides = container.querySelectorAll('.slide');
  let current = 0;
  let interval;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `slide-dot ${i === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goTo(i));
    dotsBox.appendChild(dot);
  });

  container.querySelector('.prev').addEventListener('click', () => change(-1));
  container.querySelector('.next').addEventListener('click', () => change(1));

  function goTo(i) {
    slides[current].classList.remove('active');
    dotsBox.children[current].classList.remove('active');
    current = i;
    slides[current].classList.add('active');
    dotsBox.children[current].classList.add('active');
    reset();
  }

  function change(dir) { goTo((current + dir + slides.length) % slides.length); }
  function start() { interval = setInterval(() => change(1), 5000); }
  function reset() { clearInterval(interval); start(); }
  start();
}

// ===== SEARCH =====
function initSearch(sponsors) {
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');
  if (!input || !clearBtn) return;

  input.addEventListener('input', (e) => renderRegular(sponsors, e.target.value));
  clearBtn.addEventListener('click', () => {
    input.value = '';
    renderRegular(sponsors);
    input.focus();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') clearBtn.click(); });
}