/* ==========================================================================
   TechNova Electronics — Product Details Page Logic
   ========================================================================== */

let TN_CURRENT_PRODUCT = null;
let TN_SELECTED_COLOR = null;
let TN_SELECTED_STORAGE = null;

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("productDetailsRoot");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id")) || 1;
  const product = tnFindProduct(id);
  if (!product) {
    root.innerHTML = `<div class="empty-cart"><h3>Product not found</h3><p>It may have been removed.</p><a class="btn btn-primary" href="products.html">Browse Products</a></div>`;
    return;
  }
  TN_CURRENT_PRODUCT = product;
  TN_SELECTED_COLOR = product.colors ? product.colors[0] : null;
  TN_SELECTED_STORAGE = product.storage ? product.storage[0] : null;

  tnRenderProductDetails(product);
  tnTrackRecentlyViewed(product.id);
  tnRenderRelatedProducts(product);
  tnBindDetailInteractions(product);
});

function tnRenderProductDetails(p) {
  document.title = `${p.name} — TechNova Electronics`;
  const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

  set("breadcrumbProductName", p.name);
  set("pdCategory", p.category);
  set("pdName", p.name);
  set("pdRatingStars", tnStars(p.rating));
  set("pdRatingText", `${p.rating} (${p.reviews} reviews)`);
  set("pdPrice", tnFormatPrice(p.price));
  set("pdSku", p.sku);
  set("pdStock", p.stock > 0 ? `${p.stock} units in stock` : "Out of stock");
  set("pdDesc", p.desc);

  const oldPriceWrap = document.getElementById("pdOldPriceWrap");
  if (p.oldPrice) {
    oldPriceWrap.style.display = "flex";
    set("pdOldPrice", tnFormatPrice(p.oldPrice));
    set("pdSaveChip", `Save ${Math.round((1 - p.price / p.oldPrice) * 100)}%`);
  } else {
    oldPriceWrap.style.display = "none";
  }

  document.getElementById("pdMainImage").src = p.image;
  const thumbsWrap = document.getElementById("pdThumbs");
  thumbsWrap.innerHTML = [p.image, p.image, p.image].map((src, i) =>
    `<button type="button" class="thumb ${i === 0 ? "active" : ""}"><img src="${src}" alt="${p.name} view ${i + 1}"></button>`
  ).join("");

  const colorWrap = document.getElementById("pdColorGroup");
  if (p.colors) {
    colorWrap.style.display = "block";
    colorWrap.querySelector(".swatches").innerHTML = p.colors.map((c, i) =>
      `<button type="button" class="swatch ${i === 0 ? "selected" : ""}" style="background:${c}" data-color="${c}" aria-label="Color ${c}"></button>`
    ).join("");
  } else colorWrap.style.display = "none";

  const storageWrap = document.getElementById("pdStorageGroup");
  if (p.storage) {
    storageWrap.style.display = "block";
    storageWrap.querySelector(".storage-opts").innerHTML = p.storage.map((s, i) =>
      `<button type="button" class="${i === 0 ? "selected" : ""}" data-storage="${s}">${s}</button>`
    ).join("");
  } else storageWrap.style.display = "none";

  // Spec table (generated from product attributes — believable placeholder specs)
  const specRows = [
    ["Category", p.category],
    ["SKU", p.sku],
    ["Rating", `${p.rating} / 5 (${p.reviews} reviews)`],
    ["Available colors", p.colors ? p.colors.length : "Single finish"],
    ["Storage options", p.storage ? p.storage.join(", ") : "N/A"],
    ["Warranty", "1-year limited manufacturer warranty"],
    ["In the box", `${p.name}, quick-start guide, charging cable`],
  ];
  set("pdSpecTable", specRows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join(""));

  // Static-but-plausible reviews for the Reviews tab
  const sampleReviews = [
    { name: "Amara K.", rating: 5, text: "Exactly as described and arrived two days early. The build quality feels premium for the price.", date: "2 weeks ago" },
    { name: "Diego R.", rating: 4, text: "Great value overall — battery life is the standout feature for me.", date: "1 month ago" },
    { name: "Priya S.", rating: 5, text: "Customer support was quick to answer my setup questions. Very happy with this purchase.", date: "1 month ago" },
  ];
  set("pdReviewsList", sampleReviews.map(r => `
    <div class="review-item">
      <div class="review-avatar">${r.name.charAt(0)}</div>
      <div>
        <h5>${r.name}</h5>
        <div class="rating"><span class="stars">${tnStars(r.rating)}</span><span class="review-date">${r.date}</span></div>
        <p>${r.text}</p>
      </div>
    </div>`).join(""));
}

function tnRenderRelatedProducts(p) {
  const wrap = document.getElementById("relatedGrid");
  if (!wrap) return;
  const related = TN_PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);
  wrap.innerHTML = related.map(x => tnProductCardHTML(x)).join("");
  tnBindAddToCartButtons(wrap);
}

function tnBindDetailInteractions(p) {
  const qtyInput = document.getElementById("pdQtyInput");
  document.getElementById("pdQtyPlus").addEventListener("click", () => {
    qtyInput.value = Math.min(p.stock || 99, Number(qtyInput.value) + 1);
    tnUpdatePdTotal();
  });
  document.getElementById("pdQtyMinus").addEventListener("click", () => {
    qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
    tnUpdatePdTotal();
  });
  qtyInput.addEventListener("change", tnUpdatePdTotal);

  document.getElementById("pdThumbs").addEventListener("click", (e) => {
    const btn = e.target.closest(".thumb");
    if (!btn) return;
    document.querySelectorAll(".pd-thumbs .thumb").forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("pdMainImage").src = btn.querySelector("img").src;
  });

  const colorGroup = document.getElementById("pdColorGroup");
  colorGroup.addEventListener("click", (e) => {
    const btn = e.target.closest(".swatch");
    if (!btn) return;
    colorGroup.querySelectorAll(".swatch").forEach(s => s.classList.remove("selected"));
    btn.classList.add("selected");
    TN_SELECTED_COLOR = btn.dataset.color;
  });

  const storageGroup = document.getElementById("pdStorageGroup");
  storageGroup.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-storage]");
    if (!btn) return;
    storageGroup.querySelectorAll("button").forEach(s => s.classList.remove("selected"));
    btn.classList.add("selected");
    TN_SELECTED_STORAGE = btn.dataset.storage;
  });

  // Image zoom on hover
  const mainImgWrap = document.getElementById("pdMainImageWrap");
  const mainImg = document.getElementById("pdMainImage");
  mainImgWrap.addEventListener("mousemove", (e) => {
    const rect = mainImgWrap.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    mainImg.style.transformOrigin = `${x}% ${y}%`;
    mainImg.style.transform = "scale(1.8)";
  });
  mainImgWrap.addEventListener("mouseleave", () => { mainImg.style.transform = "scale(1)"; });

  document.getElementById("pdAddToCartBtn").addEventListener("click", () => {
    const options = {};
    if (TN_SELECTED_COLOR) options.color = TN_SELECTED_COLOR;
    if (TN_SELECTED_STORAGE) options.storage = TN_SELECTED_STORAGE;
    tnAddToCart(p.id, Number(qtyInput.value), options);
    const btn = document.getElementById("pdAddToCartBtn");
    const original = btn.textContent;
    btn.textContent = "Added to Cart ✓";
    setTimeout(() => btn.textContent = original, 1200);
  });

  document.getElementById("pdBuyNowBtn").addEventListener("click", () => {
    const options = {};
    if (TN_SELECTED_COLOR) options.color = TN_SELECTED_COLOR;
    if (TN_SELECTED_STORAGE) options.storage = TN_SELECTED_STORAGE;
    tnAddToCart(p.id, Number(qtyInput.value), options);
    window.location.href = "cart.html";
  });
}

function tnUpdatePdTotal() {
  if (!TN_CURRENT_PRODUCT) return;
  const qty = Number(document.getElementById("pdQtyInput").value);
  document.getElementById("pdLineTotal").textContent = tnFormatPrice(TN_CURRENT_PRODUCT.price * qty);
}
