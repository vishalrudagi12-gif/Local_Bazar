// LocalBazar Controller with 3 Characters: Customer · Seller · Admin
let currentCatalogTab = 'products';
let activeFilters = {
  category: 'all',
  neighborhood: 'All Neighborhoods',
  maxDistance: 5,
  fulfillment: '',
  sort: 'popular',
  search: ''
};

let sellerRevenueChart = null;
let sellerCategoryChart = null;
let adminNeighborhoodChart = null;
let currentSellerShopId = 'shop-1';

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  renderCategoryPills();
  updateHeaderProfile();
  renderMarketplace();
  updateCartBadge();
  updateCompareDock();
  setupSearchInputs();
});

// Toast Notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  const icons = {
    success: 'fa-circle-check text-emerald-500',
    warning: 'fa-triangle-exclamation text-amber-500',
    error: 'fa-circle-exclamation text-rose-500',
    info: 'fa-circle-info text-blue-500',
    admin: 'fa-shield-halved text-purple-600'
  };

  toast.className = 'glass bg-white/95 px-4 py-3 rounded-2xl shadow-xl border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2.5 transform translate-y-2 opacity-0 transition-all duration-300 pointer-events-auto max-w-sm';
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info} text-base"></i>
    <span class="flex-1">${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Modal Helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
}

// ==================== AUTH & 3-ROLE CONTROLLER ====================
function openAuthModal() {
  openModal('modal-auth');
}

function loginAs(role) {
  const user = window.store.switchRole(role);
  closeModal('modal-auth');
  updateHeaderProfile();

  if (role === 'customer') {
    switchView('marketplace');
    showToast(`Logged in as Customer: ${user.name}`, 'success');
  } else if (role === 'seller') {
    currentSellerShopId = user.shopId || 'shop-1';
    switchView('seller-portal');
    showToast(`Logged in as Local Seller: ${user.name}`, 'warning');
  } else if (role === 'admin') {
    switchView('admin-portal');
    showToast(`Logged in as City Admin: ${user.name}`, 'admin');
  }
}

function handleCustomLogin(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email-input').value;
  const role = document.getElementById('auth-role-select').value;
  
  const user = window.store.switchRole(role);
  user.email = email;
  user.name = email.split('@')[0].toUpperCase();
  window.store.save();

  closeModal('modal-auth');
  updateHeaderProfile();

  if (role === 'customer') switchView('marketplace');
  if (role === 'seller') switchView('seller-portal');
  if (role === 'admin') switchView('admin-portal');
  showToast(`Welcome ${user.name}! Switched to ${role.toUpperCase()} persona.`, 'success');
}

function updateHeaderProfile() {
  const user = window.store.currentUser || window.store.getDemoUsers().customer;
  document.getElementById('header-user-avatar').src = user.avatar;
  document.getElementById('header-user-name').textContent = user.name;
  
  const roleEl = document.getElementById('header-user-role');
  roleEl.textContent = user.role.toUpperCase();

  if (user.role === 'customer') roleEl.className = 'block text-[9px] font-bold text-emerald-700 uppercase tracking-wider';
  if (user.role === 'seller') roleEl.className = 'block text-[9px] font-bold text-amber-600 uppercase tracking-wider';
  if (user.role === 'admin') roleEl.className = 'block text-[9px] font-bold text-purple-700 uppercase tracking-wider';

  // Update Platform Announcement text
  document.getElementById('platform-announcement-text').textContent = window.store.platformAnnouncement;
}

// View Navigation: Marketplace vs Seller Portal vs Admin Portal
function switchView(viewName) {
  const marketView = document.getElementById('view-marketplace');
  const sellerView = document.getElementById('view-seller-portal');
  const adminView = document.getElementById('view-admin-portal');

  const navMarket = document.getElementById('nav-btn-marketplace');
  const navSeller = document.getElementById('nav-btn-seller');
  const navAdmin = document.getElementById('nav-btn-admin');

  // Reset nav styles
  [navMarket, navSeller, navAdmin].forEach(b => {
    b.className = 'px-2.5 sm:px-3 py-1.5 rounded-lg transition-all text-slate-600 hover:text-slate-900 flex items-center gap-1';
  });

  marketView.classList.add('hidden');
  sellerView.classList.add('hidden');
  adminView.classList.add('hidden');

  if (viewName === 'marketplace') {
    marketView.classList.remove('hidden');
    navMarket.className = 'px-2.5 sm:px-3 py-1.5 rounded-lg transition-all bg-white text-slate-900 shadow-sm flex items-center gap-1';
    renderMarketplace();
  } else if (viewName === 'seller-portal') {
    sellerView.classList.remove('hidden');
    navSeller.className = 'px-2.5 sm:px-3 py-1.5 rounded-lg transition-all bg-white text-slate-900 shadow-sm flex items-center gap-1';
    renderSellerDashboard();
  } else if (viewName === 'admin-portal') {
    adminView.classList.remove('hidden');
    navAdmin.className = 'px-2.5 sm:px-3 py-1.5 rounded-lg transition-all bg-purple-700 text-white shadow-sm flex items-center gap-1';
    renderAdminPortal();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Header & Locality Setup
function initHeader() {
  const select = document.getElementById('header-neighborhood-select');
  select.innerHTML = MOCK_DATA.neighborhoods.map(n => 
    `<option value="${n}" ${n === activeFilters.neighborhood ? 'selected' : ''}>${n}</option>`
  ).join('');
}

function onNeighborhoodChange(val) {
  activeFilters.neighborhood = val;
  renderMarketplace();
  showToast(`Showing sellers & finds in: ${val}`, 'info');
}

function setupSearchInputs() {
  const desktopSearch = document.getElementById('global-search-input');
  const mobileSearch = document.getElementById('mobile-search-input');

  const handleInput = (e) => {
    activeFilters.search = e.target.value.trim();
    renderMarketplace();
  };

  if (desktopSearch) desktopSearch.addEventListener('input', handleInput);
  if (mobileSearch) mobileSearch.addEventListener('input', handleInput);
}

// Category Pills
function renderCategoryPills() {
  const container = document.getElementById('category-pills-container');
  container.innerHTML = MOCK_DATA.categories.map(cat => {
    const isActive = activeFilters.category === cat.id;
    return `
      <button onclick="setCategoryFilter('${cat.id}')" 
              class="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isActive 
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 scale-105' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }">
        <span class="text-sm">${cat.icon}</span>
        <span>${cat.name}</span>
      </button>
    `;
  }).join('');
}

function setCategoryFilter(catId) {
  activeFilters.category = catId;
  renderCategoryPills();
  renderMarketplace();
}

// ==================== VIEW 1: CUSTOMER MARKETPLACE ====================
function renderMarketplace() {
  renderRecommendations();
  renderCatalog();
}

function renderRecommendations() {
  const recs = window.store.getRecommendations();

  const trendingContainer = document.getElementById('recommendations-trending-grid');
  trendingContainer.innerHTML = recs.trending.map(prod => renderMiniProductCard(prod, '🔥 Trending')).join('');

  const curatedContainer = document.getElementById('recommendations-curated-grid');
  curatedContainer.innerHTML = recs.categoryPicks.map(prod => renderMiniProductCard(prod, '✨ Curated')).join('');
}

function renderMiniProductCard(product, tagLabel) {
  const shop = window.store.getShop(product.shopId);
  const isCompared = window.store.isInCompare(product.id);

  return `
    <div class="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm card-hover flex flex-col justify-between">
      <div>
        <div class="relative rounded-xl overflow-hidden mb-2.5 h-32 bg-slate-100 cursor-pointer" onclick="openProductDetailsModal('${product.id}')">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
          <div class="absolute top-2 left-2 flex flex-col gap-1">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow">
              ${tagLabel}
            </span>
            ${product.adminFeatured ? `
              <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-700 text-white shadow">
                ⭐ Admin Choice
              </span>
            ` : ''}
          </div>
          ${product.stock <= 5 ? `
            <span class="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-white shadow">
              Only ${product.stock} left
            </span>
          ` : ''}
        </div>
        <p class="text-[10px] text-brand-700 font-bold uppercase tracking-wider">${shop?.name || 'Local Maker'}</p>
        <h4 class="font-bold text-xs text-slate-900 line-clamp-1 cursor-pointer hover:text-brand-600" onclick="openProductDetailsModal('${product.id}')">
          ${product.name}
        </h4>
        <div class="flex items-center gap-1 text-[11px] text-amber-500 font-bold mt-1">
          <i class="fa-solid fa-star text-[10px]"></i> ${product.rating}
          <span class="text-slate-400 font-normal">(${product.salesCount} sold)</span>
        </div>
      </div>

      <div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
        <span class="text-sm font-extrabold text-slate-900">₹${product.price}</span>
        <div class="flex items-center gap-1.5">
          <button onclick="toggleCompareProduct('${product.id}')" title="Compare" class="p-1.5 rounded-lg border ${isCompared ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'} text-xs">
            <i class="fa-solid fa-scale-balanced"></i>
          </button>
          <button onclick="handleAddToCart('${product.id}')" title="Add to Basket" class="p-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

function setCatalogTab(tab) {
  currentCatalogTab = tab;
  const btnProds = document.getElementById('tab-btn-products');
  const btnShops = document.getElementById('tab-btn-shops');
  const prodsContainer = document.getElementById('catalog-products-container');
  const shopsContainer = document.getElementById('catalog-shops-container');

  if (tab === 'products') {
    btnProds.className = 'px-3 py-1.5 rounded-md bg-white text-slate-900 shadow-sm';
    btnShops.className = 'px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900';
    prodsContainer.classList.remove('hidden');
    shopsContainer.classList.add('hidden');
  } else {
    btnProds.className = 'px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900';
    btnShops.className = 'px-3 py-1.5 rounded-md bg-white text-slate-900 shadow-sm';
    prodsContainer.classList.add('hidden');
    shopsContainer.classList.remove('hidden');
  }
  renderCatalog();
}

function onFilterChange() {
  const dist = document.getElementById('filter-distance').value;
  const ful = document.getElementById('filter-fulfillment').value;
  const sort = document.getElementById('filter-sort').value;

  activeFilters.maxDistance = dist ? Number(dist) : null;
  activeFilters.fulfillment = ful;
  activeFilters.sort = sort;

  renderCatalog();
}

function renderCatalog() {
  const products = window.store.getProducts(activeFilters);
  const allShops = window.store.shops.filter(s => !s.suspended);

  let filteredShops = [...allShops];
  if (activeFilters.neighborhood !== 'All Neighborhoods') {
    filteredShops = filteredShops.filter(s => s.neighborhood === activeFilters.neighborhood);
  }
  if (activeFilters.maxDistance) {
    filteredShops = filteredShops.filter(s => s.distanceKm <= activeFilters.maxDistance);
  }
  if (activeFilters.search) {
    const q = activeFilters.search.toLowerCase();
    filteredShops = filteredShops.filter(s => s.name.toLowerCase().includes(q) || s.story.toLowerCase().includes(q));
  }

  document.getElementById('total-products-count').textContent = products.length;
  document.getElementById('total-shops-count').textContent = filteredShops.length;

  // Render Products Grid
  const productsGrid = document.getElementById('products-grid');
  if (products.length === 0) {
    productsGrid.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="text-4xl mb-3">🧺</div>
        <h4 class="text-base font-bold text-slate-800">No local finds match your search criteria</h4>
        <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Try widening your radius or choosing another category.</p>
      </div>
    `;
  } else {
    productsGrid.innerHTML = products.map(prod => renderFullProductCard(prod)).join('');
  }

  // Render Shops Grid
  const shopsGrid = document.getElementById('shops-grid');
  if (filteredShops.length === 0) {
    shopsGrid.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="text-4xl mb-3">🏪</div>
        <h4 class="text-base font-bold text-slate-800">No local shops found matching this query</h4>
      </div>
    `;
  } else {
    shopsGrid.innerHTML = filteredShops.map(shop => renderShopCard(shop)).join('');
  }
}

function renderFullProductCard(product) {
  const shop = window.store.getShop(product.shopId);
  const isCompared = window.store.isInCompare(product.id);

  return `
    <article class="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm card-hover flex flex-col justify-between">
      <div>
        <div class="relative rounded-2xl overflow-hidden mb-3 h-48 bg-slate-100 cursor-pointer group" onclick="openProductDetailsModal('${product.id}')">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          
          <div class="absolute top-2.5 left-2.5 flex flex-col gap-1">
            <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/95 text-slate-900 shadow-sm flex items-center gap-1">
              <i class="fa-solid fa-location-dot text-brand-600"></i> ${shop?.distanceKm || 1.5} km
            </span>
            ${product.adminFeatured ? `
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-700 text-white shadow-sm flex items-center gap-1">
                ⭐ Admin Choice
              </span>
            ` : ''}
            ${product.stock <= 5 ? `
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white shadow-sm">
                Low Stock: ${product.stock} left
              </span>
            ` : ''}
          </div>

          <div class="absolute bottom-2.5 right-2.5">
            <button onclick="event.stopPropagation(); toggleCompareProduct('${product.id}')" 
                    title="${isCompared ? 'Remove Comparison' : 'Add Comparison'}"
                    class="px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-md transition-all flex items-center gap-1 ${
                      isCompared ? 'bg-slate-900 text-white' : 'bg-white/90 hover:bg-white text-slate-800'
                    }">
              <i class="fa-solid fa-scale-balanced ${isCompared ? 'text-brand-400' : 'text-slate-500'}"></i>
              <span>${isCompared ? 'Compared' : 'Compare'}</span>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2 mb-1.5 cursor-pointer" onclick="openShopDetailsModal('${shop?.id}')">
          <img src="${shop?.avatar}" class="w-5 h-5 rounded-full object-cover">
          <span class="text-xs font-bold text-slate-700 hover:text-brand-600 truncate">${shop?.name}</span>
          ${shop?.verified ? '<i class="fa-solid fa-circle-check text-brand-600 text-[10px]" title="Verified Local Merchant"></i>' : ''}
        </div>

        <h3 class="font-bold text-sm text-slate-900 leading-snug cursor-pointer hover:text-brand-600" onclick="openProductDetailsModal('${product.id}')">
          ${product.name}
        </h3>
        <p class="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">${product.description}</p>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div class="flex items-baseline gap-1">
            <span class="text-lg font-black text-slate-900">₹${product.price}</span>
            ${product.originalPrice ? `<span class="text-xs text-slate-400 line-through">₹${product.originalPrice}</span>` : ''}
          </div>
          <span class="text-[10px] text-slate-400 block">${product.unit}</span>
        </div>

        <button onclick="handleAddToCart('${product.id}')" 
                class="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5">
          <i class="fa-solid fa-basket-shopping"></i> Add +
        </button>
      </div>
    </article>
  `;
}

function renderShopCard(shop) {
  const shopProducts = window.store.getProducts({ shopId: shop.id });

  return `
    <article class="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm card-hover flex flex-col justify-between">
      <div>
        <div class="h-32 bg-slate-200 relative">
          <img src="${shop.banner}" alt="${shop.name}" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>
          <span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white text-slate-900 shadow">
            📍 ${shop.neighborhood} (${shop.distanceKm} km)
          </span>
          <div class="absolute -bottom-4 left-4">
            <img src="${shop.avatar}" alt="${shop.name}" class="w-12 h-12 rounded-2xl border-2 border-white object-cover shadow-md">
          </div>
        </div>

        <div class="pt-6 px-5 pb-3">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-base text-slate-900 flex items-center gap-1.5">
              ${shop.name}
              ${shop.verified ? '<i class="fa-solid fa-circle-check text-brand-600 text-xs"></i>' : ''}
            </h3>
            <span class="text-xs font-bold text-amber-500 flex items-center gap-1">
              ⭐ ${shop.rating} <span class="text-slate-400 font-normal">(${shop.reviewCount})</span>
            </span>
          </div>
          <p class="text-xs text-brand-700 font-semibold mt-0.5">${shop.tagline}</p>
          <p class="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">${shop.story}</p>
        </div>
      </div>

      <div class="p-5 pt-0 border-t border-slate-100 flex items-center gap-2 mt-3">
        <a href="https://wa.me/${shop.whatsapp}" target="_blank" title="WhatsApp Chat" class="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 transition-colors flex items-center gap-1.5">
          <i class="fa-brands fa-whatsapp text-sm"></i> WhatsApp
        </a>
        <button onclick="openShopDetailsModal('${shop.id}')" class="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition-all text-center">
          Visit Store (${shopProducts.length} items) →
        </button>
      </div>
    </article>
  `;
}

// Product Comparison Dock & Modal
function toggleCompareProduct(productId) {
  const res = window.store.toggleCompare(productId);
  if (!res.success) {
    showToast(res.message, 'warning');
    return;
  }
  updateCompareDock();
  renderMarketplace();
  showToast(window.store.isInCompare(productId) ? 'Added to Comparison' : 'Removed from Comparison', 'info');
}

function updateCompareDock() {
  const dock = document.getElementById('compare-floating-dock');
  const count = document.getElementById('compare-dock-count');
  const len = window.store.compareList.length;

  if (len > 0) {
    dock.classList.remove('hidden');
    count.textContent = `${len}/3`;
  } else {
    dock.classList.add('hidden');
  }
}

function clearCompareList() {
  window.store.clearCompare();
  updateCompareDock();
  renderMarketplace();
  showToast('Comparison list cleared', 'info');
}

function openComparisonModal() {
  const list = window.store.compareList.map(id => window.store.getProduct(id)).filter(Boolean);
  if (list.length === 0) {
    showToast('Select products to compare first.', 'warning');
    return;
  }

  const container = document.getElementById('comparison-modal-content');
  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="p-3 bg-slate-50 text-slate-500 font-bold uppercase w-1/4">Comparison Attribute</th>
            ${list.map(p => `
              <th class="p-3 text-slate-900 font-bold text-sm">
                <div class="flex flex-col gap-2">
                  <img src="${p.image}" class="w-24 h-24 rounded-xl object-cover shadow-sm">
                  <span class="line-clamp-2">${p.name}</span>
                </div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium">
          <tr>
            <td class="p-3 bg-slate-50 text-slate-600 font-semibold">Local Seller</td>
            ${list.map(p => {
              const s = window.store.getShop(p.shopId);
              return `<td class="p-3 font-bold text-slate-900">${s?.name || 'Local'} (📍 ${s?.distanceKm} km away)</td>`;
            }).join('')}
          </tr>
          <tr>
            <td class="p-3 bg-slate-50 text-slate-600 font-semibold">Price & Size</td>
            ${list.map(p => `
              <td class="p-3">
                <span class="text-base font-extrabold text-brand-700">₹${p.price}</span>
                <span class="text-slate-400 block">${p.unit}</span>
              </td>
            `).join('')}
          </tr>
          <tr>
            <td class="p-3 bg-slate-50 text-slate-600 font-semibold">Customer Rating</td>
            ${list.map(p => `
              <td class="p-3 text-amber-500 font-bold">⭐ ${p.rating} / 5.0 (${p.salesCount} sold)</td>
            `).join('')}
          </tr>
          <tr>
            <td class="p-3 bg-slate-50 text-slate-600 font-semibold">Ingredients / Materials</td>
            ${list.map(p => `
              <td class="p-3 text-slate-600 leading-relaxed">${p.ingredients || p.description}</td>
            `).join('')}
          </tr>
          <tr>
            <td class="p-3 bg-slate-50 text-slate-600 font-semibold">Stock Availability</td>
            ${list.map(p => `
              <td class="p-3">
                ${p.stock <= 5 
                  ? `<span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">Low: ${p.stock} left</span>`
                  : `<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">${p.stock} in stock</span>`
                }
              </td>
            `).join('')}
          </tr>
          <tr>
            <td class="p-3 bg-slate-50 text-slate-600 font-semibold">Action</td>
            ${list.map(p => `
              <td class="p-3">
                <button onclick="handleAddToCart('${p.id}'); closeModal('modal-comparison')" class="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm text-center">
                  Add to Basket
                </button>
              </td>
            `).join('')}
          </tr>
        </tbody>
      </table>
    </div>
  `;

  openModal('modal-comparison');
}

// Shop Details Modal
function openShopDetailsModal(shopId) {
  const shop = window.store.getShop(shopId);
  if (!shop) return;
  const products = window.store.getProducts({ shopId: shop.id });

  const container = document.getElementById('shop-details-container');
  container.innerHTML = `
    <div class="relative h-48 bg-slate-200">
      <img src="${shop.banner}" alt="${shop.name}" class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
      <button onclick="closeModal('modal-shop-details')" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="absolute bottom-4 left-6 flex items-center gap-4">
        <img src="${shop.avatar}" class="w-16 h-16 rounded-2xl border-4 border-white object-cover shadow-lg">
        <div class="text-white">
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-extrabold">${shop.name}</h2>
            ${shop.verified ? '<i class="fa-solid fa-circle-check text-brand-400 text-sm"></i>' : ''}
          </div>
          <p class="text-xs text-brand-200 font-medium">${shop.tagline}</p>
        </div>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
        <div class="flex items-center gap-4 text-slate-700">
          <div><span class="text-slate-400 block">Locality:</span> <b>📍 ${shop.neighborhood} (${shop.distanceKm} km)</b></div>
          <div><span class="text-slate-400 block">Hours:</span> <b>⏰ ${shop.hours}</b></div>
          <div><span class="text-slate-400 block">Rating:</span> <b class="text-amber-500">⭐ ${shop.rating} (${shop.reviewCount})</b></div>
        </div>
        <div class="flex items-center gap-2">
          <a href="https://wa.me/${shop.whatsapp}" target="_blank" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm">
            <i class="fa-brands fa-whatsapp text-sm"></i> WhatsApp Shop
          </a>
          <a href="tel:${shop.phone}" class="px-3 py-2 rounded-xl bg-slate-200 text-slate-800 font-semibold flex items-center gap-1.5">
            <i class="fa-solid fa-phone text-xs"></i> Call
          </a>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-2 space-y-2">
          <h4 class="font-bold text-slate-900 text-sm uppercase tracking-wider">Artisan Story</h4>
          <p class="text-xs text-slate-600 leading-relaxed">${shop.story}</p>
        </div>

        <div class="bg-brand-50/60 p-4 rounded-2xl border border-brand-100">
          <h4 class="font-bold text-brand-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <i class="fa-solid fa-bullhorn text-brand-600"></i> Store Announcements
          </h4>
          <div class="space-y-2 text-xs">
            ${shop.announcements && shop.announcements.length ? shop.announcements.map(a => `
              <div class="p-2.5 rounded-xl bg-white border border-brand-100 shadow-2xs">
                <p class="text-slate-800 font-medium">${a.text}</p>
                <span class="text-[10px] text-slate-400 block mt-1">${a.date}</span>
              </div>
            `).join('') : '<p class="text-slate-500">No announcements right now.</p>'}
          </div>
        </div>
      </div>

      <div>
        <h4 class="font-bold text-slate-900 text-base mb-4">Artisanal Catalog (${products.length})</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          ${products.map(p => renderFullProductCard(p)).join('')}
        </div>
      </div>
    </div>
  `;

  openModal('modal-shop-details');
}

// Product Details Modal
function openProductDetailsModal(productId) {
  const product = window.store.getProduct(productId);
  if (!product) return;
  const shop = window.store.getShop(product.shopId);
  const reviews = window.store.reviews.filter(r => r.productId === product.id);

  window.store.recordView(productId);

  const container = document.getElementById('product-details-container');
  container.innerHTML = `
    <div class="p-6">
      <div class="flex justify-between items-start mb-4">
        <div>
          <span class="text-xs font-bold text-brand-700 uppercase tracking-wider">📍 ${shop?.neighborhood} · ${shop?.distanceKm} km away</span>
          <h2 class="text-2xl font-extrabold text-slate-900 mt-1">${product.name}</h2>
          <p class="text-xs text-slate-500">Offered by <b class="text-slate-800 cursor-pointer hover:underline" onclick="closeModal('modal-product-details'); openShopDetailsModal('${shop?.id}')">${shop?.name}</b></p>
        </div>
        <button onclick="closeModal('modal-product-details')" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <img src="${product.image}" class="w-full h-72 rounded-2xl object-cover shadow-sm mb-3">
          <div class="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-200">
            <div class="flex justify-between"><span>Unit Weight / Size:</span> <b>${product.unit}</b></div>
            <div class="flex justify-between"><span>Available Inventory:</span> <b class="${product.stock <= 5 ? 'text-amber-600 font-bold' : 'text-slate-800'}">${product.stock} units</b></div>
          </div>
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-black text-slate-900">₹${product.price}</span>
              ${product.originalPrice ? `<span class="text-sm text-slate-400 line-through">₹${product.originalPrice}</span>` : ''}
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Direct Local Price</span>
            </div>
            <div class="flex items-center gap-1.5 text-amber-500 font-bold mt-1">
              ⭐ ${product.rating} / 5.0 <span class="text-slate-400 font-normal">(${product.salesCount} purchases)</span>
            </div>
          </div>

          <div>
            <h4 class="font-bold text-slate-800 uppercase tracking-wide text-[11px] mb-1">About This Local Find</h4>
            <p class="text-slate-600 leading-relaxed">${product.description}</p>
          </div>

          ${product.ingredients ? `
            <div>
              <h4 class="font-bold text-slate-800 uppercase tracking-wide text-[11px] mb-1">Ingredients / Materials</h4>
              <p class="text-slate-600 leading-relaxed p-2.5 bg-slate-50 rounded-xl border border-slate-200">${product.ingredients}</p>
            </div>
          ` : ''}

          <div class="pt-2 flex gap-2">
            <button onclick="handleAddToCart('${product.id}'); closeModal('modal-product-details')" class="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-md">
              <i class="fa-solid fa-basket-shopping mr-1"></i> Add to Local Basket
            </button>
            <button onclick="toggleCompareProduct('${product.id}'); closeModal('modal-product-details')" class="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs">
              <i class="fa-solid fa-scale-balanced"></i>
            </button>
          </div>

          <div class="pt-4 border-t border-slate-100">
            <h4 class="font-bold text-slate-900 text-xs mb-2">💬 Ask ${shop?.owner || 'the Maker'} a Question</h4>
            <form onsubmit="handleSendInquiry(event, '${product.id}', '${shop?.id}')" class="space-y-2">
              <input type="text" id="inquiry-customer-name" required placeholder="Your Name" value="${window.store.currentUser?.name || 'Local Neighbor'}" class="w-full p-2 rounded-lg border border-slate-200 outline-none">
              <textarea id="inquiry-message" required rows="2" placeholder="Ask about ingredients, delivery timing, or bulk batches..." class="w-full p-2 rounded-lg border border-slate-200 outline-none"></textarea>
              <button type="submit" class="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow">
                Send Direct Message to Seller
              </button>
            </form>
          </div>
        </div>
      </div>

      <div class="mt-8 pt-6 border-t border-slate-200">
        <h3 class="font-bold text-slate-900 text-sm mb-3">Customer Reviews (${reviews.length})</h3>
        <div class="space-y-3 mb-4">
          ${reviews.map(r => `
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-slate-800">${r.customerName}</span>
                <span class="text-amber-500 font-bold">⭐ ${r.rating}/5 · <span class="text-slate-400 font-normal">${r.date}</span></span>
              </div>
              <p class="text-slate-600">${r.comment}</p>
            </div>
          `).join('')}
        </div>

        <form onsubmit="handleAddReview(event, '${product.id}')" class="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 text-xs space-y-2">
          <span class="font-bold text-brand-900 block">Write a Local Review</span>
          <div class="flex gap-2">
            <input type="text" id="review-customer-name" required value="${window.store.currentUser?.name || 'Customer'}" class="flex-1 p-2 rounded-lg border border-slate-200 bg-white">
            <select id="review-rating" class="p-2 rounded-lg border border-slate-200 bg-white font-bold text-amber-600">
              <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
              <option value="4">⭐⭐⭐⭐ (4/5)</option>
              <option value="3">⭐⭐⭐ (3/5)</option>
            </select>
          </div>
          <input type="text" id="review-comment" required placeholder="Share your experience with this local find..." class="w-full p-2 rounded-lg border border-slate-200 bg-white">
          <button type="submit" class="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm">Submit Review</button>
        </form>
      </div>
    </div>
  `;

  openModal('modal-product-details');
}

function handleSendInquiry(e, productId, shopId) {
  e.preventDefault();
  const name = document.getElementById('inquiry-customer-name').value;
  const message = document.getElementById('inquiry-message').value;
  const prod = window.store.getProduct(productId);

  window.store.sendInquiry({
    shopId,
    productId,
    productName: prod?.name || 'Artisan Item',
    customerName: name,
    customerEmail: window.store.currentUser?.email || 'buyer@localbazar.com',
    message
  });

  showToast('Inquiry sent directly to the local seller!', 'success');
  closeModal('modal-product-details');
}

function handleAddReview(e, productId) {
  e.preventDefault();
  const name = document.getElementById('review-customer-name').value;
  const rating = Number(document.getElementById('review-rating').value);
  const comment = document.getElementById('review-comment').value;

  window.store.addReview({
    productId,
    customerName: name,
    rating,
    comment
  });

  showToast('Review submitted! Supporting local businesses.', 'success');
  openProductDetailsModal(productId);
  renderMarketplace();
}

// Basket & Checkout
function toggleCartDrawer(open) {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');

  if (open) {
    renderCartItems();
    drawer.classList.remove('translate-x-full');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  } else {
    drawer.classList.add('translate-x-full');
    overlay.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
}

function handleAddToCart(productId) {
  const res = window.store.addToCart(productId, 1);
  if (!res.success) {
    showToast(res.message, 'warning');
    return;
  }
  updateCartBadge();
  showToast('Added to your Local Basket!', 'success');
}

function updateCartBadge() {
  const count = window.store.getCartCount();
  document.getElementById('cart-badge-count').textContent = count;
}

function renderCartItems() {
  const container = document.getElementById('cart-drawer-items');
  const details = window.store.getCartDetails();

  if (details.items.length === 0) {
    container.innerHTML = `
      <div class="text-center py-20 text-slate-400">
        <i class="fa-solid fa-basket-shopping text-4xl mb-3 text-slate-300"></i>
        <h4 class="text-sm font-bold text-slate-700">Your basket is empty</h4>
        <p class="text-xs text-slate-400 mt-1">Discover freshly baked bread and pottery to get started.</p>
      </div>
    `;
    updateCheckoutTotal();
    return;
  }

  container.innerHTML = details.items.map(item => `
    <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-3 border border-slate-200/80">
      <img src="${item.product.image}" class="w-14 h-14 rounded-xl object-cover shadow-sm">
      <div class="flex-1">
        <span class="text-[10px] text-brand-700 font-bold uppercase tracking-wider">${item.shop?.name}</span>
        <h4 class="font-bold text-xs text-slate-900 line-clamp-1">${item.product.name}</h4>
        <span class="text-xs font-extrabold text-slate-900 block mt-0.5">₹${item.product.price}</span>
      </div>
      <div class="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200">
        <button onclick="changeCartItemQty('${item.productId}', ${item.quantity - 1})" class="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 text-xs font-bold">-</button>
        <span class="text-xs font-bold text-slate-900 w-4 text-center">${item.quantity}</span>
        <button onclick="changeCartItemQty('${item.productId}', ${item.quantity + 1})" class="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 text-xs font-bold">+</button>
      </div>
    </div>
  `).join('');

  updateCheckoutTotal();
}

function changeCartItemQty(productId, qty) {
  window.store.updateCartQty(productId, qty);
  updateCartBadge();
  renderCartItems();
}

function updateCheckoutTotal() {
  const details = window.store.getCartDetails();
  const deliveryType = document.querySelector('input[name="checkout-delivery-type"]:checked')?.value || 'delivery';
  const deliveryFee = deliveryType === 'pickup' ? 0 : details.deliveryFee;
  const total = details.subtotal + deliveryFee;

  document.getElementById('checkout-subtotal').textContent = `₹${details.subtotal}`;
  document.getElementById('checkout-fee').textContent = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`;
  document.getElementById('checkout-total').textContent = `₹${total}`;
}

function handlePlaceOrder() {
  const details = window.store.getCartDetails();
  if (details.items.length === 0) {
    showToast('Your basket is empty.', 'warning');
    return;
  }

  const deliveryType = document.querySelector('input[name="checkout-delivery-type"]:checked')?.value || 'delivery';
  const name = document.getElementById('checkout-customer-name').value;
  const phone = document.getElementById('checkout-customer-phone').value;
  const address = document.getElementById('checkout-customer-address').value;

  const res = window.store.createOrder({
    items: window.store.cart,
    deliveryType,
    customerName: name,
    customerPhone: phone,
    deliveryAddress: deliveryType === 'pickup' ? 'In-Store Pickup' : address
  });

  if (!res.success) {
    showToast(res.error, 'error');
    return;
  }

  confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  toggleCartDrawer(false);
  updateCartBadge();
  renderMarketplace();
  showToast(`Order #${res.order.id} placed successfully with local merchants!`, 'success');

  setTimeout(() => openCustomerOrdersModal(), 600);
}

function openCustomerOrdersModal() {
  const orders = window.store.orders;
  const container = document.getElementById('customer-orders-list');

  if (orders.length === 0) {
    container.innerHTML = `<div class="text-center py-12 text-slate-400"><p class="text-xs">No orders placed yet.</p></div>`;
  } else {
    container.innerHTML = orders.map(o => `
      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
        <div class="flex items-center justify-between">
          <span class="font-extrabold text-slate-900 text-sm">Order #${o.id}</span>
          <span class="px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] bg-blue-100 text-blue-800">${o.status}</span>
        </div>
        <div class="flex items-center justify-between px-2 pt-1 text-[10px] font-bold text-slate-500">
          <span class="text-brand-600">1. Placed</span>
          <span class="${['confirmed', 'ready', 'delivered'].includes(o.status) ? 'text-brand-600' : ''}">2. Confirmed</span>
          <span class="${['ready', 'delivered'].includes(o.status) ? 'text-brand-600' : ''}">3. Packed / Ready</span>
          <span class="${o.status === 'delivered' ? 'text-brand-600' : ''}">4. Delivered</span>
        </div>
        <div class="p-2.5 bg-white rounded-xl border border-slate-100 space-y-1">
          ${o.items.map(i => `<div class="flex justify-between"><span>${i.name} × ${i.quantity}</span><span class="font-bold">₹${i.price * i.quantity}</span></div>`).join('')}
          <div class="flex justify-between pt-1 border-t border-slate-100 font-extrabold text-slate-900">
            <span>Total Paid</span>
            <span>₹${o.total}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  openModal('modal-customer-orders');
}

// ==================== VIEW 2: SELLER PORTAL ====================
function renderSellerDashboard() {
  const shop = window.store.getShop(currentSellerShopId);
  const analytics = window.store.getSellerAnalytics(currentSellerShopId);

  document.getElementById('seller-shop-name-display').textContent = shop?.name || 'Local Seller';
  const verifiedPill = document.getElementById('seller-verified-pill');
  if (shop?.verified) {
    verifiedPill.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800';
    verifiedPill.textContent = 'Verified Seller';
  } else {
    verifiedPill.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700';
    verifiedPill.textContent = 'Pending Verification';
  }

  document.getElementById('stat-revenue').textContent = `₹${analytics.totalRevenue.toLocaleString()}`;
  document.getElementById('stat-orders').textContent = analytics.totalOrders;
  document.getElementById('stat-units').textContent = analytics.unitsSold;
  document.getElementById('stat-aov').textContent = `₹${analytics.aov}`;
  document.getElementById('stat-products').textContent = analytics.activeProducts;
  document.getElementById('stat-low-stock').textContent = analytics.lowStockCount;

  renderSellerCharts(analytics);
  renderSellerOrdersTable('all');
  renderSellerProductsTable();
  renderSellerInquiries();
}

function renderSellerCharts(analytics) {
  const ctxRev = document.getElementById('seller-revenue-chart')?.getContext('2d');
  if (ctxRev) {
    if (sellerRevenueChart) sellerRevenueChart.destroy();
    sellerRevenueChart = new Chart(ctxRev, {
      type: 'line',
      data: {
        labels: analytics.trend.labels,
        datasets: [{
          label: 'Daily Revenue (₹)',
          data: analytics.trend.data,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  const ctxCat = document.getElementById('seller-category-chart')?.getContext('2d');
  if (ctxCat) {
    if (sellerCategoryChart) sellerCategoryChart.destroy();
    sellerCategoryChart = new Chart(ctxCat, {
      type: 'doughnut',
      data: {
        labels: analytics.categories.labels,
        datasets: [{
          data: analytics.categories.data,
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 9 } } } }
      }
    });
  }
}

function renderSellerOrdersTable(statusFilter = 'all') {
  let orders = window.store.orders.filter(o => o.shopId === currentSellerShopId || o.items.some(i => i.shopId === currentSellerShopId));
  if (statusFilter !== 'all') orders = orders.filter(o => o.status === statusFilter);

  const tbody = document.getElementById('seller-orders-table-body');
  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-400">No orders under this filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="px-5 py-3.5 font-bold text-slate-900">#${o.id}</td>
      <td class="px-5 py-3.5"><b>${o.customerName}</b><span class="text-slate-400 text-[10px] block">${o.customerPhone}</span></td>
      <td class="px-5 py-3.5">${o.items.map(i => `<span class="block">${i.name} (x${i.quantity})</span>`).join('')}</td>
      <td class="px-5 py-3.5">${o.deliveryType === 'pickup' ? '🛍️ In-Store Pickup' : '🚚 Home Delivery'}</td>
      <td class="px-5 py-3.5 font-extrabold text-slate-900">₹${o.total}</td>
      <td class="px-5 py-3.5">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          o.status === 'confirmed' || o.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
          o.status === 'shipped' || o.status === 'ready' ? 'bg-amber-100 text-amber-800' :
          o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
        }">
          ${o.status === 'confirmed' ? 'Accepted' : o.status === 'ready' ? 'Shipped/Ready' : o.status}
        </span>
      </td>
      <td class="px-5 py-3.5 text-right space-x-1">
        ${(o.status === 'placed' || o.status === 'confirmed' || o.status === 'accepted') ? `
          <button onclick="handleUpdateOrderStatus('${o.id}', 'shipped')" title="Mark Shipped" class="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs">
            <i class="fa-solid fa-truck-fast mr-1"></i> Ship
          </button>
        ` : ''}
        ${(o.status === 'shipped' || o.status === 'ready') ? `
          <button onclick="handleUpdateOrderStatus('${o.id}', 'delivered')" title="Mark Delivered" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs">
            <i class="fa-solid fa-circle-check mr-1"></i> Deliver
          </button>
        ` : ''}
        <select onchange="handleUpdateOrderStatus('${o.id}', this.value)" class="p-1 rounded-lg border border-slate-200 bg-white font-bold text-xs text-slate-700 outline-none">
          <option value="confirmed" ${o.status === 'confirmed' || o.status === 'accepted' ? 'selected' : ''}>✅ Accepted</option>
          <option value="shipped" ${o.status === 'shipped' || o.status === 'ready' ? 'selected' : ''}>🚚 Shipped</option>
          <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>🎉 Delivered</option>
          <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>❌ Cancelled</option>
        </select>
      </td>
    </tr>
  `).join('');
}

function filterSellerOrders(status) {
  document.querySelectorAll('.order-filter-btn').forEach(b => {
    b.className = 'order-filter-btn px-2.5 py-1 rounded text-slate-600 hover:text-slate-900';
  });
  event.target.className = 'order-filter-btn px-2.5 py-1 rounded bg-white text-slate-900 shadow-sm';
  renderSellerOrdersTable(status);
}

function handleUpdateOrderStatus(orderId, status) {
  window.store.updateOrderStatus(orderId, status);
  showToast(`Order #${orderId} marked as ${status}!`, 'success');
  renderSellerDashboard();
}

function renderSellerProductsTable() {
  const products = window.store.getProducts({ shopId: currentSellerShopId });
  const tbody = document.getElementById('seller-products-table-body');

  tbody.innerHTML = products.map(p => `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="px-5 py-3.5 flex items-center gap-3">
        <img src="${p.image}" class="w-10 h-10 rounded-lg object-cover shadow-2xs">
        <div>
          <span class="font-bold text-slate-900 block">${p.name}</span>
          <span class="text-slate-400 text-[10px]">${p.unit}</span>
        </div>
      </td>
      <td class="px-5 py-3.5 uppercase tracking-wider text-[10px] font-bold text-slate-500">${p.category}</td>
      <td class="px-5 py-3.5 font-bold text-slate-900">₹${p.price}</td>
      <td class="px-5 py-3.5">
        ${p.stock <= 5 
          ? `<span class="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">Low: ${p.stock} units</span>`
          : `<span class="font-bold text-slate-800">${p.stock} units</span>`
        }
      </td>
      <td class="px-5 py-3.5 font-semibold text-slate-600">${p.salesCount || 0}</td>
      <td class="px-5 py-3.5 text-right space-x-1">
        <button onclick="quickAdjustStock('${p.id}', 5)" title="Add 5 stock units" class="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs">+5</button>
        <button onclick="quickAdjustStock('${p.id}', -1)" title="Remove 1 stock unit" class="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs">-1</button>
        <button onclick="openEditProductModal('${p.id}')" title="Edit details" class="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs">Edit</button>
        <button onclick="deleteProduct('${p.id}')" title="Delete product permanently" class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs">
          <i class="fa-solid fa-trash-can"></i> Delete
        </button>
      </td>
    </tr>
  `).join('');
}

function quickAdjustStock(productId, delta) {
  const prod = window.store.getProduct(productId);
  if (!prod) return;
  const newStock = Math.max(0, prod.stock + delta);
  window.store.updateProduct(productId, { stock: newStock });
  showToast(`Stock updated to ${newStock} units.`, 'info');
  renderSellerDashboard();
}

function deleteProduct(productId) {
  const prod = window.store.getProduct(productId);
  const name = prod?.name || 'this product';
  if (confirm(`Are you sure you want to delete '${name}' from your shop catalog?`)) {
    window.store.deleteProduct(productId);
    showToast(`Deleted '${name}' from your shop catalog.`, 'info');
    renderSellerDashboard();
  }
}

function openAddProductModal() {
  document.getElementById('product-form-title').textContent = 'Add Local Product Listing';
  document.getElementById('form-product-id').value = '';
  document.getElementById('seller-product-form').reset();
  openModal('modal-product-form');
}

function openEditProductModal(productId) {
  const prod = window.store.getProduct(productId);
  if (!prod) return;

  document.getElementById('product-form-title').textContent = 'Edit Product Listing';
  document.getElementById('form-product-id').value = prod.id;
  document.getElementById('form-product-name').value = prod.name;
  document.getElementById('form-product-category').value = prod.category;
  document.getElementById('form-product-unit').value = prod.unit;
  document.getElementById('form-product-price').value = prod.price;
  document.getElementById('form-product-orig-price').value = prod.originalPrice || '';
  document.getElementById('form-product-stock').value = prod.stock;
  document.getElementById('form-product-image').value = prod.image;
  document.getElementById('form-product-desc').value = prod.description;

  openModal('modal-product-form');
}

function handleProductFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('form-product-id').value;
  const name = document.getElementById('form-product-name').value;
  const category = document.getElementById('form-product-category').value;
  const unit = document.getElementById('form-product-unit').value;
  const price = Number(document.getElementById('form-product-price').value);
  const origPrice = Number(document.getElementById('form-product-orig-price').value) || null;
  const stock = Number(document.getElementById('form-product-stock').value);
  let image = document.getElementById('form-product-image').value;
  const description = document.getElementById('form-product-desc').value;

  if (!image) {
    image = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80';
  }

  const payload = {
    name, category, unit, price, originalPrice: origPrice, stock, image, description,
    shopId: currentSellerShopId
  };

  if (id) {
    window.store.updateProduct(id, payload);
    showToast(`Updated '${name}'!`, 'success');
  } else {
    window.store.addProduct(payload);
    showToast(`Published '${name}'!`, 'success');
  }

  closeModal('modal-product-form');
  renderSellerDashboard();
}

function openAnnouncementModal() {
  document.getElementById('announcement-text').value = '';
  openModal('modal-announcement');
}

function handleAnnouncementSubmit(e) {
  e.preventDefault();
  const text = document.getElementById('announcement-text').value;
  window.store.addAnnouncement(currentSellerShopId, text);
  showToast('Storefront announcement published!', 'success');
  closeModal('modal-announcement');
}

function openEditShopModal() {
  const shop = window.store.getShop(currentSellerShopId);
  if (!shop) return;
  document.getElementById('edit-shop-name').value = shop.name;
  document.getElementById('edit-shop-tagline').value = shop.tagline || '';
  document.getElementById('edit-shop-whatsapp').value = shop.whatsapp || '';
  document.getElementById('edit-shop-hours').value = shop.hours || '';
  document.getElementById('edit-shop-story').value = shop.story || '';
  openModal('modal-edit-shop');
}

function handleEditShopSubmit(e) {
  e.preventDefault();
  window.store.updateShop(currentSellerShopId, {
    name: document.getElementById('edit-shop-name').value,
    tagline: document.getElementById('edit-shop-tagline').value,
    whatsapp: document.getElementById('edit-shop-whatsapp').value,
    hours: document.getElementById('edit-shop-hours').value,
    story: document.getElementById('edit-shop-story').value
  });
  showToast('Store profile updated!', 'success');
  closeModal('modal-edit-shop');
  renderSellerDashboard();
}

function renderSellerInquiries() {
  const inqs = window.store.inquiries.filter(i => i.shopId === currentSellerShopId);
  const container = document.getElementById('seller-inquiries-list');
  if (inqs.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400">No buyer messages right now.</p>`;
    return;
  }

  container.innerHTML = inqs.map(inq => `
    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
      <div class="flex justify-between font-bold text-slate-800">
        <span>${inq.customerName} (re: '${inq.productName}')</span>
        <span class="text-slate-400 text-[10px]">${inq.date}</span>
      </div>
      <p class="text-slate-600 bg-white p-2 rounded">${inq.message}</p>
      ${inq.reply ? `<p class="text-emerald-800 bg-emerald-50 p-2 rounded"><b>Your reply:</b> ${inq.reply}</p>` : `
        <div class="flex gap-2">
          <input type="text" id="reply-input-${inq.id}" placeholder="Reply..." class="flex-1 p-1.5 rounded border border-slate-200 text-xs">
          <button onclick="handleReplyInquiry('${inq.id}')" class="px-3 py-1 bg-slate-900 text-white rounded text-xs font-bold">Reply</button>
        </div>
      `}
    </div>
  `).join('');
}

function handleReplyInquiry(inquiryId) {
  const input = document.getElementById(`reply-input-${inquiryId}`);
  if (!input || !input.value.trim()) return;
  window.store.replyInquiry(inquiryId, input.value.trim());
  showToast('Reply sent to customer!', 'success');
  renderSellerInquiries();
}

// ==================== VIEW 3: ADMIN PORTAL CONTROLLER ====================
function renderAdminPortal() {
  const analytics = window.store.getAdminAnalytics();

  document.getElementById('admin-stat-gmv').textContent = `₹${analytics.totalGMV.toLocaleString()}`;
  document.getElementById('admin-stat-commission').textContent = `₹${analytics.platformCommission.toLocaleString()}`;
  document.getElementById('admin-stat-orders').textContent = analytics.totalOrders;
  document.getElementById('admin-stat-sellers').textContent = analytics.totalSellers;
  document.getElementById('admin-stat-verified-count').textContent = `${analytics.verifiedSellers} Verified`;
  document.getElementById('admin-stat-products').textContent = analytics.totalProducts;
  document.getElementById('admin-stat-units').textContent = analytics.totalUnits;

  // Render Neighborhood chart
  renderAdminNeighborhoodChart(analytics.neighborhoods);

  // Render Seller Governance Table
  renderAdminSellersTable();

  // Render Product Moderation Table
  renderAdminProductsTable();
}

function renderAdminNeighborhoodChart(neighborhoodData) {
  const ctx = document.getElementById('admin-neighborhood-chart')?.getContext('2d');
  if (!ctx) return;

  if (adminNeighborhoodChart) adminNeighborhoodChart.destroy();
  adminNeighborhoodChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: neighborhoodData.labels,
      datasets: [{
        label: 'Gross Merchandise Value (₹)',
        data: neighborhoodData.data,
        backgroundColor: ['#7c3aed', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
        x: { grid: { display: false } }
      }
    }
  });
}

function renderAdminSellersTable() {
  const shops = window.store.shops;
  const tbody = document.getElementById('admin-sellers-table-body');
  document.getElementById('admin-sellers-count-badge').textContent = `${shops.length} Registered Merchants`;

  tbody.innerHTML = shops.map(shop => {
    const prods = window.store.getProducts({ shopId: shop.id });

    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="px-5 py-3.5 flex items-center gap-3">
          <img src="${shop.avatar}" class="w-10 h-10 rounded-xl object-cover shadow-2xs">
          <div>
            <span class="font-bold text-slate-900 block">${shop.name}</span>
            <span class="text-slate-400 text-[10px]">${shop.address}</span>
          </div>
        </td>
        <td class="px-5 py-3.5">
          <span class="font-bold text-slate-800 block">${shop.owner}</span>
          <span class="text-slate-400 text-[10px]">${shop.phone}</span>
        </td>
        <td class="px-5 py-3.5 font-medium text-slate-600">${shop.neighborhood}</td>
        <td class="px-5 py-3.5 font-bold text-amber-500">⭐ ${shop.rating} (${shop.reviewCount})</td>
        <td class="px-5 py-3.5 font-semibold text-slate-700">${prods.length} items</td>
        <td class="px-5 py-3.5">
          ${shop.verified 
            ? `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max">
                 <i class="fa-solid fa-circle-check"></i> Verified Merchant
               </span>`
            : `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 w-max block">
                 Unverified
               </span>`
          }
        </td>
        <td class="px-5 py-3.5 text-right space-x-2">
          <button onclick="adminToggleVerifyShop('${shop.id}')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            shop.verified ? 'bg-amber-100 hover:bg-amber-200 text-amber-900' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
          }">
            ${shop.verified ? 'Revoke Badge' : 'Award Verified Badge'}
          </button>
          <button onclick="adminToggleShopStatus('${shop.id}')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            shop.suspended ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 hover:bg-rose-200 text-rose-800'
          }">
            ${shop.suspended ? 'Reinstate' : 'Suspend'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function adminToggleVerifyShop(shopId) {
  const isNowVerified = window.store.toggleVerifyShop(shopId);
  const shop = window.store.getShop(shopId);
  showToast(`${shop?.name} is now ${isNowVerified ? 'Verified Local Merchant!' : 'Unverified.'}`, 'admin');
  renderAdminPortal();
}

function adminToggleShopStatus(shopId) {
  const isSuspended = window.store.toggleShopStatus(shopId);
  const shop = window.store.getShop(shopId);
  showToast(`${shop?.name} has been ${isSuspended ? 'SUSPENDED from marketplace.' : 'REINSTATED.'}`, 'admin');
  renderAdminPortal();
}

function renderAdminProductsTable() {
  const products = window.store.products;
  const tbody = document.getElementById('admin-products-table-body');

  tbody.innerHTML = products.map(p => {
    const shop = window.store.getShop(p.shopId);

    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="px-5 py-3.5 flex items-center gap-2.5 font-bold text-slate-900">
          <img src="${p.image}" class="w-8 h-8 rounded-lg object-cover">
          <span>${p.name}</span>
        </td>
        <td class="px-5 py-3.5 text-slate-600">${shop?.name || 'Local Seller'}</td>
        <td class="px-5 py-3.5 uppercase text-[10px] font-bold text-slate-500">${p.category}</td>
        <td class="px-5 py-3.5 font-bold text-slate-900">₹${p.price}</td>
        <td class="px-5 py-3.5 font-semibold text-slate-700">${p.stock} units</td>
        <td class="px-5 py-3.5">
          ${p.adminFeatured ? `
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
              ⭐ Featured
            </span>
          ` : `<span class="text-slate-400 text-[10px]">Standard</span>`}
        </td>
        <td class="px-5 py-3.5 text-right space-x-1">
          <button onclick="adminToggleFeatureProduct('${p.id}')" class="px-2.5 py-1 rounded-lg text-xs font-bold ${
            p.adminFeatured ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }">
            ${p.adminFeatured ? 'Unfeature' : 'Feature ⭐'}
          </button>
          <button onclick="adminDeleteProduct('${p.id}')" class="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold">
            Remove
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function adminToggleFeatureProduct(productId) {
  const isFeatured = window.store.toggleFeatureProduct(productId);
  const prod = window.store.getProduct(productId);
  showToast(`'${prod?.name}' is ${isFeatured ? 'featured on the homepage!' : 'unfeatured.'}`, 'admin');
  renderAdminProductsTable();
}

function adminDeleteProduct(productId) {
  if (confirm('Admin Action: Remove this product from the public catalog?')) {
    window.store.deleteProduct(productId);
    showToast('Product removed by Administrator.', 'admin');
    renderAdminProductsTable();
  }
}

function handleAdminBroadcastSubmit(e) {
  e.preventDefault();
  const text = document.getElementById('admin-broadcast-text').value.trim();
  if (!text) return;

  window.store.setPlatformAnnouncement(text);
  document.getElementById('platform-announcement-text').textContent = text;
  document.getElementById('admin-broadcast-text').value = '';
  showToast('City broadcast announcement updated for all shoppers!', 'admin');
}
