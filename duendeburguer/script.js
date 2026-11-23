/* =========================================================
   DuendeBurguer II - Lógica de la aplicación (JavaScript Vanilla)
   ========================================================= */

/* ---------------------------------------------------------
   0. CONFIGURACIÓN
   --------------------------------------------------------- */
// Reemplazá XXXXXXXX por el número real del negocio (8 dígitos, sin espacios).
const WHATSAPP_NUMBER = "591XXXXXXXX";
const CURRENCY = "Bs.";

// Imagen de respaldo (SVG embebido) por si una URL de Unsplash falla
const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='640' height='400'><rect width='100%' height='100%' fill='#2a231f'/><text x='50%' y='50%' font-size='90' text-anchor='middle' dominant-baseline='middle'>🍔</text></svg>"
  );

/* ---------------------------------------------------------
   1. CATÁLOGO DE PRODUCTOS
   --------------------------------------------------------- */
const products = [
  {
    id: 1,
    name: "Salchipapa",
    category: "salchipapas",
    price: 25,
    description: "Papas fritas crocantes, salchicha vienesa dorada y variedad de salsas de la casa.",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=640&q=70"
  },
  {
    id: 2,
    name: "Hamburguesa Simple",
    category: "hamburguesas",
    price: 22,
    description: "Carne de res a la parrilla, queso cheddar, lechuga fresca, tomate y pan artesanal.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=640&q=70"
  },
  {
    id: 3,
    name: "Hamburguesa Doble",
    category: "hamburguesas",
    price: 35,
    description: "Doble medallón de carne jugosa, doble queso cheddar, tocino crocante y salsa especial.",
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=640&q=70"
  },
  {
    id: 4,
    name: "Hamburguesa Mixta",
    category: "hamburguesas",
    price: 32,
    description: "Carne de res, filete de pollo a la plancha, huevo frito, queso y vegetales frescos.",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=640&q=70"
  },
  {
    id: 5,
    name: "La Legendaria",
    category: "especiales",
    price: 48,
    description: "La especialidad de la casa: triple carne, queso fundido, aros de cebolla, tocino, huevo y salsa secreta Duende.",
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=640&q=70"
  },
  {
    id: 6,
    name: "Ramen",
    category: "especiales",
    price: 40,
    description: "Fideos orientales en caldo concentrado, huevo cocido, cebollín, carne laminada y toque picante opcional.",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=640&q=70"
  },
  {
    id: 7,
    name: "Lomito",
    category: "lomitos",
    price: 38,
    description: "Jugoso corte de lomo de res a la plancha en pan suave, huevo, queso, jamón y ensalada fresca.",
    image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=640&q=70"
  },
  {
    id: 8,
    name: "Salchilomito",
    category: "salchipapas",
    price: 45,
    description: "Combinación contundente de papas fritas, salchichas doradas, trozos de lomo de res salteado y huevo frito.",
    image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=640&q=70"
  }
];

/* ---------------------------------------------------------
   2. ESTADO DE LA APLICACIÓN
   --------------------------------------------------------- */
// cart: arreglo de objetos { id, name, price, qty, note }
let cart = [];
let activeFilter = "todos";
let searchTerm = "";

/* ---------------------------------------------------------
   3. REFERENCIAS AL DOM
   --------------------------------------------------------- */
const hamburger = document.getElementById("hamburger");
const mainNav = document.getElementById("main-nav");
const menuGrid = document.getElementById("menu-grid");
const emptyMsg = document.getElementById("empty-msg");
const searchInput = document.getElementById("search");
const filterButtons = document.querySelectorAll(".filter-btn");

const cartItemsEl = document.getElementById("cart-items");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const cartCountEl = document.getElementById("cart-count");
const floatingCart = document.getElementById("floating-cart");
const clearCartBtn = document.getElementById("clear-cart");
const orderNoteEl = document.getElementById("order-note");

const form = document.getElementById("checkout-form");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const deliverySelect = document.getElementById("delivery");
const addressGroup = document.getElementById("address-group");
const addressInput = document.getElementById("address");
const paymentSelect = document.getElementById("payment");
const formAlert = document.getElementById("form-alert");

/* ---------------------------------------------------------
   4. UTILIDADES
   --------------------------------------------------------- */
// Formatea un número como moneda boliviana
const formatPrice = (n) => `${CURRENCY} ${n.toFixed(2)}`;

// Escapa texto del usuario antes de insertarlo con innerHTML (evita inyección de HTML)
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Normaliza texto para búsquedas (minúsculas y sin tildes)
const normalize = (str) =>
  str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/* ---------------------------------------------------------
   5. MENÚ HAMBURGUESA (solo classList.toggle)
   --------------------------------------------------------- */
hamburger.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  hamburger.classList.toggle("active");
  hamburger.setAttribute("aria-expanded", isOpen);
});

// Al tocar un enlace del menú en móvil, se cierra el menú
mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    hamburger.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
  });
});

/* ---------------------------------------------------------
   6. RENDERIZADO DEL MENÚ + FILTRO + BUSCADOR
   --------------------------------------------------------- */
function renderMenu() {
  const term = normalize(searchTerm.trim());

  // Combina filtro por categoría y búsqueda por nombre o ingrediente
  const filtered = products.filter((p) => {
    const matchCategory = activeFilter === "todos" || p.category === activeFilter;
    const matchSearch =
      term === "" ||
      normalize(p.name).includes(term) ||
      normalize(p.description).includes(term);
    return matchCategory && matchSearch;
  });

  menuGrid.innerHTML = filtered
    .map(
      (p) => `
      <article class="card" data-category="${p.category}">
        <img class="card-img" src="${p.image}" alt="${p.name}" loading="lazy"
             onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
        <div class="card-body">
          <span class="card-cat">${p.category}</span>
          <div class="card-top">
            <h3 class="card-title">${p.name}</h3>
            <span class="card-price">${formatPrice(p.price)}</span>
          </div>
          <p class="card-desc">${p.description}</p>
          <button class="add-btn" data-id="${p.id}" type="button">+ Agregar al pedido</button>
        </div>
      </article>`
    )
    .join("");

  emptyMsg.hidden = filtered.length > 0;
}

// Filtros por categoría (usa dataset)
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    activeFilter = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderMenu();
  });
});

// Buscador en tiempo real
searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  renderMenu();
});

// Delegación de eventos: botón "Agregar al pedido"
menuGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;
  addToCart(Number(btn.dataset.id));
});

/* ---------------------------------------------------------
   7. CARRITO DE COMPRAS
   --------------------------------------------------------- */
function addToCart(id) {
  const product = products.find((p) => p.id === id);
  const existing = cart.find((item) => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, qty: 1, note: "" });
  }

  renderCart();

  // Animación del botón flotante
  floatingCart.classList.remove("bump");
  void floatingCart.offsetWidth; // reinicia la animación
  floatingCart.classList.add("bump");
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  renderCart();
}

function calculateTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCart() {
  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="cart-empty">🛒 Tu pedido está vacío. ¡Agregá algo del menú!</p>`;
  } else {
    cartItemsEl.innerHTML = cart
      .map(
        (item) => `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-top">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-price">${formatPrice(item.price * item.qty)}</span>
          </div>
          <div class="cart-item-controls">
            <button class="qty-btn" data-action="minus" data-id="${item.id}" type="button" aria-label="Disminuir cantidad">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" data-action="plus" data-id="${item.id}" type="button" aria-label="Aumentar cantidad">+</button>
            <button class="remove-btn" data-action="remove" data-id="${item.id}" type="button">Eliminar</button>
          </div>
          <input class="item-note" type="text" data-id="${item.id}"
                 placeholder="Extras: sin cebolla, con llajua..." value="${escapeHTML(item.note)}">
        </div>`
      )
      .join("");
  }

  // Totales en tiempo real
  const total = calculateTotal();
  subtotalEl.textContent = formatPrice(total);
  totalEl.textContent = formatPrice(total);
  cartCountEl.textContent = cart.reduce((sum, i) => sum + i.qty, 0);
}

// Delegación de eventos para + / - / eliminar
cartItemsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.action === "plus") changeQty(id, 1);
  if (btn.dataset.action === "minus") changeQty(id, -1);
  if (btn.dataset.action === "remove") removeFromCart(id);
});

// Notas por producto (se guardan sin volver a renderizar para no perder el foco)
cartItemsEl.addEventListener("input", (e) => {
  if (!e.target.classList.contains("item-note")) return;
  const item = cart.find((i) => i.id === Number(e.target.dataset.id));
  if (item) item.note = e.target.value;
});

clearCartBtn.addEventListener("click", () => {
  cart = [];
  renderCart();
});

/* ---------------------------------------------------------
   8. VALIDACIÓN DEL FORMULARIO
   --------------------------------------------------------- */
// Muestra un mensaje en rojo (error) o verde (éxito) bajo un campo
function setFieldState(input, isValid, message) {
  const feedback = document.getElementById(`${input.id}-feedback`);
  input.classList.toggle("is-valid", isValid);
  input.classList.toggle("is-invalid", !isValid);
  feedback.textContent = message;
  feedback.classList.toggle("success", isValid);
  feedback.classList.toggle("error", !isValid);
  return isValid;
}

// Un validador por campo: devuelve true/false y pinta el estado
const validators = {
  name() {
    const value = nameInput.value.trim();
    if (value.length < 3) return setFieldState(nameInput, false, "Ingresá tu nombre (mínimo 3 caracteres).");
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s.'-]+$/.test(value)) return setFieldState(nameInput, false, "El nombre solo puede contener letras.");
    return setFieldState(nameInput, true, "✔ Nombre correcto");
  },
  phone() {
    const value = phoneInput.value.trim();
    // Celulares bolivianos: 8 dígitos que empiezan con 6 o 7
    if (!/^[67]\d{7}$/.test(value)) return setFieldState(phoneInput, false, "Ingresá un celular válido de 8 dígitos (empieza con 6 o 7).");
    return setFieldState(phoneInput, true, "✔ Celular válido");
  },
  delivery() {
    if (deliverySelect.value === "") return setFieldState(deliverySelect, false, "Elegí la modalidad de entrega.");
    return setFieldState(deliverySelect, true, "✔ Modalidad seleccionada");
  },
  address() {
    // Solo se valida si eligió Delivery
    if (deliverySelect.value !== "Delivery") return true;
    const value = addressInput.value.trim();
    if (value.length < 8) return setFieldState(addressInput, false, "Escribí la dirección exacta con zona y referencia (mín. 8 caracteres).");
    return setFieldState(addressInput, true, "✔ Dirección registrada");
  },
  payment() {
    if (paymentSelect.value === "") return setFieldState(paymentSelect, false, "Elegí un método de pago.");
    return setFieldState(paymentSelect, true, "✔ Método de pago seleccionado");
  }
};

// Solo el celular acepta números
phoneInput.addEventListener("input", () => {
  phoneInput.value = phoneInput.value.replace(/\D/g, "");
});

// Validación en tiempo real: al escribir (input) y al salir del campo (blur)
[
  [nameInput, "name"],
  [phoneInput, "phone"],
  [addressInput, "address"]
].forEach(([el, key]) => {
  el.addEventListener("blur", validators[key]);
  el.addEventListener("input", () => {
    // Si ya fue marcado antes, revalida mientras escribe
    if (el.classList.contains("is-invalid") || el.classList.contains("is-valid")) validators[key]();
  });
});

[
  [paymentSelect, "payment"]
].forEach(([el, key]) => el.addEventListener("change", validators[key]));

// Modalidad: muestra u oculta el campo de dirección
deliverySelect.addEventListener("change", () => {
  validators.delivery();
  const isDelivery = deliverySelect.value === "Delivery";
  addressGroup.hidden = !isDelivery;

  if (!isDelivery) {
    // Limpia el estado del campo cuando no aplica
    addressInput.value = "";
    addressInput.classList.remove("is-valid", "is-invalid");
    document.getElementById("address-feedback").textContent = "";
  }
});

function showFormAlert(type, message) {
  formAlert.hidden = false;
  formAlert.className = `form-alert ${type}`;
  formAlert.textContent = message;
}

/* ---------------------------------------------------------
   9. ENVÍO DEL PEDIDO POR WHATSAPP
   --------------------------------------------------------- */
function buildWhatsAppMessage() {
  const lines = [];
  lines.push("🍔 *NUEVO PEDIDO - DuendeBurguer II*");
  lines.push("");
  lines.push(`👤 *Cliente:* ${nameInput.value.trim()}`);
  lines.push(`📱 *Celular:* ${phoneInput.value.trim()}`);
  lines.push("");
  lines.push("🧾 *Detalle del pedido:*");

  cart.forEach((item) => {
    lines.push(`• ${item.qty} x ${item.name} - ${formatPrice(item.price * item.qty)}`);
    if (item.note.trim()) lines.push(`   📝 Nota: ${item.note.trim()}`);
  });

  if (orderNoteEl.value.trim()) {
    lines.push("");
    lines.push(`📝 *Notas generales:* ${orderNoteEl.value.trim()}`);
  }

  lines.push("");
  lines.push(`💰 *TOTAL: ${formatPrice(calculateTotal())}*`);
  lines.push("");
  lines.push(`🛵 *Modalidad:* ${deliverySelect.value}`);
  if (deliverySelect.value === "Delivery") {
    lines.push(`📍 *Dirección:* ${addressInput.value.trim()}`);
  }
  lines.push(`💳 *Pago:* ${paymentSelect.value}`);

  return lines.join("\n");
}

form.addEventListener("submit", (e) => {
  e.preventDefault(); // evita el envío/recarga por defecto

  // Ejecuta TODAS las validaciones (sin cortocircuito) para marcar cada campo
  const results = [
    validators.name(),
    validators.phone(),
    validators.delivery(),
    validators.address(),
    validators.payment()
  ];

  if (cart.length === 0) {
    showFormAlert("error", "⚠️ Tu pedido está vacío. Agregá al menos un platillo del menú.");
    document.getElementById("carrito").scrollIntoView();
    return;
  }

  if (results.includes(false)) {
    showFormAlert("error", "⚠️ Revisá los campos marcados en rojo antes de enviar tu pedido.");
    return;
  }

  showFormAlert("success", "✅ ¡Todo correcto! Abriendo WhatsApp para enviar tu pedido...");

  const message = buildWhatsAppMessage();
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener");
});

/* ---------------------------------------------------------
   10. INICIALIZACIÓN
   --------------------------------------------------------- */
document.getElementById("year").textContent = new Date().getFullYear();
renderMenu();
renderCart();
