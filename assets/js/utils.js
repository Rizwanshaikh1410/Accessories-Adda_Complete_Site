window.AA = {
  async fetchProducts(){
    if(!this._cache){
      const res = await fetch('data/products.json');
      this._cache = await res.json();
    }
    return this._cache;
  },
  formatINR(v){
    return new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0}).format(v);
  },
  ratingStars(r){
    const full = Math.floor(r), half = (r - full) >= 0.5;
    let s='';
    for(let i=0;i<full;i++) s += '★';
    if(half) s += '☆';
    return `<span class="text-warning">${s}</span> <span class="small text-muted">(${r})</span>`;
  },
  templates: {
    card(p){
      const price = AA.formatINR(p.price);
      const mrp = AA.formatINR(p.mrp);
      const img = (p.images && p.images[0]) || 'https://placehold.co/600x600?text=Accessory';
      return `
      <div class="col-6 col-md-4 col-lg-3">
        <div class="card card-product h-100 shadow-sm position-relative">
          <span class="badge bg-success badge-price">Save ${AA.formatINR(p.mrp - p.price)}</span>
          <img src="${img}" class="card-img-top" alt="${p.name}">
          <div class="card-body d-flex flex-column">
            <div class="small text-muted">${p.brand} • ${p.category}</div>
            <h6 class="fw-semibold mt-1">${p.name}</h6>
            <div class="d-flex align-items-center gap-2">
              <span class="fw-bold">${price}</span>
              <s class="text-muted small">${mrp}</s>
            </div>
            <div class="mt-1">${AA.ratingStars(p.rating)}</div>
            <div class="mt-auto d-flex gap-2">
              <button class="btn btn-primary btn-sm flex-grow-1" onclick="AA.view(${p.id})">View</button>
              <a class="btn btn-outline-success btn-sm" target="_blank" href="https://wa.me/919770274616?text=${encodeURIComponent('Hi Accessories-Adda, I want: ' + p.name + ' (ID ' + p.id + ')')}">Enquire</a>
            </div>
          </div>
        </div>
      </div>`;
    },
    modal(p){
      const images = (p.images||[]).map(src => `<img src="${src}" class="img-fluid rounded">`).join('');
      return `
      <div class="modal fade" id="productModal" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${p.name}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">${images}</div>
                <div class="col-md-6">
                  <div class="small text-muted">${p.brand} • ${p.category}</div>
                  <div class="h4">${AA.formatINR(p.price)}</div>
                  <div>${AA.ratingStars(p.rating)}</div>
                  <p class="mt-2">${p.description}</p>
                  <ul class="small">
                    <li>Warranty: ${p.warranty}</li>
                    <li>Stock: ${p.stock} units</li>
                    <li>Tags: ${(p.tags||[]).join(', ')}</li>
                  </ul>
                  <div class="d-flex gap-2">
                    <a class="btn btn-success" target="_blank" href="https://wa.me/919770274616?text=${encodeURIComponent('Hi Accessories-Adda, I want: ' + p.name + ' (ID ' + p.id + ')')}">WhatsApp Enquiry</a>
                    <a class="btn btn-outline-primary" href="mailto:Accessoriesadda1410@gmail.com?subject=${encodeURIComponent('Product Enquiry ' + p.id)}&body=${encodeURIComponent(p.name)}">Email</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  view(id){
    this.fetchProducts().then(list => {
      const p = list.find(x => x.id === id);
      const html = this.templates.modal(p);
      const holder = document.createElement('div');
      holder.innerHTML = html;
      document.body.appendChild(holder.firstElementChild);
      const modal = new bootstrap.Modal(document.getElementById('productModal'));
      modal.show();
      const el = document.getElementById('productModal');
      el.addEventListener('hidden.bs.modal', () => el.remove());
    });
  }
};
