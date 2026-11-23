const NUMERO_WHATSAPP_TALLER = "591XXXXXXXX"; // Reemplazar con el número corporativo de Electrónica GONZALES

/* =====================================================
   Electrónica GONZALES - script.js (JavaScript Vanilla)
   ===================================================== */

/* ---------- 1. CATÁLOGO DE SERVICIOS ---------- */
const servicios = [
  {
    id: 1,
    titulo: "Reparación de Celulares y Tablets",
    categoria: "celulares",
    descripcion: "Cambio de pantallas rotas, baterías, pines de carga, liberación y solución de fallas de placa o humedad.",
    tarifa: "Diagnóstico referencial: Bs. 30 · Revisión: 1 a 2 horas",
    dispositivo: "Celular / Tablet",
    imagen: "https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&w=800&q=70",
    palabras: "pantalla rota bateria pin de carga liberacion placa humedad agua celular tablet smartphone"
  },
  {
    id: 2,
    titulo: "Mantenimiento y Reparación de Laptops y PC",
    categoria: "computadoras",
    descripcion: "Limpieza interna, cambio de pasta térmica, formateo, recuperación de datos, reparación de bisagras y fuentes de poder.",
    tarifa: "Diagnóstico referencial: Bs. 40 · Revisión: 24 horas",
    dispositivo: "Laptop / PC",
    imagen: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=70",
    palabras: "laptop pc computadora limpieza pasta termica formateo recuperacion datos bisagra fuente de poder lenta calienta"
  },
  {
    id: 3,
    titulo: "Reparación de Televisores y Equipos de Audio",
    categoria: "tv-audio",
    descripcion: "Diagnóstico y arreglo de Smart TV (LED/LCD), backlight, fuentes conmutadas, parlantes amplificados y consolas de sonido.",
    tarifa: "Diagnóstico referencial: Bs. 50 · Revisión: 24 a 48 horas",
    dispositivo: "Televisor / Equipo de audio",
    imagen: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=70",
    palabras: "televisor tv smart led lcd backlight fuente conmutada parlante amplificado consola sonido audio no enciende"
  },
  {
    id: 4,
    titulo: "Reparación de Electrodomésticos",
    categoria: "electrodomesticos",
    descripcion: "Servicio técnico para hornos microondas, licuadoras, planchas, cafeteras y pequeños aparatos del hogar.",
    tarifa: "Diagnóstico referencial: Bs. 25 · Revisión: 24 a 48 horas",
    dispositivo: "Electrodoméstico",
    imagen: "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=70",
    palabras: "microondas licuadora plancha cafetera electrodomestico hogar motor resistencia no calienta"
  },
  {
    id: 5,
    titulo: "Electrónica General y Microsoldadura",
    categoria: "general",
    descripcion: "Revisión y reparación de tarjetas electrónicas, cargadores, controles, fuentes reguladas y componentes en general.",
    tarifa: "Diagnóstico referencial: Bs. 30 · Revisión: 1 a 3 días",
    dispositivo: "Electrónica general",
    imagen: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=70",
    palabras: "tarjeta electronica cargador control remoto fuente regulada componentes microsoldadura soldadura circuito placa"
  }
];

const NOMBRES_CATEGORIA = {
  "celulares": "Celulares y Tablets",
  "computadoras": "Laptops y PC",
  "tv-audio": "TV / Audio",
  "electrodomesticos": "Electrodomésticos",
  "general": "Electrónica General"
};

/* ---------- 2. ESTADO ---------- */
let categoriaActiva = "todos";
let textoBusqueda = "";
let listaDiagnostico = []; // [{ id, observacion }]
let pagina = 0;      // página actual del catálogo
let pasoActual = 0;  // paso actual del asistente (0, 1, 2)

/* ---------- 3. REFERENCIAS AL DOM ---------- */
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");
const grid = document.getElementById("servicios-grid");
const contador = document.getElementById("contador");
const buscador = document.getElementById("buscador");
const botonesFiltro = document.querySelectorAll(".filter-btn");
const listaEl = document.getElementById("lista-diagnostico");
const fabCount = document.getElementById("fab-count");
const form = document.getElementById("form-diagnostico");
const alertaForm = document.getElementById("alerta-form");

/* ---------- Utilidades ---------- */
// Normaliza texto: minúsculas y sin tildes (para buscar "bateria" = "batería")
const normalizar = (t) =>
  t.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

// Escapa HTML para evitar inyección al usar innerHTML con texto del usuario
const escaparHTML = (t) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ---------- 4. MENÚ HAMBURGUESA (solo classList.toggle) ---------- */
hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("open");
  hamburger.classList.toggle("active");
  const abierto = navMenu.classList.contains("open");
  hamburger.setAttribute("aria-expanded", abierto);
});

// Al tocar un enlace del menú, se cierra (también con toggle)
navMenu.querySelectorAll("a").forEach((enlace) => {
  enlace.addEventListener("click", () => {
    if (navMenu.classList.contains("open")) {
      navMenu.classList.toggle("open");
      hamburger.classList.toggle("active");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });
});

/* ---------- 4b. NAVEGACIÓN POR VISTAS (sin scroll de página) ---------- */
const vistas = document.querySelectorAll(".view");

function mostrarVista(nombre) {
  vistas.forEach((v) => v.classList.toggle("active", v.dataset.name === nombre));
  document.querySelectorAll(".nav [data-view]").forEach((a) => {
    a.classList.toggle("current", a.dataset.view === nombre);
  });
}

// Cualquier elemento con data-view cambia de vista y cierra el menú móvil
document.querySelectorAll("[data-view]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    mostrarVista(el.dataset.view);
  });
});

/* ---------- 5. RENDER DEL CATÁLOGO (paginado) ---------- */
// Cuántas tarjetas caben por pantalla según el ancho
function serviciosPorPagina() {
  if (window.innerWidth >= 960) return 3;
  if (window.innerWidth >= 640) return 2;
  return 1;
}

function actualizarPager(totalPaginas) {
  document.getElementById("pager-info").textContent = `${pagina + 1} / ${totalPaginas}`;
  document.getElementById("pager-prev").disabled = pagina === 0;
  document.getElementById("pager-next").disabled = pagina >= totalPaginas - 1;
}

document.getElementById("pager-prev").addEventListener("click", () => {
  if (pagina > 0) { pagina--; renderServicios(); }
});
document.getElementById("pager-next").addEventListener("click", () => {
  pagina++; renderServicios();
});
function renderServicios() {
  const q = normalizar(textoBusqueda);

  const filtrados = servicios.filter((s) => {
    const coincideCategoria = categoriaActiva === "todos" || s.categoria === categoriaActiva;
    const textoServicio = normalizar(`${s.titulo} ${s.descripcion} ${s.palabras}`);
    const coincideTexto = q === "" || textoServicio.includes(q);
    return coincideCategoria && coincideTexto;
  });

  const porPagina = serviciosPorPagina();
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  if (pagina >= totalPaginas) pagina = totalPaginas - 1;

  contador.textContent = `${filtrados.length} servicio(s)`;
  actualizarPager(totalPaginas);

  if (filtrados.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <p>😕 No encontramos servicios con esa búsqueda.</p>
        <p>Prueba con otra palabra (ej. "pantalla", "batería", "televisor") o escríbenos por WhatsApp.</p>
      </div>`;
    return;
  }

  const visibles = filtrados.slice(pagina * porPagina, (pagina + 1) * porPagina);

  grid.innerHTML = visibles.map((s) => {
    const agregado = listaDiagnostico.some((i) => i.id === s.id);
    return `
      <article class="service-card" data-category="${s.categoria}">
        <div class="service-img">
          <img src="${s.imagen}" alt="${s.titulo}" loading="lazy"
               onerror="this.style.display='none'">
          <span class="service-badge">${NOMBRES_CATEGORIA[s.categoria]}</span>
        </div>
        <div class="service-body">
          <h3>${s.titulo}</h3>
          <p>${s.descripcion}</p>
          <div class="service-meta">💲 ${s.tarifa}</div>
          <button class="btn-add ${agregado ? "added" : ""}" data-id="${s.id}">
            ${agregado ? "✔ Agregado a mi lista" : "➕ Agregar a mi lista"}
          </button>
        </div>
      </article>`;
  }).join("");
}

/* Filtros por categoría (querySelectorAll + dataset + addEventListener) */
botonesFiltro.forEach((btn) => {
  btn.addEventListener("click", () => {
    botonesFiltro.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    categoriaActiva = btn.dataset.category;
    pagina = 0;
    renderServicios();
  });
});

/* Búsqueda en tiempo real */
buscador.addEventListener("input", () => {
  textoBusqueda = buscador.value;
  pagina = 0;
  renderServicios();
});

/* Agregar servicio (delegación de eventos sobre la grilla) */
grid.addEventListener("click", (e) => {
  const boton = e.target.closest(".btn-add");
  if (!boton) return;
  const id = Number(boton.dataset.id);
  const yaEsta = listaDiagnostico.find((i) => i.id === id);
  if (yaEsta) {
    // Si ya estaba, lo quitamos (comportamiento de interruptor)
    listaDiagnostico = listaDiagnostico.filter((i) => i.id !== id);
  } else {
    listaDiagnostico.push({ id, observacion: "" });
  }
  actualizarTodo();
});

/* ---------- 6. LISTA DE DIAGNÓSTICO (CARRITO) ---------- */
function renderLista() {
  fabCount.textContent = listaDiagnostico.length;

  if (listaDiagnostico.length === 0) {
    listaEl.innerHTML = `
      <div class="cart-empty">
        <p>Tu lista está vacía.</p>
        <p>Agrega uno o más servicios desde el catálogo 👆</p>
      </div>`;
    return;
  }

  const items = listaDiagnostico.map((item) => {
    const s = servicios.find((x) => x.id === item.id);
    return `
      <div class="cart-item" data-id="${s.id}">
        <div class="cart-item-head">
          <div>
            <strong>${s.titulo}</strong>
            <small>${s.tarifa}</small>
          </div>
          <button type="button" class="btn-remove" data-remove="${s.id}" aria-label="Quitar ${s.titulo}">✕</button>
        </div>
        <textarea rows="2" data-obs="${s.id}" placeholder="Observaciones de este equipo (ej. se mojó, pantalla trizada...)">${escaparHTML(item.observacion)}</textarea>
      </div>`;
  }).join("");

  listaEl.innerHTML = `
    ${items}
    <div class="cart-total"><span>Servicios seleccionados:</span><span>${listaDiagnostico.length}</span></div>
    <button type="button" class="btn-clear" id="btn-vaciar">Vaciar lista</button>`;
}

// Quitar ítem / vaciar (delegación)
listaEl.addEventListener("click", (e) => {
  const quitar = e.target.closest("[data-remove]");
  if (quitar) {
    const id = Number(quitar.dataset.remove);
    listaDiagnostico = listaDiagnostico.filter((i) => i.id !== id);
    actualizarTodo();
    return;
  }
  if (e.target.id === "btn-vaciar") {
    listaDiagnostico = [];
    actualizarTodo();
  }
});

// Guardar observaciones sin volver a renderizar (para no perder el foco)
listaEl.addEventListener("input", (e) => {
  if (e.target.dataset.obs) {
    const id = Number(e.target.dataset.obs);
    const item = listaDiagnostico.find((i) => i.id === id);
    if (item) item.observacion = e.target.value;
  }
});

/* Auto-completar el tipo de dispositivo según el primer servicio elegido */
function autocompletarDispositivo() {
  const select = document.getElementById("dispositivo");
  if (listaDiagnostico.length > 0 && select.value === "") {
    const primero = servicios.find((s) => s.id === listaDiagnostico[0].id);
    select.value = primero.dispositivo;
    validarCampo(select); // muestra el estado verde
  }
}

function actualizarTodo() {
  renderServicios();
  renderLista();
  autocompletarDispositivo();
}

/* ---------- 7. VALIDACIÓN DEL FORMULARIO ---------- */
const reglas = {
  nombre: (v) => {
    if (v.trim() === "") return "El nombre es obligatorio.";
    if (v.trim().length < 3) return "Escribe al menos 3 caracteres.";
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'.-]+$/.test(v.trim())) return "Usa solo letras y espacios.";
    return "";
  },
  telefono: (v) => {
    const limpio = v.replace(/[\s-]/g, "").replace(/^(\+?591)/, "");
    if (v.trim() === "") return "El celular es obligatorio.";
    if (!/^[67]\d{7}$/.test(limpio)) return "Celular boliviano inválido (8 dígitos, inicia con 6 o 7).";
    return "";
  },
  dispositivo: (v) => (v === "" ? "Selecciona el tipo de dispositivo." : ""),
  modelo: (v) => {
    if (v.trim() === "") return "Indica la marca y el modelo.";
    if (v.trim().length < 3) return "Escribe marca y modelo (ej. Samsung A54).";
    return "";
  },
  falla: (v) => {
    if (v.trim() === "") return "Describe la falla de tu equipo.";
    if (v.trim().length < 10) return "Da más detalle (mínimo 10 caracteres).";
    return "";
  }
};

const mensajesOk = {
  nombre: "✔ Nombre correcto",
  telefono: "✔ Número válido",
  dispositivo: "✔ Dispositivo seleccionado",
  modelo: "✔ Equipo registrado",
  falla: "✔ Descripción suficiente"
};

// Valida un campo y pinta el estado rojo/verde
function validarCampo(campo) {
  const nombre = campo.name;
  const error = reglas[nombre](campo.value);
  const contenedor = campo.closest(".field");
  const msg = document.getElementById(`msg-${nombre}`);

  contenedor.classList.remove("valid", "invalid");
  if (error) {
    contenedor.classList.add("invalid");
    msg.textContent = "✖ " + error;
    return false;
  }
  contenedor.classList.add("valid");
  msg.textContent = mensajesOk[nombre];
  return true;
}

const camposForm = form.querySelectorAll("input, select, textarea");

camposForm.forEach((campo) => {
  // blur: valida al salir del campo
  campo.addEventListener("blur", () => validarCampo(campo));
  // input: re-valida en vivo si ya se mostró un estado
  campo.addEventListener("input", () => {
    if (campo.closest(".field").classList.contains("invalid") ||
        campo.closest(".field").classList.contains("valid")) {
      validarCampo(campo);
    }
  });
  // change: necesario para el <select>
  campo.addEventListener("change", () => validarCampo(campo));
});

function mostrarAlerta(texto, tipo) {
  alertaForm.hidden = false;
  alertaForm.className = `alert ${tipo}`;
  alertaForm.textContent = texto;
}

/* ---------- 7b. ASISTENTE POR PASOS (evita el scroll) ---------- */
const pasos = document.querySelectorAll(".step");
const indicadorPaso = document.getElementById("paso-indicador");
const barras = document.querySelectorAll(".progress span");

function mostrarPaso(n) {
  pasoActual = n;
  pasos.forEach((p) => p.classList.toggle("active", Number(p.dataset.step) === n));
  form.hidden = n === 0; // el formulario solo aparece en los pasos 2 y 3
  indicadorPaso.textContent = `Paso ${n + 1} de 3`;
  barras.forEach((b, i) => b.classList.toggle("on", i <= n));
  alertaForm.hidden = true;
}

// Valida solo los campos del paso indicado
function validarPaso(n) {
  let ok = true;
  document.querySelectorAll(
    `.step[data-step="${n}"] input, .step[data-step="${n}"] select, .step[data-step="${n}"] textarea`
  ).forEach((c) => { if (!validarCampo(c)) ok = false; });
  return ok;
}

document.querySelectorAll("[data-next]").forEach((b) => {
  b.addEventListener("click", () => {
    if (pasoActual > 0 && !validarPaso(pasoActual)) return;
    mostrarPaso(Math.min(pasoActual + 1, 2));
  });
});
document.querySelectorAll("[data-prev]").forEach((b) => {
  b.addEventListener("click", () => mostrarPaso(Math.max(pasoActual - 1, 0)));
});

/* ---------- 8. ENVÍO A WHATSAPP ---------- */
function armarMensaje(datos) {
  let serviciosTxt = "Ninguno seleccionado (consulta general)";
  if (listaDiagnostico.length > 0) {
    serviciosTxt = listaDiagnostico.map((item, idx) => {
      const s = servicios.find((x) => x.id === item.id);
      const obs = item.observacion.trim() ? `\n   Obs: ${item.observacion.trim()}` : "";
      return `${idx + 1}. ${s.titulo}${obs}`;
    }).join("\n");
  }

  return [
    "🔧 *SOLICITUD DE DIAGNÓSTICO*",
    "_Electrónica GONZALES_",
    "",
    `👤 *Cliente:* ${datos.nombre.trim()}`,
    `📱 *Celular:* ${datos.telefono.trim()}`,
    "",
    "🧰 *Servicios seleccionados:*",
    serviciosTxt,
    "",
    `📦 *Tipo de dispositivo:* ${datos.dispositivo}`,
    `🏷️ *Marca/Modelo:* ${datos.modelo.trim()}`,
    `⚠️ *Falla:* ${datos.falla.trim()}`
  ].join("\n");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Si se presiona Enter antes del último paso, funciona como "Siguiente"
  if (pasoActual < 2) {
    if (validarPaso(pasoActual)) mostrarPaso(pasoActual + 1);
    return;
  }

  // Validar TODOS los campos antes de permitir el envío
  let todoOk = true;
  camposForm.forEach((campo) => {
    if (!validarCampo(campo)) todoOk = false;
  });

  if (!todoOk) {
    mostrarAlerta("❌ Revisa los campos marcados en rojo antes de enviar.", "error");
    const primerError = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
    if (primerError) {
      // Saltar al paso que contiene el error
      mostrarPaso(Number(primerError.closest(".step").dataset.step));
      mostrarAlerta("❌ Revisa los campos marcados en rojo antes de enviar.", "error");
      primerError.focus();
    }
    return;
  }

  if (NUMERO_WHATSAPP_TALLER.includes("X")) {
    mostrarAlerta("⚠️ Falta configurar el número de WhatsApp del taller en script.js (NUMERO_WHATSAPP_TALLER).", "error");
    return;
  }

  const datos = Object.fromEntries(new FormData(form).entries());
  const mensaje = encodeURIComponent(armarMensaje(datos));
  const url = `https://wa.me/${NUMERO_WHATSAPP_TALLER}?text=${mensaje}`;

  mostrarAlerta("✅ ¡Datos correctos! Abriendo WhatsApp para enviar tu solicitud...", "ok");
  window.open(url, "_blank", "noopener");
});

/* ---------- 9. INICIALIZACIÓN ---------- */
document.getElementById("anio").textContent = new Date().getFullYear();

// Botón de contacto rápido (tarjeta de ubicación)
const btnContacto = document.getElementById("btn-contacto");
btnContacto.href = `https://wa.me/${NUMERO_WHATSAPP_TALLER}?text=${encodeURIComponent("Hola, quisiera consultar sobre un servicio técnico en Electrónica GONZALES.")}`;

renderServicios();
renderLista();
mostrarPaso(0);

// Al girar o cambiar el tamaño de la pantalla, se recalculan las tarjetas por página
window.addEventListener("resize", renderServicios);
