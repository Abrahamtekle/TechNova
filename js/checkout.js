/* ==========================================================================
   TechNova Electronics — Checkout Order Summary
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("checkoutOrderList");
  if (!list) return;

  const cart = tnGetCart();
  if (!cart.length) {
    document.getElementById("checkoutFormsWrap").innerHTML =
      `<div class="empty-cart"><h3>Your cart is empty</h3><p>Add a few products before checking out.</p><a class="btn btn-primary" href="products.html">Browse Products</a></div>`;
  }

  list.innerHTML = cart.map(item => `
    <div class="order-summary-item">
      <span>${item.name} <span class="qty-mini">× ${item.qty}</span></span>
      <span class="mono">${tnFormatPrice(item.price * item.qty)}</span>
    </div>`).join("");

  const rate = Number(sessionStorage.getItem("tn_discount_rate") || 0);
  const t = tnCartTotals(rate);
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set("checkoutSubtotal", tnFormatPrice(t.subtotal));
  set("checkoutTax", tnFormatPrice(t.tax));
  set("checkoutShipping", t.shipping === 0 ? "FREE" : tnFormatPrice(t.shipping));
  set("checkoutGrandTotal", tnFormatPrice(t.total));
});
