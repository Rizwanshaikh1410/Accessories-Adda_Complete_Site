AA.initProductsPage = async function(){
  const url = new URL(window.location.href);
  const initialQuery = url.searchParams.get('q') || '';
  const initialCat = url.searchParams.get('category') || '';
  const list = await AA.fetchProducts();

  const state = {
    q: initialQuery,
    category: initialCat,
    brand: '',
    sort: 'relevance',
    page: 1,
    perPage: 24
  };

  const els = {
    grid: document.getElementById('productGrid'),
    search: document.getElementById('searchInput'),
    category: document.getElementById('categorySelect'),
    brand: document.getElementById('brandSelect'),
    sort: document.getElementById('sortSelect'),
    pagination: document.getElementById('pagination')
  };

  if(els.search) els.search.value = state.q;
  if(els.category) els.category.value = state.category;

  function apply(){
    let filtered = list.slice();

    const q = state.q.trim().toLowerCase();
    if(q){
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags||[]).some(t => t.toLowerCase().includes(q))
      );
    }

    if(state.category){
      filtered = filtered.filter(p => p.category === state.category);
    }
    if(state.brand){
      filtered = filtered.filter(p => p.brand === state.brand);
    }

    switch(state.sort){
      case 'priceAsc': filtered.sort((a,b)=>a.price-b.price); break;
      case 'priceDesc': filtered.sort((a,b)=>b.price-a.price); break;
      case 'ratingDesc': filtered.sort((a,b)=>b.rating-a.rating); break;
      case 'nameAsc': filtered.sort((a,b)=>a.name.localeCompare(b.name)); break;
      default: break;
    }

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / state.perPage));
    if(state.page > pages) state.page = pages;
    const start = (state.page - 1) * state.perPage;
    const items = filtered.slice(start, start + state.perPage);

    els.grid.innerHTML = items.map(AA.templates.card).join('') || '<div class="p-5 text-center text-muted">No products found.</div>';

    els.pagination.innerHTML = '';
    const addPage = (n, label=n, active=false, disabled=false) => {
      const li = document.createElement('li');
      li.className = `page-item ${active?'active':''} ${disabled?'disabled':''}`;
      li.innerHTML = `<a class="page-link" href="#">${label}</a>`;
      li.addEventListener('click', (e)=>{
        e.preventDefault();
        if(disabled) return;
        state.page = n; apply();
        window.scrollTo({top:0, behavior:'smooth'});
      });
      els.pagination.appendChild(li);
    };
    addPage(Math.max(1, state.page-1), '«', false, state.page===1);
    for(let i=1;i<=pages;i++){
      if(i===1 || i===pages || Math.abs(i-state.page)<=2){
        addPage(i, i, i===state.page);
      }else if(Math.abs(i-state.page)===3){
        const li = document.createElement('li');
        li.className = 'page-item disabled';
        li.innerHTML = `<span class="page-link">…</span>`;
        els.pagination.appendChild(li);
      }
    }
    addPage(Math.min(pages, state.page+1), '»', false, state.page===pages);
  }

  if(els.search) els.search.addEventListener('input', e => { state.q = e.target.value; state.page=1; apply(); });
  if(els.category) els.category.addEventListener('change', e => { state.category = e.target.value; state.page=1; apply(); });
  if(els.brand) els.brand.addEventListener('change', e => { state.brand = e.target.value; state.page=1; apply(); });
  if(els.sort) els.sort.addEventListener('change', e => { state.sort = e.target.value; state.page=1; apply(); });

  if(els.brand){
    const brands = Array.from(new Set(list.map(p=>p.brand))).sort();
    els.brand.innerHTML = '<option value="">All Brands</option>' + brands.map(b=>`<option value="${b}">${b}</option>`).join('');
    if(state.brand) els.brand.value = state.brand;
  }

  apply();
};
