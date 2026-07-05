/* ==========================================================================
   TechNova Electronics — Product Catalog (shared data source)
   In a real deployment this would come from a backend/API. For this
   project it lives here as a single source of truth every page reads.
   ========================================================================== */

const TN_PRODUCTS = [
  { id: 1, sku: "TN-LP-1001", name: "NovaBook Air 14", category: "laptop", price: 1099, oldPrice: 1299, rating: 4.6, reviews: 128, stock: 14, image: "images/icon-laptop.png", colors: ["#14181C","#8A9098","#0E7C7B"], storage: ["256GB","512GB","1TB"], desc: "A featherweight 14-inch laptop built for creators who work from anywhere. All-day battery, a crisp display, and a chassis machined from a single block of aluminum." },
  { id: 2, sku: "TN-LP-1002", name: "NovaBook Pro 16", category: "laptop", price: 1899, oldPrice: null, rating: 4.8, reviews: 96, stock: 7, image: "images/novabook-pro-16.jpg", colors: ["#14181C","#0E7C7B"], storage: ["512GB","1TB","2TB"], desc: "The workhorse of the lineup. A 16-inch high-refresh display and desktop-class performance for video editing, 3D rendering, and heavy multitasking." },
  { id: 3, sku: "TN-LP-1003", name: "NovaBook Flex 13 2-in-1", category: "laptop", price: 949, oldPrice: 1049, rating: 4.3, reviews: 54, stock: 20, image: "images/novabook-flex-13.jpg", colors: ["#8A9098"], storage: ["256GB","512GB"], desc: "A convertible laptop that folds flat into a tablet. Touch, pen input, and a fanless design for silent everyday computing." },
  { id: 4, sku: "TN-LP-1004", name: "NovaBook SE 15", category: "laptop", price: 699, oldPrice: null, rating: 4.1, reviews: 210, stock: 32, image: "images/novabook-se-15.jpg", colors: ["#14181C","#F2A93B"], storage: ["256GB","512GB"], desc: "Everyday computing made affordable, without cutting corners on build quality or battery life." },
  { id: 5, sku: "TN-PH-2001", name: "Nova X15 Smartphone", category: "phone", price: 899, oldPrice: 999, rating: 4.7, reviews: 340, stock: 25, image: "images/icon-phone.png", colors: ["#14181C","#0E7C7B","#F2A93B"], storage: ["128GB","256GB","512GB"], desc: "Our flagship phone with a triple-lens camera system, all-day battery, and a display built to stay bright in direct sunlight." },
  { id: 6, sku: "TN-PH-2002", name: "Nova X15 Mini", category: "phone", price: 649, oldPrice: null, rating: 4.4, reviews: 180, stock: 40, image: "images/icon-phone-mini.png", colors: ["#14181C","#8A9098"], storage: ["128GB","256GB"], desc: "Everything you love about the X15, resized to fit comfortably in one hand." },
  { id: 7, sku: "TN-PH-2003", name: "Nova Lite 8", category: "phone", price: 399, oldPrice: 449, rating: 4.0, reviews: 402, stock: 60, image: "images/nova-lite-8.jpg", colors: ["#0E7C7B","#8A9098"], storage: ["64GB","128GB"], desc: "A reliable, budget-friendly phone with a battery that easily lasts two days." },
  { id: 8, sku: "TN-WT-3001", name: "NovaWatch Pulse", category: "watch", price: 329, oldPrice: 379, rating: 4.5, reviews: 150, stock: 18, image: "images/icon-smartwatch.png", colors: ["#14181C","#F2A93B"], storage: null, desc: "Round dial, always-on display, and health tracking that goes well beyond step counts — sleep stages, blood oxygen, and stress trends." },
  { id: 9, sku: "TN-WT-3002", name: "NovaWatch Sport", category: "watch", price: 249, oldPrice: null, rating: 4.2, reviews: 88, stock: 22, image: "images/icon-smartwatch2.png", colors: ["#0E7C7B","#8A9098"], storage: null, desc: "Built for training. GPS, water resistance to 50m, and a battery that survives an entire race weekend." },
  { id: 10, sku: "TN-HP-4001", name: "NovaSound Aura ANC", category: "headphones", price: 279, oldPrice: 329, rating: 4.8, reviews: 265, stock: 30, image: "images/icon-headphones-pro.png", colors: ["#14181C"], storage: null, desc: "Over-ear headphones with adaptive noise cancellation and 40 hours of playback on a single charge." },
  { id: 11, sku: "TN-HP-4002", name: "NovaSound Breeze", category: "headphones", price: 129, oldPrice: null, rating: 4.3, reviews: 190, stock: 45, image: "images/icon-headphones.png", colors: ["#8A9098","#F2A93B"], storage: null, desc: "Lightweight on-ear headphones tuned for podcasts and long calls." },
  { id: 12, sku: "TN-EB-4501", name: "NovaBuds Pod", category: "headphones", price: 159, oldPrice: 189, rating: 4.6, reviews: 310, stock: 50, image: "images/icon-earbuds.png", colors: ["#14181C","#8A9098"], storage: null, desc: "True wireless earbuds with a compact case and secure, all-day fit." },
  { id: 13, sku: "TN-GM-5001", name: "NovaStrike Gaming Mouse", category: "gaming", price: 79, oldPrice: 99, rating: 4.7, reviews: 220, stock: 55, image: "images/icon-gaming-mouse.png", colors: ["#14181C"], storage: null, desc: "A 26,000 DPI optical sensor and a sub-1ms wireless connection built for competitive play." },
  { id: 14, sku: "TN-GM-5002", name: "NovaStrike Mechanical Keyboard", category: "gaming", price: 139, oldPrice: null, rating: 4.5, reviews: 175, stock: 28, image: "images/icon-gaming-keyboard.png", colors: ["#14181C"], storage: null, desc: "Hot-swappable mechanical switches, per-key RGB, and a machined aluminum frame." },
  { id: 15, sku: "TN-AC-6001", name: "NovaView 27\" Monitor", category: "accessories", price: 349, oldPrice: 399, rating: 4.6, reviews: 140, stock: 16, image: "images/icon-monitor.png", colors: ["#8A9098"], storage: null, desc: "A 27-inch QHD monitor with a 165Hz refresh rate for both work and play." },
  { id: 16, sku: "TN-AC-6002", name: "NovaTab 11", category: "accessories", price: 549, oldPrice: null, rating: 4.4, reviews: 98, stock: 24, image: "images/icon-tablet.png", colors: ["#14181C","#0E7C7B"], storage: ["128GB","256GB"], desc: "A versatile 11-inch tablet for note-taking, streaming, and light creative work." },
  { id: 17, sku: "TN-AC-6003", name: "NovaCast Webcam 4K", category: "accessories", price: 89, oldPrice: 109, rating: 4.3, reviews: 76, stock: 38, image: "images/icon-webcam.png", colors: ["#14181C"], storage: null, desc: "Crisp 4K video with auto-framing, ideal for streaming and video calls." },
  { id: 18, sku: "TN-AC-6004", name: "NovaSonic Speaker", category: "accessories", price: 119, oldPrice: null, rating: 4.5, reviews: 132, stock: 33, image: "images/icon-speaker.png", colors: ["#F2A93B","#14181C"], storage: null, desc: "A portable Bluetooth speaker with room-filling sound and 18-hour battery life." },
];

const TN_CATEGORIES = [
  { key: "laptop", name: "Laptops", icon: "images/icon-laptop.png" },
  { key: "phone", name: "Smartphones", icon: "images/icon-phone.png" },
  { key: "watch", name: "Smart Watches", icon: "images/icon-smartwatch.png" },
  { key: "headphones", name: "Headphones", icon: "images/icon-headphones.png" },
  { key: "gaming", name: "Gaming", icon: "images/icon-gaming-mouse.png" },
];

/* Helpers shared across pages */
function tnFindProduct(id) {
  return TN_PRODUCTS.find(p => p.id === Number(id));
}
function tnFormatPrice(n) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function tnStars(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}
