// Simple client-side renderer for services catalog
// Loads /data/services.json, populates category filter, supports search.

async function loadServices() {
  try {
    const res = await fetch('/data/services.json', {cache: 'no-store'});
    if (!res.ok) throw new Error('Failed to load services');
    const items = await res.json();
    return items;
  } catch (err) {
    console.error(err);
    return [];
  }
}

function uniq(arr){ return [...new Set(arr)] }

function renderCard(item){
  const div = document.createElement('article');
  div.className = 'card';
  div.innerHTML = `
    <div class="logo" aria-hidden="true">${(item.name[0]||'S').toUpperCase()}</div>
    <div class="meta">
      <h3>${item.name}</h3>
      <div class="by" style="color:var(--muted);font-size:13px">${item.category} • ${item.rating || '—'}★</div>
      <p class="desc">${item.description || ''}</p>
      <div style="margin-top:8px;font-size:13px;color:var(--muted)">
        ${item.phone ? `📞 ${item.phone}` : ''} ${item.email ? ` • ✉️ ${item.email}` : ''}
      </div>
    </div>
  `;
  return div;
}

function renderList(items){
  const container = document.getElementById('services');
  container.innerHTML = '';
  if (!items.length){
    container.innerHTML = '<p style="color:var(--muted)">No services match your search.</p>';
    return;
  }
  const frag = document.createDocumentFragment();
  items.forEach(it => frag.appendChild(renderCard(it)));
  container.appendChild(frag);
}

function setupFilters(allItems){
  const category = document.getElementById('category');
  const cats = ['all', ...uniq(allItems.map(i => i.category).filter(Boolean))];
  category.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

function applyFilters(items){
  const q = document.getElementById('search').value.trim().toLowerCase();
  const cat = document.getElementById('category').value;
  return items.filter(it => {
    if (cat !== 'all' && it.category !== cat) return false;
    if (!q) return true;
    const hay = `${it.name} ${it.description} ${it.category} ${(it.tags||[]).join(' ')}`.toLowerCase();
    return hay.includes(q);
  });
}

(async function init(){
  const items = await loadServices();
  setupFilters(items);
  renderList(items);

  const search = document.getElementById('search');
  const category = document.getElementById('category');

  function refresh(){ renderList(applyFilters(items)); }

  search.addEventListener('input', refresh);
  category.addEventListener('change', refresh);

  // keyboard accessibility: focus first result on Enter in search
  search.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter'){
      const first = document.querySelector('.card');
      if (first) first.scrollIntoView({behavior:'smooth', block:'center'});
    }
  });
})();
