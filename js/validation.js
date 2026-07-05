/* ==========================================================================
   TechNova Electronics — Form Validation
   Vanilla JS validation helpers used by the checkout and contact pages.
   ========================================================================== */

function tnShowError(inputEl, message) {
  inputEl.classList.add("error");
  const err = inputEl.parentElement.querySelector(".field-error");
  if (err) { err.textContent = message; err.classList.add("show"); }
}
function tnClearError(inputEl) {
  inputEl.classList.remove("error");
  const err = inputEl.parentElement.querySelector(".field-error");
  if (err) err.classList.remove("show");
}
function tnRequired(inputEl, label) {
  if (!inputEl.value.trim()) { tnShowError(inputEl, `${label} is required.`); return false; }
  tnClearError(inputEl); return true;
}

/* ---------- Checkout Page Validation ---------- */
function tnInitCheckoutValidation() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  const fields = {
    fullName: v => v.trim().length >= 3 || "Enter your full name.",
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email address.",
    phone: v => /^[0-9+\-()\s]{7,15}$/.test(v) || "Enter a valid phone number.",
    address: v => v.trim().length >= 5 || "Enter your street address.",
    city: v => v.trim().length >= 2 || "City is required.",
    province: v => v.trim().length >= 2 || "Province/state is required.",
    postalCode: v => /^[A-Za-z0-9\- ]{3,10}$/.test(v) || "Enter a valid postal code.",
  };

  Object.keys(fields).forEach(name => {
    const el = form.elements[name];
    if (!el) return;
    el.addEventListener("blur", () => tnValidateField(el, fields[name]));
    el.addEventListener("input", () => { if (el.classList.contains("error")) tnValidateField(el, fields[name]); });
  });

  const cardNumber = form.elements["cardNumber"];
  const expiry = form.elements["expiry"];
  const cvv = form.elements["cvv"];

  if (cardNumber) {
    cardNumber.addEventListener("input", () => {
      cardNumber.value = cardNumber.value.replace(/[^0-9]/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    });
    cardNumber.addEventListener("blur", () => {
      const digits = cardNumber.value.replace(/\s/g, "");
      digits.length === 16 ? tnClearError(cardNumber) : tnShowError(cardNumber, "Card number must be 16 digits.");
    });
  }
  if (expiry) {
    expiry.addEventListener("input", () => {
      let v = expiry.value.replace(/[^0-9]/g, "").slice(0, 4);
      if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
      expiry.value = v;
    });
    expiry.addEventListener("blur", () => {
      const m = expiry.value.match(/^(\d{2})\/(\d{2})$/);
      if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) { tnShowError(expiry, "Use MM/YY format."); return; }
      tnClearError(expiry);
    });
  }
  if (cvv) {
    cvv.addEventListener("input", () => { cvv.value = cvv.value.replace(/[^0-9]/g, "").slice(0, 4); });
    cvv.addEventListener("blur", () => {
      cvv.value.length >= 3 ? tnClearError(cvv) : tnShowError(cvv, "CVV must be 3–4 digits.");
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    Object.keys(fields).forEach(name => {
      const el = form.elements[name];
      if (!el) return;
      if (!tnValidateField(el, fields[name])) valid = false;
    });

    const paymentMethod = form.querySelector("input[name=paymentMethod]:checked");
    if (paymentMethod && paymentMethod.value === "card") {
      const digits = cardNumber.value.replace(/\s/g, "");
      if (digits.length !== 16) { tnShowError(cardNumber, "Card number must be 16 digits."); valid = false; }
      if (!/^\d{2}\/\d{2}$/.test(expiry.value)) { tnShowError(expiry, "Use MM/YY format."); valid = false; }
      if (cvv.value.length < 3) { tnShowError(cvv, "CVV must be 3–4 digits."); valid = false; }
    }

    if (!valid) {
      form.querySelector(".error")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    tnPlaceOrder(form);
  });
}

function tnValidateField(el, rule) {
  const result = rule(el.value);
  if (result === true) { tnClearError(el); return true; }
  tnShowError(el, result); return false;
}

function tnPlaceOrder(form) {
  const orderId = "TN" + Math.floor(100000 + Math.random() * 900000);
  document.getElementById("checkoutFormsWrap").style.display = "none";
  document.getElementById("orderSuccessPanel").style.display = "block";
  document.getElementById("orderIdChip").textContent = "Order #" + orderId;
  const emailEl = form.elements["email"];
  const emailNote = document.getElementById("orderEmailNote");
  if (emailNote && emailEl) emailNote.textContent = emailEl.value;
  tnEmptyCart();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- Contact Page Validation ---------- */
function tnValidateContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return false;
  let valid = true;

  const name = form.elements["name"];
  const email = form.elements["email"];
  const subject = form.elements["subject"];
  const message = form.elements["message"];

  if (!tnRequired(name, "Name")) valid = false;
  if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    tnShowError(email, "Enter a valid email address."); valid = false;
  } else tnClearError(email);
  if (!tnRequired(subject, "Subject")) valid = false;
  if (message.value.trim().length < 20) {
    tnShowError(message, "Message must be at least 20 characters."); valid = false;
  } else tnClearError(message);

  return valid;
}

function tnInitContactValidation() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  ["name", "email", "subject", "message"].forEach(name => {
    const el = form.elements[name];
    if (el) el.addEventListener("blur", tnValidateContactForm);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  tnInitCheckoutValidation();
  tnInitContactValidation();
});
