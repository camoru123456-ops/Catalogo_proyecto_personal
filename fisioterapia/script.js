const NUMERO_WHATSAPP_CONSULTORIO = "591XXXXXXXX"; // Reemplazar con el número corporativo de Fisioterapia LUIGI

/* =========================================================
   Fisioterapia y Kinesiología LUIGI — script.js
   JavaScript Vanilla · manipulación del DOM
   ========================================================= */

/* ---------- 1. Catálogo de tratamientos ---------- */
// "claves" amplía la búsqueda por síntomas (ej. "espalda" encuentra dolor lumbar).
const SERVICIOS = [
  {
    id: "evaluacion",
    titulo: "Evaluación Kinésica Integral",
    descripcion: "Valoración postural, muscular y articular inicial para diseñar un plan de recuperación personalizado.",
    duracion: "60 min",
    tarifa: 80,
    icono: "🩺",
    categoria: "rehabilitacion",
    claves: "valoracion diagnostico postura evaluacion plan primera consulta"
  },
  {
    id: "rehabilitacion",
    titulo: "Rehabilitación Física y Postoperatoria",
    descripcion: "Recuperación funcional tras fracturas, esguinces, cirugías traumatológicas e inmovilización prolongada.",
    duracion: "45 min",
    tarifa: 100,
    icono: "🦴",
    categoria: "rehabilitacion",
    claves: "fractura esguince cirugia operacion yeso rodilla hombro tobillo recuperacion"
  },
  {
    id: "deportiva",
    titulo: "Fisioterapia Deportiva",
    descripcion: "Tratamiento de desgarros, tendinitis, sobrecargas musculares y readaptación física para deportistas.",
    duracion: "45 min",
    tarifa: 120,
    icono: "🏃",
    categoria: "deportiva",
    claves: "deporte desgarro tendinitis sobrecarga lesion futbol correr atleta muscular"
  },
  {
    id: "dolor-lumbar-cervical",
    titulo: "Terapia para Dolor Lumbar y Cervical",
    descripcion: "Alivio de lumbalgias, ciática, cervicalgia y contracturas por estrés o mala postura mediante electroterapia y ejercicios.",
    duracion: "45 min",
    tarifa: 90,
    icono: "⚡",
    categoria: "dolor",
    claves: "espalda cuello lumbalgia ciatica cervicalgia contractura estres postura electroterapia columna"
  },
  {
    id: "neurologica",
    titulo: "Rehabilitación Neurológica",
    descripcion: "Terapia especializada para mejorar movilidad, equilibrio y coordinación en pacientes con afecciones neuromotoras.",
    duracion: "60 min",
    tarifa: 130,
    icono: "🧠",
    categoria: "neurologica",
    claves: "neuromotor equilibrio coordinacion movilidad parálisis derrame acv parkinson"
  },
  {
    id: "masoterapia",
    titulo: "Masoterapia Descontracturante",
    descripcion: "Masaje terapéutico profundo para liberar tensión muscular acumulada y mejorar la circulación.",
    duracion: "40 min",
    tarifa: 80,
    icono: "💆",
    categoria: "dolor",
    claves: "masaje descontracturante tension muscular circulacion relajacion espalda"
  }
];

// Etiquetas legibles de cada categoría (data-category)
const ETIQUETAS_CATEGORIA = {
  rehabilitacion: "Rehabilitación",
  deportiva: "Deportiva",
  dolor: "Dolor muscular/articular",
  neurologica: "Neurológica"
};

/* ---------- 2. Referencias al DOM y estado ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const listaEl = $("#listaTratamientos");
const contadorEl = $("#contador");
const buscadorEl = $("#buscador");
const resumenEl = $("#resumen");
const formEl = $("#formCita");
const estadoFormEl = $("#estadoForm");
const selectTratamiento = $("#tratamiento");
const menuEl = $("#menu");
const menuToggleEl = $("#menuToggle");

const estado = {
  categoria: "todas",
  busqueda: "",
  seleccionado: null // id del servicio elegido
};

const esMovil = () => window.matchMedia("(max-width: 899px)").matches;
const formatearBs = (n) => `Bs. ${n}`;

// Quita tildes y mayúsculas para buscar sin importar la escritura
const normalizar = (texto) =>
  texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

/* ---------- 3. Catálogo: render, filtros y búsqueda ---------- */
function filtrarServicios() {
  const terminos = normalizar(estado.busqueda).split(/\s+/).filter(Boolean);

  return SERVICIOS.filter((s) => {
    const coincideCategoria = estado.categoria === "todas" || s.categoria === estado.categoria;
    const pajar = normalizar(
      `${s.titulo} ${s.descripcion} ${s.claves} ${ETIQUETAS_CATEGORIA[s.categoria]}`
    );
    // Todos los términos escritos deben aparecer en el texto del servicio
    const coincideBusqueda = terminos.every((t) => pajar.includes(t));
    return coincideCategoria && coincideBusqueda;
  });
}

function renderCatalogo() {
  const visibles = filtrarServicios();

  if (visibles.length === 0) {
    listaEl.innerHTML = `<p class="vacio">No encontramos tratamientos con ese criterio. Prueba con otra palabra o elige «Todas».</p>`;
  } else {
    listaEl.innerHTML = visibles
      .map(
        (s) => `
      <article class="card ${s.id === estado.seleccionado ? "is-selected" : ""}"
               tabindex="0" data-id="${s.id}" data-category="${s.categoria}"
               aria-labelledby="titulo-${s.id}">
        <div class="card-head">
          <span class="card-icon" aria-hidden="true">${s.icono}</span>
          <span class="badge">${ETIQUETAS_CATEGORIA[s.categoria]}</span>
        </div>
        <h3 id="titulo-${s.id}">${s.titulo}</h3>
        <p class="card-desc">${s.descripcion}</p>
        <div class="card-meta">
          <span><span aria-hidden="true">⏱</span> ${s.duracion}</span>
          <strong>${formatearBs(s.tarifa)}</strong>
        </div>
        <button type="button" class="btn btn-primary" data-action="agendar" data-id="${s.id}">Agendar Sesión</button>
      </article>`
      )
      .join("");
  }

  contadorEl.textContent = `Mostrando ${visibles.length} de ${SERVICIOS.length} tratamientos`;
}

// Delegación de eventos: un solo listener para todos los botones "Agendar Sesión"
listaEl.addEventListener("click", (e) => {
  const boton = e.target.closest('[data-action="agendar"]');
  if (boton) seleccionarServicio(boton.dataset.id, { irAlFormulario: true });
});

// Botones de filtro por categoría (querySelectorAll + dataset + addEventListener)
$$(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    estado.categoria = chip.dataset.filter;
    $$(".chip").forEach((c) => {
      const activo = c === chip;
      c.classList.toggle("is-active", activo);
      c.setAttribute("aria-pressed", String(activo));
    });
    renderCatalogo();
  });
});

// Búsqueda en tiempo real
buscadorEl.addEventListener("input", () => {
  estado.busqueda = buscadorEl.value;
  renderCatalogo();
});

/* ---------- 4. Selección de sesión y resumen dinámico ---------- */
function poblarSelect() {
  selectTratamiento.innerHTML =
    `<option value="">Selecciona un tratamiento…</option>` +
    SERVICIOS.map((s) => `<option value="${s.id}">${s.titulo}</option>`).join("");
}

function renderResumen() {
  const s = SERVICIOS.find((x) => x.id === estado.seleccionado);

  if (!s) {
    resumenEl.innerHTML = `<p class="resumen-vacio">Elige un tratamiento del catálogo o selecciónalo en el formulario.</p>`;
    return;
  }

  resumenEl.innerHTML = `
    <div class="resumen-icono" aria-hidden="true">${s.icono}</div>
    <div class="resumen-datos">
      <p class="resumen-etiqueta">Tratamiento elegido</p>
      <p class="resumen-titulo">${s.titulo}</p>
      <p class="resumen-meta"><span aria-hidden="true">⏱</span> ${s.duracion} ·
        <strong>${formatearBs(s.tarifa)}</strong> (tarifa referencial)</p>
    </div>`;
}

function seleccionarServicio(id, { irAlFormulario = false } = {}) {
  estado.seleccionado = id || null;

  selectTratamiento.value = id || "";   // sincroniza el <select>
  renderResumen();                      // actualiza el panel lateral (innerHTML)

  // Resalta la tarjeta elegida sin volver a dibujar todo
  $$(".card", listaEl).forEach((c) => c.classList.toggle("is-selected", c.dataset.id === id));

  // Revalida el campo si ya fue tocado
  const wrap = $('[data-field="tratamiento"]');
  if (wrap.classList.contains("is-invalid") || wrap.classList.contains("is-valid") || id) {
    validarCampo("tratamiento");
  }

  if (irAlFormulario) {
    if (esMovil()) setVista("reserva");
    $("#nombre").focus({ preventScroll: true });
  }
}

selectTratamiento.addEventListener("change", () => {
  seleccionarServicio(selectTratamiento.value);
});

/* ---------- 5. Vistas (pestañas) y menú hamburguesa ---------- */
function setVista(nombre) {
  $$(".vista").forEach((v) => v.classList.toggle("is-active", v.id === `vista-${nombre}`));
  $$(".tab").forEach((t) => {
    const activa = t.dataset.vista === nombre;
    t.classList.toggle("is-active", activa);
    t.setAttribute("aria-selected", String(activa));
    t.tabIndex = activa ? 0 : -1;
  });
}

// Pestañas y enlaces del menú comparten el atributo data-vista
$$("[data-vista]").forEach((el) => {
  el.addEventListener("click", () => {
    setVista(el.dataset.vista);
    cerrarMenu();
  });
});

function cerrarMenu() {
  menuEl.classList.remove("is-open");
  menuToggleEl.setAttribute("aria-expanded", "false");
  menuToggleEl.setAttribute("aria-label", "Abrir menú");
}

menuToggleEl.addEventListener("click", () => {
  const abierto = menuEl.classList.toggle("is-open");
  menuToggleEl.setAttribute("aria-expanded", String(abierto));
  menuToggleEl.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
});

// Cierra el menú con Escape, al tocar fuera o al pasar a escritorio
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarMenu();
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".header")) cerrarMenu();
});
window.matchMedia("(min-width: 900px)").addEventListener("change", cerrarMenu);

/* ---------- 6. Navegación con flechas del teclado ---------- */
// Mueve el foco entre elementos "selector" dentro de un contenedor con ←/→.
function navegarConFlechas(contenedor, selector, alActivar) {
  contenedor.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    if (e.target.matches("input, textarea, select")) return; // no interferir al escribir

    const items = $$(selector, contenedor).filter((el) => el.offsetParent !== null);
    const actual = items.indexOf(e.target.closest(selector));
    if (actual === -1) return;

    e.preventDefault();
    const paso = e.key === "ArrowRight" ? 1 : -1;
    const siguiente = items[(actual + paso + items.length) % items.length];
    siguiente.focus();
    if (alActivar) alActivar(siguiente);
  });
}

navegarConFlechas($(".tabs"), ".tab", (tab) => setVista(tab.dataset.vista)); // pestañas
navegarConFlechas($(".chips"), ".chip");                                      // filtros
navegarConFlechas(listaEl, ".card");                                          // tarjetas

/* ---------- 7. Validación del formulario ---------- */
const normalizarCelular = (v) => v.replace(/[\s()-]/g, "").replace(/^\+?591/, "");

// Convierte "YYYY-MM-DD" a Date local (evita desfases de zona horaria)
function fechaLocal(valor) {
  const [y, m, d] = valor.split("-").map(Number);
  return new Date(y, m - 1, d);
}
const aISOLocal = (f) =>
  `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;

// Cada regla devuelve un mensaje de error o "" si el dato es válido
const reglas = {
  nombre(v) {
    if (!v) return "Ingresa el nombre del paciente.";
    if (!/^[\p{L}][\p{L}\s.'-]{2,59}$/u.test(v)) return "Usa solo letras (mínimo 3 caracteres).";
    return "";
  },
  celular(v) {
    if (!v) return "Ingresa tu número de celular.";
    if (!/^[67]\d{7}$/.test(normalizarCelular(v))) return "Debe tener 8 dígitos y empezar con 6 o 7.";
    return "";
  },
  tratamiento(v) {
    return v ? "" : "Selecciona un tratamiento.";
  },
  turno(v) {
    return v ? "" : "Elige un turno.";
  },
  fecha(v) {
    if (!v) return "Elige una fecha.";
    const fecha = fechaLocal(v);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (isNaN(fecha)) return "Fecha no válida.";
    if (fecha < hoy) return "La fecha no puede ser pasada.";
    if (fecha.getDay() === 0) return "No atendemos los domingos (Lun - Sáb).";
    return "";
  },
  motivo(v) {
    if (!v) return "Describe brevemente tu molestia.";
    if (v.length < 5) return "Escribe al menos 5 caracteres.";
    return "";
  }
};

function validarCampo(nombre) {
  const wrap = $(`[data-field="${nombre}"]`);
  const control = $("input, select, textarea", wrap);
  const msg = $(".msg", wrap);
  const error = reglas[nombre](control.value.trim());

  wrap.classList.toggle("is-invalid", Boolean(error)); // rojo
  wrap.classList.toggle("is-valid", !error);           // verde
  control.setAttribute("aria-invalid", String(Boolean(error)));
  msg.textContent = error ? `⚠ ${error}` : "✓ Dato válido";
  return !error;
}

// Eventos blur / input / change por campo
Object.keys(reglas).forEach((nombre) => {
  const wrap = $(`[data-field="${nombre}"]`);
  const control = $("input, select, textarea", wrap);
  let tocado = false;

  control.addEventListener("blur", () => {
    tocado = true;
    validarCampo(nombre);
  });
  ["input", "change"].forEach((ev) =>
    control.addEventListener(ev, () => {
      if (tocado || wrap.classList.contains("is-invalid")) validarCampo(nombre);
    })
  );
});

function mostrarEstado(tipo, html) {
  estadoFormEl.className = `status ${tipo === "ok" ? "is-ok" : "is-error"}`;
  estadoFormEl.innerHTML = html;
}

/* ---------- 8. Envío del formulario → WhatsApp ---------- */
formEl.addEventListener("submit", (e) => {
  e.preventDefault();

  // Valida todos los campos (sin cortar en el primero para pintar todos los estados)
  const resultados = Object.keys(reglas).map((n) => [n, validarCampo(n)]);
  const primerError = resultados.find(([, ok]) => !ok);

  if (primerError) {
    mostrarEstado("error", "Revisa los campos marcados en rojo antes de enviar.");
    $(`[data-field="${primerError[0]}"] input, [data-field="${primerError[0]}"] select, [data-field="${primerError[0]}"] textarea`).focus();
    return;
  }

  const servicio = SERVICIOS.find((s) => s.id === selectTratamiento.value);
  const fechaTxt = fechaLocal($("#fecha").value).toLocaleDateString("es-BO", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  const mensaje = [
    "*Solicitud de cita - Fisioterapia y Kinesiología LUIGI*",
    "",
    `👤 *Paciente:* ${$("#nombre").value.trim()}`,
    `📱 *Celular:* ${normalizarCelular($("#celular").value)}`,
    `🩺 *Terapia:* ${servicio.titulo} (${formatearBs(servicio.tarifa)} ref., ${servicio.duracion})`,
    `📅 *Fecha preferida:* ${fechaTxt}`,
    `🕒 *Turno:* ${$("#turno").value}`,
    `📝 *Motivo:* ${$("#motivo").value.trim()}`
  ].join("\n");

  const url = `https://wa.me/${NUMERO_WHATSAPP_CONSULTORIO}?text=${encodeURIComponent(mensaje)}`;

  if (/X/i.test(NUMERO_WHATSAPP_CONSULTORIO)) {
    console.warn("Configura NUMERO_WHATSAPP_CONSULTORIO en la primera línea de script.js.");
  }

  const ventana = window.open(url, "_blank", "noopener");
  mostrarEstado(
    "ok",
    ventana
      ? "✓ Datos validados. Abriendo WhatsApp para enviar tu solicitud…"
      : `✓ Datos validados. <a href="${url}" target="_blank" rel="noopener">Toca aquí para abrir WhatsApp</a>.`
  );
});

/* ---------- 9. Inicialización ---------- */
function iniciar() {
  // Fecha mínima = hoy, máxima = +90 días
  const hoy = new Date();
  const max = new Date();
  max.setDate(hoy.getDate() + 90);
  $("#fecha").min = aISOLocal(hoy);
  $("#fecha").max = aISOLocal(max);

  // Enlace directo de WhatsApp en la cabecera
  $("#enlaceWhatsapp").href = `https://wa.me/${NUMERO_WHATSAPP_CONSULTORIO}`;

  poblarSelect();
  renderCatalogo();
  renderResumen();
}

iniciar();
