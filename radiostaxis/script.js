/* ==========================================================
   Radio Taxi PAXSIAS - Lógica del portal
   JavaScript Vanilla · Manipulación del DOM
   ========================================================== */

/* ----------------------------------------------------------
   CONFIGURACIÓN: número de WhatsApp de la empresa
   Formato: código de país (591) + número, sin "+", espacios ni guiones.
   ---------------------------------------------------------- */
const NUMERO_WHATSAPP_EMPRESA = "591XXXXXXXX"; // PENDIENTE: Reemplazar con el número móvil corporativo de PAXSIAS

/* ----------------------------------------------------------
   CATÁLOGO DE SERVICIOS Y TAMAÑOS DE FLOTA
   `valorSelect` coincide con el value de las opciones del <select>.
   ---------------------------------------------------------- */
const SERVICIOS = [
  {
    id: 1,
    categoria: "mediano",
    valorSelect: "Taxi Mediano",
    titulo: "Taxi Mediano (Urbano y Pasajeros)",
    descripcion: "Ideal para 1 a 4 pasajeros con maletero estándar.",
    usos: "Traslados rápidos en la ciudad, viajes al aeropuerto y diligencias diarias.",
    imagen: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=400&q=70",
    alt: "Taxi mediano circulando por la ciudad"
  },
  {
    id: 2,
    categoria: "carga",
    valorSelect: "Móvil para Carga",
    titulo: "Móvil para Carga (Equipaje y Compras)",
    descripcion: "Vagoneta o minivan amplia con gran espacio interior.",
    usos: "Electrodomésticos medianos, compras voluminosas del supermercado, maletas múltiples o cajas.",
    imagen: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=400&q=70",
    alt: "Vagoneta o minivan para equipaje y compras"
  },
  {
    id: 3,
    categoria: "pesada",
    valorSelect: "Móvil para Carga Pesada",
    titulo: "Móvil para Carga Pesada (Mudanzas y Bultos)",
    descripcion: "Camioneta o furgón de mayor capacidad.",
    usos: "Mudanzas pequeñas, muebles, materiales o bultos pesados dentro de la ciudad.",
    imagen: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=400&q=70",
    alt: "Camioneta o furgón para mudanzas y carga pesada"
  }
];

/* ----------------------------------------------------------
   REFERENCIAS AL DOM
   ---------------------------------------------------------- */
const menuToggle       = document.getElementById("menuToggle");
const mainNav          = document.getElementById("mainNav");
const catalogo         = document.getElementById("catalogo");
const botonesFiltro    = document.querySelectorAll(".filter-btn");
const formulario       = document.getElementById("formSolicitud");
const alertaForm       = document.getElementById("formAlert");
const resumen          = document.getElementById("resumen");
const whatsappFlotante = document.getElementById("whatsappFlotante");

/* ----------------------------------------------------------
   UTILIDADES
   ---------------------------------------------------------- */

// Indica si el número de WhatsApp sigue siendo el marcador de posición
function numeroWhatsAppPendiente() {
  return !/^\d{11,15}$/.test(NUMERO_WHATSAPP_EMPRESA);
}

// Escapa texto del usuario antes de insertarlo con innerHTML (evita inyección de HTML)
function escaparHTML(texto) {
  const mapa = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(texto).replace(/[&<>"']/g, (c) => mapa[c]);
}

/* ==========================================================
   1. MENÚ HAMBURGUESA (solo classList.toggle)
   ========================================================== */
menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("open");
  mainNav.classList.toggle("open");
  // Accesibilidad: refleja el estado actual del menú
  menuToggle.setAttribute("aria-expanded", menuToggle.classList.contains("open"));
});

// Al elegir un enlace del menú, se vuelve a cerrar
mainNav.querySelectorAll("a").forEach((enlace) => {
  enlace.addEventListener("click", () => {
    menuToggle.classList.remove("open");
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

/* ==========================================================
   2. CATÁLOGO: generación de tarjetas
   ========================================================== */
function renderizarCatalogo() {
  catalogo.innerHTML = SERVICIOS.map((s) => `
    <article class="card" data-category="${s.categoria}">
      <img class="card-img" src="${s.imagen}" alt="${s.alt}" loading="lazy"
           onerror="this.removeAttribute('src')">
      <div class="card-body">
        <h3>${s.titulo}</h3>
        <p class="card-desc">${s.descripcion}</p>
        <p class="card-uso"><strong>Ideal para:</strong> ${s.usos}</p>
        <button type="button" class="card-btn" data-seleccion="${s.valorSelect}">
          Seleccionar este Móvil
        </button>
      </div>
    </article>
  `).join("");
}

/* ==========================================================
   3. FILTRO DINÁMICO (querySelectorAll + dataset + addEventListener)
   ========================================================== */
function filtrarCatalogo(categoria) {
  const tarjetas = document.querySelectorAll(".card");
  tarjetas.forEach((tarjeta) => {
    const visible = categoria === "todos" || tarjeta.dataset.category === categoria;
    tarjeta.hidden = !visible;
  });
}

botonesFiltro.forEach((boton) => {
  boton.addEventListener("click", () => {
    botonesFiltro.forEach((b) => b.classList.remove("active"));
    boton.classList.add("active");
    filtrarCatalogo(boton.dataset.filter);
  });
});

/* ==========================================================
   4. "SELECCIONAR ESTE MÓVIL": rellena el select y baja al formulario
   (delegación de eventos sobre el contenedor de tarjetas)
   ========================================================== */
catalogo.addEventListener("click", (evento) => {
  const boton = evento.target.closest(".card-btn");
  if (!boton) return;

  const select = document.getElementById("tipoMovil");
  select.value = boton.dataset.seleccion;
  validarCampo(select); // marca el campo como válido de inmediato

  document.getElementById("solicitar").scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => document.getElementById("nombre").focus({ preventScroll: true }), 500);
});

/* ==========================================================
   5. VALIDACIÓN DEL FORMULARIO (input / blur / submit)
   ========================================================== */
const REGLAS = {
  nombre: (v) => {
    if (!v) return "Ingresa el nombre del pasajero.";
    if (v.length < 3) return "El nombre debe tener al menos 3 caracteres.";
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s.'-]+$/.test(v)) return "El nombre solo puede contener letras.";
    return "";
  },
  celular: (v) => {
    if (!v) return "Ingresa tu número de celular.";
    const limpio = v.replace(/[\s-]/g, "");
    // Celular boliviano: 8 dígitos que empiezan con 6 o 7 (admite prefijo 591 / +591)
    if (!/^(\+?591)?[67]\d{7}$/.test(limpio)) return "Número inválido. Ej: 71234567.";
    return "";
  },
  tipoMovil: (v) => (v ? "" : "Selecciona el tipo de móvil."),
  origen: (v) => {
    if (!v) return "Ingresa la dirección de recojo.";
    if (v.length < 5) return "Escribe una dirección más exacta.";
    return "";
  },
  destino: (v) => {
    if (!v) return "Ingresa la dirección de destino.";
    if (v.length < 5) return "Escribe una dirección más exacta.";
    return "";
  }
};

// Valida un campo, pinta el estado (rojo/verde) y devuelve true si es válido
function validarCampo(campo) {
  const regla = REGLAS[campo.name];
  if (!regla) return true;

  const mensaje = regla(campo.value.trim());
  const contenedor = campo.closest(".field");
  const zonaError = document.getElementById(`error-${campo.name}`);

  contenedor.classList.toggle("is-invalid", mensaje !== "");
  contenedor.classList.toggle("is-valid", mensaje === "");
  zonaError.textContent = mensaje;
  return mensaje === "";
}

// Alerta general del formulario (tipo: error | success | warning)
function mostrarAlerta(tipo, texto) {
  alertaForm.className = `alert alert-${tipo}`;
  alertaForm.textContent = texto;
  alertaForm.hidden = false;
}

const camposObligatorios = Array.from(formulario.querySelectorAll("input[name], select[name]"))
  .filter((c) => REGLAS[c.name]);

camposObligatorios.forEach((campo) => {
  // Mientras se escribe: solo reevalúa si el campo ya fue marcado antes
  campo.addEventListener("input", () => {
    if (campo.closest(".field").classList.contains("is-invalid") ||
        campo.closest(".field").classList.contains("is-valid")) {
      validarCampo(campo);
    }
  });
  // Al salir del campo: valida siempre
  campo.addEventListener("blur", () => validarCampo(campo));
  // El select dispara "change" al elegir una opción
  campo.addEventListener("change", () => validarCampo(campo));
});

/* ==========================================================
   6. ENVÍO: resumen visual + enlace de WhatsApp
   ========================================================== */
function construirMensajeWhatsApp(d) {
  return [
    "*Solicitud de móvil - Radio Taxi PAXSIAS*",
    "",
    `*Pasajero:* ${d.nombre}`,
    `*Teléfono:* ${d.celular}`,
    `*Móvil requerido:* ${d.tipoMovil}`,
    `*Recojo:* ${d.origen}`,
    `*Destino:* ${d.destino}`,
    `*Observaciones:* ${d.observaciones || "Ninguna"}`
  ].join("\n");
}

function urlWhatsApp(mensaje) {
  return `https://wa.me/${NUMERO_WHATSAPP_EMPRESA}?text=${encodeURIComponent(mensaje)}`;
}

function mostrarResumen(d, enlace) {
  resumen.innerHTML = `
    <h3>✅ Resumen de tu solicitud</h3>
    <dl>
      <dt>Pasajero:</dt><dd>${escaparHTML(d.nombre)}</dd>
      <dt>Celular:</dt><dd>${escaparHTML(d.celular)}</dd>
      <dt>Móvil:</dt><dd>${escaparHTML(d.tipoMovil)}</dd>
      <dt>Recojo:</dt><dd>${escaparHTML(d.origen)}</dd>
      <dt>Destino:</dt><dd>${escaparHTML(d.destino)}</dd>
      <dt>Notas:</dt><dd>${escaparHTML(d.observaciones || "Ninguna")}</dd>
    </dl>
    ${enlace ? `<a class="btn btn-primary" href="${enlace}" target="_blank" rel="noopener noreferrer">Abrir WhatsApp de nuevo</a>` : ""}
  `;
  resumen.hidden = false;
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault(); // evita el envío/recarga nativa

  // Valida todos los campos obligatorios (sin cortocircuito para marcarlos todos)
  const resultados = camposObligatorios.map((campo) => validarCampo(campo));
  const todoValido = resultados.every(Boolean);

  if (!todoValido) {
    resumen.hidden = true;
    mostrarAlerta("error", "⚠️ Revisa los campos marcados en rojo antes de enviar.");
    const primerError = formulario.querySelector(".is-invalid input, .is-invalid select");
    if (primerError) primerError.focus({ preventScroll: false });
    return;
  }

  const datos = {
    nombre: formulario.nombre.value.trim(),
    celular: formulario.celular.value.trim(),
    tipoMovil: formulario.tipoMovil.value,
    origen: formulario.origen.value.trim(),
    destino: formulario.destino.value.trim(),
    observaciones: formulario.observaciones.value.trim()
  };

  if (numeroWhatsAppPendiente()) {
    // Mientras el número corporativo no esté configurado no se abre WhatsApp
    mostrarAlerta("warning", "Datos validados, pero el WhatsApp de la empresa aún no está configurado. Llama a la central: 22224489.");
    mostrarResumen(datos, null);
    return;
  }

  const enlace = urlWhatsApp(construirMensajeWhatsApp(datos));
  mostrarAlerta("success", "✅ Datos validados. Abriendo WhatsApp para enviar tu solicitud…");
  mostrarResumen(datos, enlace);
  window.open(enlace, "_blank", "noopener,noreferrer");
});

/* ==========================================================
   7. BOTÓN FLOTANTE DE WHATSAPP (usa la misma constante)
   ========================================================== */
function configurarWhatsAppFlotante() {
  const saludo = "Hola, necesito solicitar un móvil de Radio Taxi PAXSIAS.";

  if (numeroWhatsAppPendiente()) {
    // Sin número real: evita abrir un enlace roto
    whatsappFlotante.addEventListener("click", (e) => {
      e.preventDefault();
      mostrarAlerta("warning", "El WhatsApp de la empresa aún no está configurado. Llama a la central: 22224489.");
      document.getElementById("solicitar").scrollIntoView({ behavior: "smooth" });
    });
    return;
  }
  whatsappFlotante.href = urlWhatsApp(saludo);
}

/* ==========================================================
   INICIALIZACIÓN
   ========================================================== */
renderizarCatalogo();
configurarWhatsAppFlotante();
document.getElementById("anioActual").textContent = new Date().getFullYear();
