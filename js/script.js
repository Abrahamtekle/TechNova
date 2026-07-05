/* ==========================================================================
   TechNova Electronics — Core Site Script (vanilla JS)
   Handles: sticky navigation, automatic image slider, welcome popup,
   live clock, search suggestions, and home-page content rendering.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  tnStickyNav();
  tnWelcomePopup();
  tnLiveClock();
  tnHeroSlider();
  tnSearchSuggestions();
  tnRenderCategories();
  tnRenderFeaturedProducts();
  tnRenderDealTicker();
  tnMobileMenu();
  tnWishlistButtons();
  tnRecentlyViewedInit();
});

/* ---------- 1. Sticky Navigation ---------- */
function tnStickyNav() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  window.addEventListener("scroll", () => {
    header.classList.toggle("is-stuck", window.scrollY > 12);
  });
}

/* ---------- 2. Mobile slide-out menu (open/close triggers; jQuery drives the slide) ---------- */
function tnMobileMenu() {
  const burger = document.getElementById("burgerBtn");
  const mobileNav = document.getElementById("mobileNav");
  const overlay = document.getElementById("navOverlay");
  const closeBtn = document.getElementById("closeMobileNav");
  if (!burger || !mobileNav) return;

  const open = () => { mobileNav.classList.add("open"); overlay.classList.add("show"); };
  const close = () => { mobileNav.classList.remove("open"); overlay.classList.remove("show"); };

  burger.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (overlay) overlay.addEventListener("click", close);
}

/* ---------- 3. Welcome Popup (shown once per session) ---------- */
function tnWelcomePopup() {
  const modal = document.getElementById("welcomeModal");
  if (!modal) return;
  const seen = sessionStorage.getItem("tn_welcome_seen");
  if (!seen) {
    setTimeout(() => modal.classList.add("show"), 1400);
    sessionStorage.setItem("tn_welcome_seen", "1");
  }
  const closeBtn = document.getElementById("closeWelcomeModal");
  const claimBtn = document.getElementById("claimCouponBtn");
  const hide = () => modal.classList.remove("show");
  if (closeBtn) closeBtn.addEventListener("click", hide);
  modal.addEventListener("click", (e) => { if (e.target === modal) hide(); });
  if (claimBtn) claimBtn.addEventListener("click", () => {
    navigator.clipboard?.writeText("NOVA10").catch(() => {});
    claimBtn.textContent = "Copied: NOVA10 ✓";
    setTimeout(hide, 900);
  });
}

/* ---------- 4. Current Date & Time ---------- */
function tnLiveClock() {
  const el = document.getElementById("liveClock");
  if (!el) return;
  const update = () => {
    const now = new Date();
    const opts = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
    const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    el.textContent = `${now.toLocaleDateString("en-US", opts)} · ${time}`;
  };
  update();
  setInterval(update, 1000);
}

/* ---------- 5. Automatic Image Slider (hero) ---------- */
function tnHeroSlider() {
  const slides = document.querySelectorAll(".hero-slide");
  const dotsWrap = document.getElementById("heroDots");
  if (!slides.length) return;
  let current = 0;

  if (dotsWrap) {
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "hero-dot" + (i === 0 ? " active" : "");
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });
  }

  function goTo(i) {
    slides[current].classList.remove("active");
    dotsWrap?.children[current]?.classList.remove("active");
    current = i;
    slides[current].classList.add("active");
    dotsWrap?.children[current]?.classList.add("active");
  }

  setInterval(() => goTo((current + 1) % slides.length), 5000);
}

/* ---------- 6. Deal ticker content ---------- */
function tnRenderDealTicker() {
  const track = document.getElementById("tickerTrack");
  if (!track) return;
  const deals = TN_PRODUCTS.filter(p => p.oldPrice).map(p =>
    `<span>${Math.round((1 - p.price / p.oldPrice) * 100)}% OFF</span> ${p.name} — now ${tnFormatPrice(p.price)}`
  );
  track.innerHTML = deals.concat(deals).map(d => `<span class="ticker-item">${d}</span>`).join("");
}

/* ---------- 7. Search Suggestions (header search box) ---------- */
function tnSearchSuggestions() {
  const input = document.getElementById("navSearchInput");
  const suggestBox = document.getElementById("searchSuggestBox");
  if (!input || !suggestBox) return;

  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    if (term.length < 2) { suggestBox.style.display = "none"; return; }
    const matches = TN_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
    ).slice(0, 6);

    if (!matches.length) {
      suggestBox.innerHTML = `<a href="products.html">No matches — browse all products →</a>`;
    } else {
      suggestBox.innerHTML = matches.map(p =>
        `<a href="product-details.html?id=${p.id}"><span>${p.name}</span><span class="mono">${tnFormatPrice(p.price)}</span></a>`
      ).join("");
    }
    suggestBox.style.display = "block";
  });

  document.addEventListener("click", (e) => {
    if (!suggestBox.contains(e.target) && e.target !== input) suggestBox.style.display = "none";
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      window.location.href = `products.html?search=${encodeURIComponent(input.value.trim())}`;
    }
  });
}

/* ---------- 8. Render Category Cards (home page) ---------- */
function tnRenderCategories() {
  const wrap = document.getElementById("categoryGrid");
  if (!wrap) return;
  wrap.innerHTML = TN_CATEGORIES.map(cat => {
    const count = TN_PRODUCTS.filter(p => p.category === cat.key).length;
    return `
    <a class="cat-card fade-init" href="products.html?category=${cat.key}">
      <div class="cat-icon"><img src="${cat.icon}" alt="${cat.name}"></div>
      <h3>${cat.name}</h3>
      <span>${count} products</span>
    </a>`;
  }).join("");
}

/* ---------- 9. Render Featured Products (home page) ---------- */
function tnRenderFeaturedProducts() {
  const wrap = document.getElementById("featuredGrid");
  if (!wrap) return;
  const featured = TN_PRODUCTS.slice(0, 8);
  wrap.innerHTML = featured.map(p => tnProductCardHTML(p)).join("");
  tnBindAddToCartButtons(wrap);
}

/* ---------- Shared product card builder (used by home + products page) ---------- */
function tnProductCardHTML(p) {
  const stockClass = p.stock === 0 ? "out" : (p.stock <= 8 ? "low" : "in");
  const stockLabel = p.stock === 0 ? "Out of stock" : (p.stock <= 8 ? `Only ${p.stock} left` : "In stock");
  return `
  <div class="product-card fade-init" data-id="${p.id}" data-category="${p.category}" data-price="${p.price}" data-name="${p.name.toLowerCase()}">
    <div class="product-media">
      <span class="sku-tag">${p.sku}</span>
      ${p.oldPrice ? `<span class="sale-tag">-${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>` : ""}
      <a href="product-details.html?id=${p.id}"><img src="${p.image}" alt="${p.name}" loading="lazy"></a>
      <button type="button" class="wishlist-btn" data-id="${p.id}" aria-label="Add to wishlist">
        <svg viewBox="0 0 24 24" stroke-width="2"><path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4.5 4.5 8.5C19 16.65 12 21 12 21z"/></svg>
      </button>
    </div>
    <div class="product-info">
      <span class="p-cat">${p.category}</span>
      <h3><a href="product-details.html?id=${p.id}">${p.name}</a></h3>
      <div class="rating"><span class="stars">${tnStars(p.rating)}</span><span>${p.rating} (${p.reviews})</span></div>
      <div class="price-row">
        <span class="price">${tnFormatPrice(p.price)}</span>
        ${p.oldPrice ? `<span class="old-price">${tnFormatPrice(p.oldPrice)}</span>` : ""}
      </div>
      <span class="stock-line ${stockClass}">${stockLabel}</span>
      <div class="product-actions">
        <button type="button" class="btn btn-primary add-to-cart-btn" data-id="${p.id}" ${p.stock === 0 ? "disabled" : ""}>Add to Cart</button>
        <a class="btn btn-ghost" href="product-details.html?id=${p.id}">View Details</a>
      </div>
    </div>
  </div>`;
}

function tnBindAddToCartButtons(scope) {
  (scope || document).querySelectorAll(".add-to-cart-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      tnAddToCart(id, 1);
      const original = btn.textContent;
      btn.textContent = "Added ✓";
      btn.classList.add("btn-amber");
      setTimeout(() => { btn.textContent = original; btn.classList.remove("btn-amber"); }, 1100);
    });
  });
}

/* ---------- 10. Wishlist toggle (persisted) ---------- */
function tnWishlistButtons() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".wishlist-btn");
    if (!btn) return;
    btn.classList.toggle("active");
    const id = btn.dataset.id;
    let list = JSON.parse(localStorage.getItem("technova_wishlist") || "[]");
    if (list.includes(id)) list = list.filter(x => x !== id);
    else list.push(id);
    localStorage.setItem("technova_wishlist", JSON.stringify(list));
  });
}

/* ---------- 11. Recently Viewed (bonus) ---------- */
function tnRecentlyViewedInit() {
  const wrap = document.getElementById("recentlyViewedGrid");
  if (!wrap) return;
  const ids = JSON.parse(sessionStorage.getItem("technova_recent") || "[]");
  const items = ids.map(id => tnFindProduct(id)).filter(Boolean);
  if (!items.length) { wrap.closest(".section")?.remove(); return; }
  wrap.innerHTML = items.map(p => tnProductCardHTML(p)).join("");
  tnBindAddToCartButtons(wrap);
}

function tnTrackRecentlyViewed(id) {
  let ids = JSON.parse(sessionStorage.getItem("technova_recent") || "[]");
  ids = ids.filter(x => x !== id);
  ids.unshift(id);
  ids = ids.slice(0, 4);
  sessionStorage.setItem("technova_recent", JSON.stringify(ids));
}
