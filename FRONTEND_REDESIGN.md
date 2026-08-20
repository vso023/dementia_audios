# Frontend Redesign

## 1. Resumen

Objetivo: transformar la interfaz básica existente (React + Vite, sin sistema
de estilos, todo con `style={{}}` inline) en una interfaz clínica moderna,
elegante y profesional, enfocada únicamente en los pasos **Paciente** y
**Audio** — sin ocultar ni alterar la lógica de negocio, los endpoints, los
payloads ni el comportamiento funcional existente.

Resultado final: se creó un sistema de diseño en CSS plano (tokens +
estilos globales, cero dependencias nuevas), se separó la interfaz en
componentes visuales reutilizables, se agregó un encabezado con icono e
identidad visual, un stepper de 2 pasos, tarjetas para paciente y audio con
iconografía SVG propia, soporte de arrastrar-y-soltar para el audio,
previsualización de archivo/reproductor, y estados de carga/error/éxito
claros. La sección "Profesional" dejó de ser visible, pero su lógica interna
sigue intacta en el código porque el sistema la necesita (`profesional_id`
es obligatorio en el payload de creación de paciente).

## 2. Archivos modificados

- `frontend/src/main.jsx`: se agregó el import de `./styles/app.css` (única línea nueva).
- `frontend/src/App.jsx`: reorganización completa del árbol visual — header, disclaimer, stepper de 2 pasos, layout de 2 columnas (paciente/audio) en escritorio. Se dejó de renderizar `<ProfesionalSetup />`. Todos los estados (`profesionales`, `profesionalId`, `pacientes`, `pacienteId`, `estado`, `analisis`) y funciones (`recargarProfesionales`, `recargarPacientes`, `manejarProfesionalCreado`, `manejarPacienteCreado`, `manejarAudioListo`) se conservaron con el mismo nombre y comportamiento. Único estado nuevo: `archivoSeleccionado`, puramente informativo (ver sección 8).
- `frontend/src/components/AudioInput.jsx`: mismo `onChange` de `<input type="file">` y misma lógica de `MediaRecorder` (`iniciarGrabacion`/`detenerGrabacion`). Se unificó la entrada de archivo en una sola función interna (`manejarArchivo`) para que el drag-and-drop use exactamente el mismo camino que el input de archivo. Rediseño visual completo como zona de carga ("dropzone").
- `frontend/src/components/CrearPacienteForm.jsx`: mismos campos (`nombre`, `fechaNacimiento`, `sexo`), mismo handler `manejarCrear`, misma llamada a `crearPaciente({ profesionalId, nombre, fechaNacimiento, sexo })`, misma validación (`if (!profesionalId)`). Nueva presentación con `FormField`. Único cambio de contenido: el texto del mensaje de error para ese caso borde ya no menciona la palabra "profesional" (ver sección 4).
- `frontend/src/components/ReportView.jsx`: mismos datos leídos de `analisis` (`clasificacion_texto`, `confianza_texto`, `clasificacion_audio`, `confianza_audio`, `reporte.contenido`, `transcripcion`). Nueva presentación con tarjetas, badges y tipografía del sistema de diseño.
- `frontend/src/components/ProcessingStatus.jsx`: misma lógica de 3 estados (`idle`/`procesando`/`error`), nueva presentación con icono y color por estado.
- `frontend/src/components/DisclaimerBanner.jsx`: mismo texto exacto del aviso, nueva presentación con icono.
- `frontend/.gitignore`: sin cambios (ya cubría `dist/`).

## 3. Archivos nuevos

- `frontend/src/styles/tokens.css`: variables CSS (color, tipografía, espaciado, radios, sombras, transiciones, breakpoints de referencia). Única fuente de verdad visual del proyecto.
- `frontend/src/styles/app.css`: estilos globales, reset, layout, componentes de UI (botones, tarjetas, formularios, stepper, badges, dropzone, reporte), media queries responsive y reglas de accesibilidad (`:focus-visible`, `prefers-reduced-motion`).
- `frontend/src/components/icons.jsx`: 16 iconos SVG accesibles hechos a mano (cerebro/ondas, escudo, usuario, calendario, género, micrófono, subir archivo, archivo de audio, check, alerta, cerrar, más, chevron, detener, reproducir). No se agregó ninguna librería de iconos (ver sección 9).
- `frontend/src/components/AppHeader.jsx`: encabezado con icono, título, subtítulo y onda decorativa.
- `frontend/src/components/ProcessStepper.jsx`: stepper de 2 pasos ("Paciente", "Audio"). El estado de cada paso se deriva de props ya existentes (`pacienteSeleccionado`, `analisisListo`) — no contiene lógica de negocio nueva.
- `frontend/src/components/SectionCard.jsx`: tarjeta contenedora reutilizable (icono + título + subtítulo + children), usada por paciente y audio.
- `frontend/src/components/FormField.jsx`: envoltorio de label + input/select con icono opcional y mensaje de error, usado por `CrearPacienteForm`.
- `frontend/src/components/PatientSection.jsx`: compone el selector de paciente existente + `CrearPacienteForm` + `PatientSummary` dentro de una `SectionCard`.
- `frontend/src/components/PatientSummary.jsx`: resumen visual del paciente seleccionado (iniciales, nombre, fecha de nacimiento, edad calculada solo para mostrar, sexo) — todo a partir de datos reales ya presentes en el objeto `paciente`, nada inventado.
- `frontend/src/components/AudioUploadSection.jsx`: envuelve `AudioInput` en una `SectionCard` y muestra `AudioFileSummary` debajo.
- `frontend/src/components/AudioFileSummary.jsx`: muestra nombre, tipo y tamaño reales del archivo (`File.name`, `File.type`, `File.size`) y un reproductor `<audio>` de previsualización generado con `URL.createObjectURL`.
- `frontend/src/components/StatusBadge.jsx`: badge de estado reutilizable (usado en `ReportView` para "Señal principal" / "Experimental").
- `webapp/FRONTEND_REDESIGN.md`: este documento.

## 4. Componentes eliminados u ocultos de la interfaz

**No se eliminó ningún archivo ni componente.** `ProfesionalSetup.jsx` sigue existiendo, sin modificaciones, en `frontend/src/components/ProfesionalSetup.jsx`.

Lo que cambió es que `App.jsx` dejó de importar y renderizar `<ProfesionalSetup />` en el JSX visible. Concretamente:

- Se quitó el `<h3>1. Profesional</h3>` y el bloque `<ProfesionalSetup ... />` del árbol renderizado.
- El stepper nuevo solo tiene 2 pasos ("Paciente", "Audio"); no existe ningún paso "Profesional".
- Verifiqué con `grep` sobre todos los archivos `.jsx` tocados que la palabra "Profesional"/"profesional" solo aparece en nombres de variables, props, comentarios y llamadas a funciones — nunca en un nodo de texto JSX ni en un atributo visible (`placeholder`, `aria-label`, etc.). Comando y resultado documentados en la sección 10.

**Lógica interna conservada y por qué:**

- `profesionales` (estado), `profesionalId` (estado), `recargarProfesionales()`, `manejarProfesionalCreado()`: se mantienen en `App.jsx` sin cambios de comportamiento. Son necesarios porque `crearPaciente()` exige `profesional_id` en el payload — sin ese id, no se puede crear un paciente, sin importar que la UI no lo muestre.
- El `useEffect` inicial sigue llamando a `recargarProfesionales()` igual que antes, para que `profesionalId` quede poblado automáticamente con el primer profesional existente en la base de datos (mismo comportamiento previo, solo que ahora invisible).
- `manejarProfesionalCreado` queda definida pero, al no renderizarse ningún formulario que la invoque, no se ejecuta en la interacción normal. No se borró porque la consigna pide conservar la lógica si el sistema la necesita, y removerla habría sido una eliminación de funcionalidad no solicitada.
- Caso borde documentado: si la base de datos no tiene ningún profesional, `profesionalId` queda vacío y `crearPaciente()` sigue bloqueado por la misma validación `if (!profesionalId)` de siempre. Como la palabra "profesional" no puede aparecer, cambié únicamente el *texto* mostrado en ese mensaje de error (de "Selecciona o crea un profesional primero" a "No se pudo completar la configuración inicial. Contacta al administrador"). La condición, el estado y el flujo de control son exactamente los mismos.

## 5. Mejoras visuales

- **Paleta**: tomé como base la paleta de referencia que diste (`--background`, `--surface`, `--primary`, `--purple`, `--lavender`, etc.) en `tokens.css`, agregando algunas variantes (`--primary-soft`, `--turquoise`, `--success-soft`, `--error-soft`) para tener suficientes estados sin recurrir a colores fuera de la paleta.
- **Tipografía**: `--font-sans: "Manrope", "Plus Jakarta Sans", ui-sans-serif, system-ui, ...` — sin agregar una fuente externa (ni `<link>` a Google Fonts ni archivos de fuente empaquetados), tal como permitiste explícitamente. Si el sistema del usuario tiene Manrope instalada, se usa; si no, cae a fuentes del sistema modernas.
- **Tarjetas**: `SectionCard` con icono, título, subtítulo, borde suave (`--border`), sombra sutil (`--shadow-sm`) que se intensifica levemente en hover (`--shadow-md`), radio grande (`--radius-lg`).
- **Formularios**: `FormField` con label siempre visible (nunca reemplazado por placeholder), icono opcional, estado de foco visible (`box-shadow` con `--shadow-focus`), mensajes de error con icono y `role="alert"`.
- **Botones**: jerarquía de 3 niveles (`.btn--primary` con degradado azul-morado, `.btn--secondary` blanco con borde, `.btn--destructive` rojo suave solo donde ya existía una acción destructiva — detener grabación). Estados hover/active/disabled/loading (spinner) implementados en CSS.
- **Iconos**: 16 SVG propios, lineales, trazo consistente, `aria-hidden` porque siempre acompañan texto.
- **Stepper**: 2 pasos con círculo numerado que cambia a check al completarse, conector animado.
- **Sección de paciente**: selector + formulario + resumen compacto del paciente seleccionado (avatar con iniciales, datos reales).
- **Sección de audio**: zona de arrastrar-y-soltar con icono, texto, "ondas" decorativas (explícitamente decorativas, no representan el audio real), resumen del archivo con reproductor de previsualización.
- **Estados de carga/error/éxito**: `ProcessingStatus` con spinner y colores por estado; `ReportView` con banner de éxito al completar.
- **Interacciones**: transiciones de 150–250ms en hover/focus/bordes, sin rebotes ni animaciones continuas; única animación en loop es el spinner de carga y el punto pulsante de "grabando", ambas ligadas a un estado real de la aplicación (no decorativas porque sí).

## 6. Mejoras responsive

- **Escritorio (≥1024px)**: layout de 2 columnas (`.app-columns`) — paciente a la izquierda, audio a la derecha.
- **Tablet/móvil (<1024px)**: las columnas se apilan verticalmente (paciente primero, audio después), ocupando el 100% del ancho disponible.
- **≥768px**: aparece la onda decorativa del header (oculta en pantallas más chicas para no saturar).
- **≥640px**: las tarjetas de clasificación del reporte pasan de 1 a 2 columnas.
- **≥480px**: los campos "Nombre" y "Fecha de nacimiento" del formulario de paciente pasan de apilados a 2 columnas.
- **<480px**: las etiquetas de texto del stepper se ocultan (quedan solo los círculos numerados/check) para que quepa sin scroll horizontal.
- `html, body, #root { max-width: 100%; overflow-x: hidden; }` en `app.css` como garantía adicional contra scroll horizontal en cualquier breakpoint.
- Todos los botones tienen `min-height: 44px` (área táctil cómoda en móvil).

## 7. Mejoras de accesibilidad

- **Labels**: `FormField` asocia cada input/select con su label vía `htmlFor`/`id` generado automáticamente si no se pasa uno explícito.
- **Navegación por teclado**: no se removió ni reemplazó ningún elemento nativo (`<input>`, `<select>`, `<button>`) por un `<div>` con manejadores de click — se conserva el orden de tabulación natural del DOM.
- **Foco visible**: regla global `:focus-visible { box-shadow: var(--shadow-focus); }` en `app.css`, aplicada a todos los controles interactivos.
- **Contraste**: los pares de color texto/fondo de la paleta (`--text-primary` sobre `--surface`/`--background`, `--text-on-primary` sobre `--primary`) fueron elegidos para buen contraste; no verifiqué contraste con una herramienta automatizada (ver sección 12).
- **ARIA**: `role="alert"` en mensajes de error, `role="status"` en el estado de "procesando", `role="note"` en el disclaimer, `aria-invalid`/`aria-describedby` en inputs con error, `aria-label` en el input de archivo oculto visualmente, `aria-hidden="true"` en todos los iconos decorativos, `<nav aria-label="Progreso del análisis">` en el stepper.
- **Reduced motion**: bloque `@media (prefers-reduced-motion: reduce)` en `app.css` que neutraliza animaciones y transiciones para quien lo prefiera.
- **Estados no dependientes solo del color**: los estados del stepper y de las tarjetas de clasificación usan también iconos y texto (no solo cambio de color) para comunicar significado.
- **Validación**: no se agregó ni se quitó ninguna regla de validación existente (`required` en nombre del paciente, `type="email"`/`type="date"` nativos se conservan).

## 8. Lógica preservada

Sin cambios respecto al comportamiento anterior:

- **Endpoints**: `GET/POST /api/pacientes`, `GET/POST /api/profesionales`, `POST /api/analisis`, `GET /api/pacientes/{id}/historial` — ninguno se tocó. No se modificó ni un carácter de `frontend/src/api/client.js`.
- **Payloads**: `crearPaciente` sigue enviando `{ profesional_id, nombre, fecha_nacimiento, sexo }`; `analizarAudio` sigue enviando `FormData` con `paciente_id` y `audio`. Mismos nombres de campo, mismo tipo de dato, mismo orden de construcción.
- **Creación/selección de paciente**: mismas funciones (`crearPaciente`, `listarPacientes`), mismo flujo (crear → `onCreado` → agregar a la lista → seleccionar automáticamente).
- **Carga y grabación de audio**: mismo `<input type="file">` con `accept="audio/*"`, mismo `MediaRecorder` (mismo `mimeType` implícito `audio/webm`, mismo nombre de archivo `grabacion.webm`). Se agregó *un* camino adicional (arrastrar-y-soltar) que llama a la misma función interna que ya llamaba el input de archivo — no es lógica nueva, es un disparador adicional para la lógica existente.
- **Procesamiento**: `manejarAudioListo` sigue llamando a `analizarAudio(pacienteId, archivo)` de forma inmediata al recibir un archivo, sin ningún paso de confirmación intermedio nuevo. El nuevo estado `archivoSeleccionado` solo alimenta la vista (nombre/tipo/tamaño/reproductor); no retrasa ni condiciona el envío.
- **Lógica interna del profesional**: descrita en la sección 4.

## 9. Dependencias

- **No se agregó ninguna dependencia nueva.** `frontend/package.json` no cambió (`react`, `react-dom`, `vite`, `@vitejs/plugin-react`, sin variación de versión).
- Se revisó el proyecto antes de decidir: no había Tailwind, styled-components, Material UI, Chakra, Ant Design, ni ninguna librería de iconos (ni Lucide React). Por eso el sistema de estilos se implementó en CSS plano (nativo de Vite, sin build step adicional) y los iconos como componentes SVG propios en `icons.jsx`, siguiendo el orden de prioridad que diste (Lucide → otra librería instalada → nueva dependencia solo si es necesaria → SVG accesibles). No hizo falta agregar nada.

## 10. Pruebas realizadas

- **Build**: `npm run build` (Vite) — resultado: **exitoso**. 47 módulos transformados, sin errores ni warnings. Salida: `dist/index.html`, `dist/assets/index-*.css` (14.22 kB), `dist/assets/index-*.js` (159.36 kB).
- **Verificación de "Profesional" no visible**: `grep -rn "Profesional\|profesional" App.jsx components/PatientSection.jsx components/CrearPacienteForm.jsx components/AudioUploadSection.jsx components/AppHeader.jsx components/ProcessStepper.jsx` — todas las coincidencias son variables/props/comentarios/nombres de función, ninguna en texto JSX visible.
- **Linter**: no ejecutado — el proyecto **no tiene ESLint ni ningún linter configurado** (no existe archivo de configuración de linter en `frontend/`). No afirmo haber corrido un linter que no existe.
- **Tests**: no ejecutados — el proyecto **no tiene ningún framework de testing configurado** (no hay Jest, Vitest, Testing Library ni archivos `*.test.*`). No hay pruebas automatizadas que correr.
- **Type checking**: no aplica — el proyecto es JavaScript puro, sin TypeScript.
- **Prueba manual en navegador**: **no la realicé yo directamente** — no tengo una herramienta de automatización de navegador disponible en este entorno. Validé por inspección de código y por build exitoso que la lógica y los datos fluyen igual que antes; la verificación visual/interactiva en el navegador (clicks reales, grabación de audio real, etc.) queda pendiente de que la corras vos. Ver sección 12.

## 11. Verificación del backend

- No se abrió ni se modificó ningún archivo bajo `webapp/backend/` en esta tarea. Lo verifiqué de forma concreta comparando timestamps de archivos: `find backend -newer frontend/src/styles/tokens.css -type f` (el primer archivo que creé en esta tarea) devolvió **cero resultados** — ningún archivo del backend tiene fecha de modificación posterior al inicio de este trabajo.
- No se tocó `frontend/src/api/client.js`, que es el único punto de contacto del frontend con el backend — por lo tanto los endpoints, métodos HTTP, headers y payloads son exactamente los mismos.
- No se modificaron nombres de campos (`paciente_id`, `profesional_id`, `nombre`, `fecha_nacimiento`, `sexo`, `audio`) en ningún lugar donde se construyen los requests.

## 12. Pendientes o limitaciones

- **No pude probar la interfaz en un navegador real** (sin herramienta de automatización disponible). Recomiendo correr `npm run dev` y verificar visualmente antes de dar por cerrado el trabajo.
- **No se agregó botón de "quitar/cambiar archivo"**: la lógica actual sube y analiza el audio inmediatamente al elegirlo (no hay un paso de "archivo pendiente, aún no enviado" en el que tenga sentido cancelarlo), así que no existía funcionalidad de remover que preservar. Lo dejo explícito para que decidas si querés que se agregue como lógica nueva (fuera del alcance de esta tarea, que era solo visual).
- **No se muestra duración del audio**: no estaba disponible en la lógica existente (no se leía metadata de audio en el cliente antes de este cambio), y la consigna pedía mostrarla "únicamente si ya está disponible". No se implementó extracción de duración para no agregar lógica nueva no solicitada.
- **Contraste de color**: elegido a criterio visual siguiendo la paleta de referencia, pero no verificado con una herramienta automatizada de contraste (ej. axe, Lighthouse). Recomendado como siguiente paso si la accesibilidad formal es un requisito duro.
- **Caso "cero profesionales en la base de datos"**: la interfaz no ofrece ninguna forma visible de resolverlo (a propósito, por la restricción de no mostrar nada de "Profesional"). Si esto ocurre en un ambiente real, alguien con acceso a la base de datos o a `/docs` del backend tiene que crear un profesional para desbloquear la creación de pacientes. Es una limitación operativa heredada del alcance de esta tarea (solo frontend), no algo que se pueda resolver sin tocar backend o sin mostrar la sección oculta.

## 13. Estructura general de la nueva interfaz

De arriba hacia abajo, en una sola columna centrada (máx. 960px):

1. **Encabezado**: icono, título "Herramienta de apoyo a detección de deterioro cognitivo", subtítulo, onda decorativa (solo en pantallas ≥768px).
2. **Aviso médico**: tarjeta lavanda con icono de escudo y el texto de disclaimer.
3. **Stepper**: "Paciente" → "Audio", con estado activo/completado derivado del paciente seleccionado y del estado del análisis.
4. **Fila de dos columnas** (una sola columna en tablet/móvil):
   - **Tarjeta "Información del paciente"**: selector de paciente existente, formulario de creación (nombre, fecha de nacimiento, sexo), resumen del paciente seleccionado.
   - **Tarjeta "Muestra de audio"**: zona de arrastrar-y-soltar, botones de seleccionar archivo / grabar, resumen del archivo con reproductor de previsualización.
5. **Panel de estado**: aparece solo mientras se procesa o si hubo un error.
6. **Reporte**: aparece solo cuando el análisis termina — banner de éxito, disclaimer repetido, tarjetas de clasificación (texto = señal principal, audio = experimental/baja confianza), cuerpo del reporte redactado por el LLM, transcripción colapsable.

---

# Addendum — Integración de la landing page (2026-08-06)

## 1. Resumen

Se integró el proyecto separado `landing - Copy/` (React 19 + TypeScript +
Vite, sin relación previa con `webapp/frontend`) dentro de `webapp/frontend`,
como una segunda pantalla de la misma aplicación React. Antes de esto,
`webapp/frontend` solo tenía una pantalla (la herramienta de Paciente/Audio
documentada arriba). Ahora la aplicación tiene dos rutas:

- `/` — la landing page informativa (qué es el proyecto, cómo funciona, qué
  analiza, uso responsable, etc.), convertida a JavaScript plano.
- `/app` — la herramienta de Paciente/Audio, sin cambios de comportamiento
  respecto al addendum anterior.

La landing no tenía antes ningún enlace hacia la herramienta (era una página
de scroll único, autocontenida). Se agregó navegación real entre ambas.

## 2. Decisiones tomadas con el usuario antes de implementar

Se preguntó explícitamente y el usuario eligió:

- **Arquitectura**: una sola app con `react-router-dom` (landing en `/`,
  herramienta en `/app`), en vez de un simple toggle de estado o de mantener
  dos apps separadas.
- **TypeScript**: convertir manualmente los ~20 archivos `.tsx`/`.ts` de la
  landing a `.jsx`/`.js` plano, en vez de conservarlos como TypeScript.

## 3. Archivos nuevos

- `webapp/frontend/src/pages/LandingPage.jsx`: compone todos los componentes de la landing (antes `App.tsx`), envueltos en `<div className="landing-shell">`.
- `webapp/frontend/src/pages/ToolPage.jsx`: el contenido íntegro del antiguo `App.jsx` (herramienta de Paciente/Audio), sin ningún cambio de lógica — solo se ajustaron las rutas relativas de import (`./components/` → `../components/`) al moverlo a `pages/`, y se le agregó la clase `tool-shell` a su contenedor raíz.
- `webapp/frontend/src/App.jsx` (reescrito): ya no contiene la interfaz de la herramienta; ahora es solo el router (`BrowserRouter`/`Routes`) que decide entre `LandingPage` y `ToolPage`.
- `webapp/frontend/src/landing/`: todo el código de la landing convertido a JS, organizado en subcarpetas que reflejan la estructura original de `landing - Copy/src/`:
  - `components/*.jsx` (+ su `.css` correspondiente): `Navbar`, `HeroSection`, `ProcessSummary`, `ProposalSection`, `ProcessingPipeline`, `PipelineStageVisual`, `MultimodalAnalysis`, `DeepLearningSection`, `ReportSection`, `BenefitsSection`, `ResponsibleUseSection`, `FinalCTA`, `Footer`, `VoiceCognitionVisual`.
  - `components/ui/*.jsx` (+ `.css`): `Icon`, `Logo`, `Reveal`, `SectionHeading`.
  - `hooks/*.js`: `useActiveSection`, `useReveal`, `useScrollState` (idénticos a los `.ts` originales, sin la anotación de tipos).
  - `lib/navigation.js`: `NAV_ITEMS`, `SECTION_IDS`, `scrollToSection`.
  - `styles/tokens.css`, `styles/base.css`: ver sección 5 (escopado).
- `webapp/frontend/public/favicon.svg`: copiado tal cual desde `landing - Copy/public/favicon.svg` (el proyecto no tenía favicon propio).

## 4. Archivos modificados

- `webapp/frontend/src/main.jsx`: sin cambios de lógica; sigue montando `<App />` (que ahora es el router) y sigue importando `./styles/app.css`.
- `webapp/frontend/src/styles/tokens.css`: el selector `:root` se cambió a `.tool-shell` (ver sección 5).
- `webapp/frontend/src/styles/app.css`: las reglas que antes apuntaban a `body` y a `h1,h2,h3,h4` globales (con color/fondo/tipografía reales) se movieron a `.tool-shell`/`.tool-shell h1...h4`; `:focus-visible` se movió a `.tool-shell :focus-visible`. El resto del archivo (todas las clases `.section-card`, `.btn`, `.badge`, `.dropzone`, etc.) no se tocó.
- `webapp/frontend/index.html`: se agregó el ícono (`favicon.svg`), `theme-color`, meta `description`, y el `<link>` a Google Fonts para Manrope — todo esto ya existía tal cual en el `index.html` original de la landing; se trasladó sin inventar nada nuevo.
- `webapp/frontend/package.json`: se agregó `react-router-dom` (única dependencia nueva; ver sección 8).

**Nada de esto tocó el backend, los endpoints, los payloads ni la lógica de
`ToolPage.jsx`** (que es copia exacta del `App.jsx` documentado en el
addendum anterior, solo movida de carpeta).

## 5. El problema de la colisión de estilos y cómo se resolvió

`landing - Copy` y `webapp/frontend` son dos proyectos que se diseñaron por
separado y **usan los mismos nombres** para varias cosas: ambos definen
variables CSS en `:root` (`--primary`, `--background`, `--border`, `--space-*`,
etc., con valores distintos) y ambos definen clases utilitarias con el mismo
nombre (`.btn`, `.btn--primary`, `.btn--secondary`, `.badge`, `.report`).
Al vivir ahora en un solo bundle de CSS, estas colisiones son reales: sin
resolverlas, una de las dos pantallas habría heredado los colores/botones de
la otra, o el más cargado al final habría "ganado" de forma impredecible.

Se investigó cada colisión concretamente (comparando el listado completo de
clases de un sistema contra el código fuente del otro, con `grep`) en vez de
asumir. Se encontraron y resolvieron dos tipos de colisión:

**a) Variables `:root` (siempre activas, sin importar la ruta visible):**
Se cambió el selector `:root` por una clase contenedora en ambos sistemas:
`.tool-shell` para la herramienta (`ToolPage.jsx` envuelve todo en
`<div className="app-shell tool-shell">`) y `.landing-shell` para la landing
(`LandingPage.jsx` envuelve todo en `<div className="landing-shell">`). Cada
página solo hereda las variables del sistema al que pertenece.

**b) Selectores de elemento sin clase, siempre activos globalmente**
(`body`, `h1`-`h4`, `a`, `strong`, `img`/`svg`, `:focus-visible`): estos
existían en ambos archivos base (`app.css` de la herramienta, `base.css` de
la landing) apuntando a colores/tipografía reales. Se reescribieron para
apuntar a `.tool-shell ...` / `.landing-shell ...` en vez de al elemento
desnudo, de modo que solo afecten a los elementos dentro de su propia página.

**c) Nombres de clase idénticos con estilos distintos** (`.btn` + sus
variantes, `.badge` + sus variantes, `.report`): se renombraron **solo en el
lado de la landing**, con el prefijo `vc-` (de "Vox Cognita", el nombre de
marca de la landing): `.btn` → `.vc-btn`, `.badge` → `.vc-badge`, `.report`
→ `.vc-report` (y todas sus variantes/hijos con el mismo prefijo). Se
actualizaron tanto `landing/styles/base.css` como los `className` en los
componentes `.jsx` que los usan (`Navbar`, `HeroSection`, `DeepLearningSection`,
`ReportSection`, `FinalCTA`). El lado de la herramienta (`.btn`, `.badge`,
`.report` en `styles/app.css`) no se tocó.

Todo lo demás (nombres BEM propios de cada componente, como `.hero__title`,
`.section-card__icon`, `.pipeline__stage`, etc.) no colisiona porque cada
sistema usa su propio prefijo — se verificó exhaustivamente con `grep` antes
de descartar la necesidad de renombrarlos, no se asumió.

## 6. Navegación agregada entre landing y herramienta

La landing original no tenía ningún botón hacia la herramienta (no existía
la herramienta como destino). Se agregaron 3 puntos de entrada, todos usando
`<Link to="/app">` de `react-router-dom`:

- **Navbar** (escritorio y panel móvil): el botón que antes decía "Ver el
  proceso" y hacía scroll a la sección `#proceso` ahora dice "Ir a la
  herramienta" y navega a `/app`. Se eligió reemplazar en vez de agregar un
  botón adicional porque "Cómo funciona" ya existe como link de navegación
  dentro del propio menú, haciendo redundante un segundo botón para lo mismo.
- **FinalCTA** (sección final de la landing): el botón principal ahora dice
  "Ir a la herramienta" y navega a `/app` (antes decía "Recorrer el proceso"
  y hacía scroll a la sección de proceso, que a esa altura de la página el
  usuario ya vio). Se conservó el botón secundario "Volver al inicio".

Esta es la única lógica de negocio *nueva* introducida por esta integración
(navegación de una página a otra); no toca la herramienta ni el backend.

## 7. Lógica preservada

- **Toda la lógica de `ToolPage.jsx`** (antes `App.jsx`): estados, handlers,
  llamadas a `api/client.js`, validaciones — idéntica, solo cambió su
  ubicación de archivo.
- **Toda la lógica interactiva de la landing** (el motivo de convertir a
  mano en vez de con un script): el `IntersectionObserver` de
  `useActiveSection`/`useReveal`/`ProcessingPipeline`, el bloqueo de scroll
  y trampa de foco del menú móvil en `Navbar`, el cálculo de offset de
  `scrollToSection`, las animaciones controladas por atributos `data-*` y
  variables CSS por elemento (`--i`, `--h`, `--w`, `--d`) — todo se
  transcribió literalmente, solo quitando anotaciones de tipos.
- Ningún dato de ejemplo de la landing (las "maquetas" de reporte, las
  clasificaciones neutras en `PipelineStageVisual`/`ReportSection`) se
  convirtió en dato real ni se conectó a ningún endpoint: la landing sigue
  siendo 100% estática/ilustrativa, como fue diseñada.

## 8. Dependencias

- **Se agregó `react-router-dom` (`^6.30.4`)** — es la única dependencia
  nueva de todo este trabajo. Es necesaria porque la decisión (elegida por
  el usuario entre las opciones presentadas) fue tener rutas reales
  (`/`, `/app`) con soporte de atrás/adelante del navegador, lo cual no es
  razonable de reconstruir a mano de forma robusta.
- No se agregó React 19 (la landing lo usaba) ni Vite 7 (la landing lo
  usaba): se mantuvieron las versiones ya instaladas en `webapp/frontend`
  (React 18, Vite 5), sin que se haya detectado ninguna API de React 19
  exclusiva en el código de la landing.
- No se agregó TypeScript, `@types/react` ni ningún linter de la landing
  (`eslint`, `typescript-eslint`): quedaron fuera porque la landing se
  convirtió a JavaScript plano.
- No se agregó ninguna librería de iconos: `Icon.jsx` de la landing sigue
  siendo su propio registro de SVG a mano, igual que en el original.
- La fuente Manrope se carga vía Google Fonts (`<link>` en `index.html`),
  tal como ya la cargaba la landing original — no es una dependencia nueva,
  es la misma decisión de diseño que ya existía en `landing - Copy`.

## 9. Pruebas realizadas

- `npm install react-router-dom@^6`: exitoso.
- `npm run build` (Vite): **exitoso**, 92 módulos transformados, sin errores.
  `dist/assets/index.css` ≈ 94.8 kB, `dist/assets/index.js` ≈ 248.6 kB
  (incluye ahora landing + herramienta + router en un solo bundle).
- Búsqueda exhaustiva de sintaxis TypeScript remanente
  (`import type`, `interface X {`, anotaciones `: Tipo`, `as CSSProperties`,
  genéricos `<HTMLElement>`) sobre todos los `.jsx`/`.js` nuevos: **ninguna
  coincidencia**.
- `npm run dev` levantado en un puerto temporal y verificado con `curl` que:
  - `/` y `/app` responden 200 con el `index.html` de la SPA.
  - Los módulos `LandingPage.jsx`, `ToolPage.jsx`, y los componentes más
    complejos de la landing (`ProcessingPipeline.jsx`, `PipelineStageVisual.jsx`,
    `ReportSection.jsx`, `FinalCTA.jsx`) se transforman sin error 500 de Vite/esbuild.
  - `landing/styles/base.css` y `styles/app.css` se sirven correctamente.
- **No se realizó una prueba manual real en navegador** (clicks, scroll,
  verificación visual de que no haya bleed de estilos entre `/` y `/app`):
  no tengo herramienta de automatización de navegador en este entorno. Dado
  que el escopado de CSS (sección 5) es la parte de mayor riesgo de este
  trabajo, es el punto más importante a verificar visualmente antes de
  darlo por cerrado — ver sección 11.

## 10. Verificación del backend

- Se confirmó que el backend (`webapp/backend/`) no sirve el frontend (no
  hay ningún `StaticFiles`/mount hacia `dist/` en `app/main.py`) — son
  proyectos desplegados por separado, tal como indica el comentario
  existente en `vite.config.js` ("Backend y frontend son proyectos
  separados"). No se modificó `vite.config.js`: el proxy de `/api` hacia
  `http://localhost:8000` sigue intacto y no fue tocado por esta tarea.
- Ningún archivo bajo `webapp/backend/` fue modificado (verificado por
  timestamp, igual que en el addendum anterior).

## 11. Pendientes o limitaciones

- **Verificación visual manual pendiente**: recomiendo, antes de dar esto
  por terminado, correr `npm run dev`, abrir `/` y `/app` en el navegador, y
  confirmar que (a) los colores/botones de una página no se filtran a la
  otra, (b) el foco visible se ve correcto en ambas, (c) no hay parpadeo de
  estilos al navegar entre rutas.
- **Fallback de SPA en producción**: en desarrollo (`vite dev`) las rutas
  `/` y `/app` funcionan sin configuración adicional. Si en el futuro este
  frontend se despliega como archivos estáticos (`vite build` + un servidor
  estático), ese servidor necesita estar configurado para devolver
  `index.html` ante cualquier ruta desconocida (ej. un refresh en `/app`),
  como requiere cualquier SPA con rutas del lado del cliente. Hoy no existe
  ningún despliegue de producción configurado (el backend no sirve el
  frontend), así que esto no es un problema actual, pero queda anotado para
  cuando se decida cómo desplegar.
- El bloque `CREDITS` vacío en `Footer.jsx` (información institucional real,
  si se quiere agregar) se dejó exactamente como estaba en el original: sin
  inventar datos.
