/* ==========================================================================
   TechNova Electronics — Shopping Cart Engine
   Cart persists to localStorage (bonus requirement) so it survives
   page reloads and navigation between pages.
   ========================================================================== */

const TN_CART_KEY = "technova_cart";
const TN_TAX_RATE = 0.05;      // 5% GST
const TN_SHIPPING_FLAT = 12.99;
const TN_FREE_SHIP_OVER = 500;
const TN_COUPONS = { "NOVA10": 0.10, "SAVE20": 0.20 };

/* ---------- Storage helpers ---------- */
function tnGetCart() {
  try {
    const raw = localStorage.getItem(TN_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Cart read error:", e);
    return [];
  }
}

function tnSaveCart(cart) {
  localStorage.setItem(TN_CART_KEY, JSON.stringify(cart));
  tnRenderCartBadge();
}

/* ---------- Mutations ---------- */
function tnAddToCart(productId, qty = 1, options = {}) {
  const product = tnFindProduct(productId);
  if (!product) return;
  const cart = tnGetCart();
  const optionKey = JSON.stringify(options);
  const existing = cart.find(item => item.id === productId && JSON.stringify(item.options) === optionKey);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      image: product.image,
      category: product.category,
      qty: qty,
      options: options
    });
  }
  tnSaveCart(cart);
  return cart;
}

function tnUpdateQty(productId, options, newQty) {
  const cart = tnGetCart();
  const optionKey = JSON.stringify(options || {});
  const item = cart.find(i => i.id === productId && JSON.stringify(i.options) === optionKey);
  if (!item) return;
  item.qty = Math.max(1, newQty);
  tnSaveCart(cart);
}

function tnRemoveFromCart(productId, options) {
  let cart = tnGetCart();
  const optionKey = JSON.stringify(options || {});
  cart = cart.filter(i => !(i.id === productId && JSON.stringify(i.options) === optionKey));
  tnSaveCart(cart);
}

function tnEmptyCart() {
  localStorage.removeItem(TN_CART_KEY);
  tnRenderCartBadge();
}

/* ---------- Totals ---------- */
function tnCartTotals(discountRate = 0) {
  const cart = tnGetCart();
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = subtotal * discountRate;
  const taxable = subtotal - discount;
  const tax = taxable * TN_TAX_RATE;
  const shipping = cart.length === 0 ? 0 : (taxable >= TN_FREE_SHIP_OVER ? 0 : TN_SHIPPING_FLAT);
  const total = taxable + tax + shipping;
  return { subtotal, discount, tax, shipping, total, count: cart.reduce((n, i) => n + i.qty, 0) };
}

/* ---------- Badge (runs on every page) ---------- */
function tnRenderCartBadge() {
  const count = tnGetCart().reduce((n, i) => n + i.qty, 0);
  document.querySelectorAll(".js-cart-count").forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
  });
}

/* ---------- Cart Page Rendering ---------- */
function tnRenderCartPage() {
  const cart = tnGetCart();
  const tbody = document.getElementById("cartTableBody");
  const emptyState = document.getElementById("emptyCartState");
  const cartWrap = document.getElementById("cartTableWrap");
  const summaryCard = document.getElementById("cartSummaryCard");
  if (!tbody) return;

  if (cart.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    if (cartWrap) cartWrap.style.display = "none";
    if (summaryCard) summaryCard.style.display = "none";
    return;
  }
  if (emptyState) emptyState.style.display = "none";
  if (cartWrap) cartWrap.style.display = "block";
  if (summaryCard) summaryCard.style.display = "block";

  tbody.innerHTML = cart.map((item, idx) => {
    const optText = item.options && Object.keys(item.options).length
      ? Object.values(item.options).join(" / ")
      : "Standard";
    return `
    <tr data-id="${item.id}" data-options='${JSON.stringify(item.options || {})}'>
      <td data-label="Product">
        <div class="cart-item-cell">
          <img src="${item.image}" alt="${item.name}">
          <div>
            <h4>${item.name}</h4>
            <span class="p-cat">${optText} &middot; SKU ${item.sku}</span>
          </div>
        </div>
      </td>
      <td data-label="Price" class="mono">${tnFormatPrice(item.price)}</td>
      <td data-label="Quantity">
        <div class="cart-qty">
          <button type="button" class="cart-qty-minus" aria-label="Decrease quantity">&minus;</button>
          <input type="text" readonly value="${item.qty}" class="cart-qty-input">
          <button type="button" class="cart-qty-plus" aria-label="Increase quantity">+</button>
        </div>
      </td>
      <td data-label="Total" class="cart-line-total mono">${tnFormatPrice(item.price * item.qty)}</td>
      <td data-label="Remove">
        <button type="button" class="remove-item-btn">Remove ✕</button>
      </td>
    </tr>`;
  }).join("");

  tnUpdateCartSummary();
}

function tnUpdateCartSummary(discountRate) {
  const rateStored = discountRate !== undefined ? discountRate : Number(sessionStorage.getItem("tn_discount_rate") || 0);
  const t = tnCartTotals(rateStored);
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set("sumSubtotal", tnFormatPrice(t.subtotal));
  set("sumDiscount", "-" + tnFormatPrice(t.discount));
  set("sumTax", tnFormatPrice(t.tax));
  set("sumShipping", t.shipping === 0 ? "FREE" : tnFormatPrice(t.shipping));
  set("sumTotal", tnFormatPrice(t.total));
  const discountRow = document.getElementById("discountRow");
  if (discountRow) discountRow.style.display = t.discount > 0 ? "flex" : "none";
}

/* ---------- Wire up cart page interactions ---------- */
function tnInitCartPage() {
  const tbody = document.getElementById("cartTableBody");
  if (!tbody) return;

  tnRenderCartPage();

  tbody.addEventListener("click", function (e) {
    const row = e.target.closest("tr");
    if (!row) return;
    const id = Number(row.dataset.id);
    const options = JSON.parse(row.dataset.options || "{}");

    if (e.target.classList.contains("cart-qty-plus")) {
      const cart = tnGetCart();
      const item = cart.find(i => i.id === id && JSON.stringify(i.options) === JSON.stringify(options));
      tnUpdateQty(id, options, (item ? item.qty : 1) + 1);
      tnRenderCartPage();
    }
    if (e.target.classList.contains("cart-qty-minus")) {
      const cart = tnGetCart();
      const item = cart.find(i => i.id === id && JSON.stringify(i.options) === JSON.stringify(options));
      if (item && item.qty <= 1) {
        tnRemoveFromCart(id, options);
      } else {
        tnUpdateQty(id, options, (item ? item.qty : 1) - 1);
      }
      tnRenderCartPage();
    }
    if (e.target.classList.contains("remove-item-btn")) {
      tnRemoveFromCart(id, options);
      tnRenderCartPage();
    }
  });

  const emptyBtn = document.getElementById("emptyCartBtn");
  if (emptyBtn) emptyBtn.addEventListener("click", () => { tnEmptyCart(); tnRenderCartPage(); });

  const couponBtn = document.getElementById("applyCouponBtn");
  if (couponBtn) {
    couponBtn.addEventListener("click", () => {
      const input = document.getElementById("couponInput");
      const msg = document.getElementById("couponMsg");
      const code = input.value.trim().toUpperCase();
      if (TN_COUPONS[code]) {
        sessionStorage.setItem("tn_discount_rate", TN_COUPONS[code]);
        msg.textContent = `Coupon applied — ${TN_COUPONS[code] * 100}% off your order.`;
        msg.className = "coupon-msg ok";
        tnUpdateCartSummary(TN_COUPONS[code]);
      } else {
        msg.textContent = "That coupon code isn't valid.";
        msg.className = "coupon-msg err";
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  tnRenderCartBadge();
  tnInitCartPage();
});
