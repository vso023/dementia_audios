// Construye el PDF del reporte escribiendo texto directamente con jsPDF
// (doc.text/splitTextToSize/addPage), sin capturar ningún elemento del DOM.
//
// Se abandonó el enfoque anterior (html2pdf.js, y después html2canvas-pro)
// porque capturar el DOM como imagen demostró ser poco confiable en el
// entorno real de despliegue — el PDF salía con páginas en blanco pese a
// haberse verificado en un navegador de prueba. Escribir el contenido a
// mano no depende de renderizar ni fotografiar nada, así que no puede salir
// vacío: si `analisis` trae los datos, el texto queda en el PDF.
const MARGEN = 15;
const COLOR_TEXTO = [32, 35, 58]; // --text-primary
const COLOR_TEXTO_SECUNDARIO = [104, 112, 134]; // --text-secondary
const COLOR_AVISO_TEXTO = [122, 82, 0]; // cercano a --warning (#a06a12), mas oscuro para contraste de lectura
const COLOR_AVISO_FONDO = [255, 248, 232]; // --warning-background
const COLOR_AVISO_BORDE = [240, 217, 153]; // --warning-border
const COLOR_LINEA = [223, 227, 237]; // --border

const UMBRAL_ALTA = 0.8;
const UMBRAL_MEDIA = 0.5;

// Mismos umbrales que ClasificacionCard en ReportView.jsx — deben coincidir
// para que el PDF diga la misma categoría de confianza que la pantalla.
function categorizarConfianza(confianza) {
  if (confianza > UMBRAL_ALTA) return "Alta";
  if (confianza >= UMBRAL_MEDIA) return "Media";
  return "Baja";
}

function formatearFecha(iso) {
  if (!iso) return null;
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return null;
  return fecha.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "reporte_juan_perez_2026-09-03.pdf" — sin tildes ni espacios, para que el
// nombre de archivo sea predecible en cualquier sistema operativo.
function normalizarParaArchivo(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

export function construirNombreArchivo(paciente, analisis) {
  const nombrePaciente = paciente?.nombre ? normalizarParaArchivo(paciente.nombre) : "paciente";
  const fechaBase = analisis?.fecha ? new Date(analisis.fecha) : new Date();
  const fechaIso = Number.isNaN(fechaBase.getTime())
    ? new Date().toISOString().slice(0, 10)
    : fechaBase.toISOString().slice(0, 10);
  return `reporte_${nombrePaciente}_${fechaIso}.pdf`;
}

function anchoUtilDe(doc) {
  return doc.internal.pageSize.getWidth() - MARGEN * 2;
}

// Agrega una pagina nueva y resetea el cursor si lo que sigue no cabe en lo
// que queda de la pagina actual — es el mecanismo de salto de pagina
// automatico que usan todas las funciones de escritura de abajo.
function nuevaPaginaSiHaceFalta(doc, y, alturaNecesaria) {
  const altoPagina = doc.internal.pageSize.getHeight();
  if (y + alturaNecesaria > altoPagina - MARGEN) {
    doc.addPage();
    return MARGEN;
  }
  return y;
}

function escribirTitulo(doc, texto, y) {
  doc.setFont(undefined, "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLOR_TEXTO);
  const lineas = doc.splitTextToSize(texto, anchoUtilDe(doc));
  for (const linea of lineas) {
    y = nuevaPaginaSiHaceFalta(doc, y, 7);
    doc.text(linea, MARGEN, y);
    y += 7;
  }
  return y;
}

function escribirTituloSeccion(doc, texto, y) {
  y = nuevaPaginaSiHaceFalta(doc, y, 10);
  y += 3;
  doc.setFont(undefined, "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_TEXTO);
  doc.text(texto, MARGEN, y);
  doc.setDrawColor(...COLOR_LINEA);
  doc.setLineWidth(0.2);
  doc.line(MARGEN, y + 1.5, MARGEN + anchoUtilDe(doc), y + 1.5);
  return y + 7;
}

function escribirParrafo(doc, texto, y, opciones = {}) {
  const { tamanoFuente = 10, color = COLOR_TEXTO, interlineado = 5, negrita = false } = opciones;
  doc.setFont(undefined, negrita ? "bold" : "normal");
  doc.setFontSize(tamanoFuente);
  doc.setTextColor(...color);
  const lineas = doc.splitTextToSize(String(texto ?? "—"), anchoUtilDe(doc));
  for (const linea of lineas) {
    y = nuevaPaginaSiHaceFalta(doc, y, interlineado);
    doc.text(linea, MARGEN, y);
    y += interlineado;
  }
  return y;
}

// Recuadro destacado para el aviso: siempre en la parte de arriba del
// documento, con fondo/borde de advertencia (mismos tonos que
// --warning-background/--warning-border en app.css).
function escribirAvisoDestacado(doc, texto, y) {
  const ancho = anchoUtilDe(doc);
  const padding = 4;
  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  const lineas = doc.splitTextToSize(texto, ancho - padding * 2);
  const interlineado = 5;
  const alturaCaja = lineas.length * interlineado + padding * 2;
  y = nuevaPaginaSiHaceFalta(doc, y, alturaCaja);
  doc.setFillColor(...COLOR_AVISO_FONDO);
  doc.setDrawColor(...COLOR_AVISO_BORDE);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGEN, y, ancho, alturaCaja, 2, 2, "FD");
  doc.setTextColor(...COLOR_AVISO_TEXTO);
  let yTexto = y + padding + 3;
  for (const linea of lineas) {
    doc.text(linea, MARGEN + padding, yTexto);
    yTexto += interlineado;
  }
  return y + alturaCaja + 8;
}

// Arma el documento completo, en el orden pedido: aviso arriba, datos del
// paciente, fecha del analisis, clasificacion + confianza, probabilidades,
// reporte redactado, transcripcion, aviso repetido al pie.
export function construirReportePdf(doc, analisis, paciente) {
  const etiquetaConfianza = categorizarConfianza(analisis.confianza);
  const fecha = formatearFecha(analisis.fecha) || formatearFecha(new Date().toISOString());

  let y = MARGEN;
  y = escribirTitulo(doc, "Reporte de análisis — Herramienta de apoyo a detección de deterioro cognitivo", y);
  y += 2;

  y = escribirAvisoDestacado(
    doc,
    "Aviso: este resultado es un insumo de apoyo y no constituye un diagnóstico. Los " +
      "resultados deben ser interpretados por un profesional de la salud calificado.",
    y
  );

  if (paciente) {
    y = escribirTituloSeccion(doc, "Datos del paciente", y);
    y = escribirParrafo(doc, `Nombre: ${paciente.nombre}`, y);
    if (paciente.fecha_nacimiento) {
      y = escribirParrafo(doc, `Fecha de nacimiento: ${paciente.fecha_nacimiento}`, y);
    }
    if (paciente.sexo) {
      y = escribirParrafo(doc, `Sexo: ${paciente.sexo}`, y);
    }
    y += 3;
  }

  y = escribirTituloSeccion(doc, "Fecha del análisis", y);
  y = escribirParrafo(doc, fecha, y);
  y += 3;

  y = escribirTituloSeccion(doc, "Clasificación", y);
  y = escribirParrafo(doc, `Resultado: ${analisis.clasificacion}`, y, { negrita: true });
  y = escribirParrafo(doc, `Categoría de confianza: ${etiquetaConfianza}`, y, { negrita: true });
  y += 3;

  if (analisis.probabilidades) {
    y = escribirTituloSeccion(doc, "Probabilidades por clase", y);
    for (const [clase, p] of Object.entries(analisis.probabilidades)) {
      y = escribirParrafo(doc, `${clase}: ${(p * 100).toFixed(0)}%`, y);
    }
    y += 3;
  }

  y = escribirTituloSeccion(doc, "Reporte", y);
  y = escribirParrafo(doc, analisis.reporte?.contenido, y);
  y += 3;

  y = escribirTituloSeccion(doc, "Transcripción del audio analizado", y);
  y = escribirParrafo(
    doc,
    "Texto obtenido automáticamente del audio (Whisper), usado como una de las dos entradas del clasificador.",
    y,
    { tamanoFuente: 8.5, color: COLOR_TEXTO_SECUNDARIO }
  );
  y += 1;
  y = escribirParrafo(doc, analisis.transcripcion, y);
  y += 6;

  y = nuevaPaginaSiHaceFalta(doc, y, 14);
  doc.setDrawColor(...COLOR_LINEA);
  doc.setLineWidth(0.2);
  doc.line(MARGEN, y, MARGEN + anchoUtilDe(doc), y);
  y += 5;
  escribirParrafo(
    doc,
    "Este resultado es un insumo de apoyo y no constituye un diagnóstico. Documento generado " +
      "automáticamente por la Herramienta de apoyo a detección de deterioro cognitivo; no " +
      "sustituye una evaluación clínica.",
    y,
    { tamanoFuente: 8, color: COLOR_TEXTO_SECUNDARIO }
  );
}
