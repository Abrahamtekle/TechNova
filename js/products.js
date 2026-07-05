/* ==========================================================================
   TechNova Electronics — Products Page Logic
   Search, category filter, price filter, sort, and grid rendering.
   ========================================================================== */

let TN_ACTIVE_FILTERS = { categories: [], priceRanges: [], search: "", sort: "featured" };

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  tnReadUrlParams();
  tnBindProductFilterUI();
  tnApplySortAndFilter();
});

function tnReadUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get("category");
  const search = params.get("search");
  if (cat) TN_ACTIVE_FILTERS.categories = [cat];
  if (search) TN_ACTIVE_FILTERS.search = search;
}

function tnBindProductFilterUI() {
  // Pre-check category checkboxes based on URL param
  document.querySelectorAll(".filter-category").forEach(cb => {
    cb.checked = TN_ACTIVE_FILTERS.categories.includes(cb.value);
  });

  const searchInput = document.getElementById("productSearchInput");
  if (searchInput) {
    if (TN_ACTIVE_FILTERS.search) searchInput.value = TN_ACTIVE_FILTERS.search;
    searchInput.addEventListener("keyup", () => {
      TN_ACTIVE_FILTERS.search = searchInput.value.trim().toLowerCase();
      tnApplySortAndFilter();
    });
  }

  document.querySelectorAll(".filter-category").forEach(cb => {
    cb.addEventListener("change", () => {
      TN_ACTIVE_FILTERS.categories = Array.from(document.querySelectorAll(".filter-category:checked")).map(c => c.value);
      tnApplySortAndFilter();
    });
  });

  document.querySelectorAll(".filter-price").forEach(cb => {
    cb.addEventListener("change", () => {
      TN_ACTIVE_FILTERS.priceRanges = Array.from(document.querySelectorAll(".filter-price:checked")).map(c => c.value);
      tnApplySortAndFilter();
    });
  });

  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      TN_ACTIVE_FILTERS.sort = sortSelect.value;
      tnApplySortAndFilter();
    });
  }

  const clearBtn = document.getElementById("clearFiltersBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      TN_ACTIVE_FILTERS = { categories: [], priceRanges: [], search: "", sort: "featured" };
      document.querySelectorAll(".filter-category, .filter-price").forEach(cb => cb.checked = false);
      if (searchInput) searchInput.value = "";
      if (sortSelect) sortSelect.value = "featured";
      tnApplySortAndFilter();
    });
  }
}

function tnPriceInRange(price, rangeKey) {
  if (rangeKey === "under100") return price < 100;
  if (rangeKey === "100to500") return price >= 100 && price <= 500;
  if (rangeKey === "above500") return price > 500;
  return true;
}

function tnApplySortAndFilter() {
  let list = [...TN_PRODUCTS];

  if (TN_ACTIVE_FILTERS.categories.length) {
    list = list.filter(p => TN_ACTIVE_FILTERS.categories.includes(p.category));
  }
  if (TN_ACTIVE_FILTERS.priceRanges.length) {
    list = list.filter(p => TN_ACTIVE_FILTERS.priceRanges.some(r => tnPriceInRange(p.price, r)));
  }
  if (TN_ACTIVE_FILTERS.search) {
    const term = TN_ACTIVE_FILTERS.search;
    list = list.filter(p => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term));
  }

  switch (TN_ACTIVE_FILTERS.sort) {
    case "price-low": list.sort((a, b) => a.price - b.price); break;
    case "price-high": list.sort((a, b) => b.price - a.price); break;
    case "alpha": list.sort((a, b) => a.name.localeCompare(b.name)); break;
    case "rating": list.sort((a, b) => b.rating - a.rating); break;
    default: break; // featured = catalog order
  }

  tnRenderProductsGrid(list);
}

function tnRenderProductsGrid(list) {
  const grid = document.getElementById("productsGrid");
  const countEl = document.getElementById("resultsCount");
  if (countEl) countEl.textContent = `${list.length} product${list.length !== 1 ? "s" : ""} found`;

  if (!list.length) {
    grid.innerHTML = `<div class="empty-cart" style="grid-column:1/-1;">
      <h3>No products match your filters</h3>
      <p>Try clearing a few filters or searching a different term.</p>
      <button type="button" class="btn btn-primary" onclick="document.getElementById('clearFiltersBtn').click()">Clear Filters</button>
    </div>`;
    return;
  }

  grid.innerHTML = list.map(p => tnProductCardHTML(p)).join("");
  tnBindAddToCartButtons(grid);
  if (typeof tnJQueryTriggerRerender === "function") tnJQueryTriggerRerender();
}
