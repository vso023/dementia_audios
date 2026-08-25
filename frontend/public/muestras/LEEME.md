# Audios de ejemplo

Poner aquí los archivos de audio de demostración, con estos nombres
EXACTOS (los usa `src/components/SampleAudioClips.jsx`):

- `ejemplo-1.wav`
- `ejemplo-2.wav`
- `ejemplo-3.wav`

Formato: **WAV**, mono, 16kHz preferido (no obligatorio — el backend
igual remuestrea, pero así el archivo pesa menos y se sirve más rápido).
MP3 también funciona si hace falta (ajustar la extensión en
`SampleAudioClips.jsx`).

Requisito importante: deben ser audios que se puedan compartir
públicamente sin problema — **no** grabaciones reales de pacientes de
ningún dataset con restricciones de uso (privacidad/licencia). Por
ejemplo, grabaciones propias leyendo el mismo pasaje del Quijote que usa
la herramienta, o cualquier lectura en voz alta similar de la que se
tenga permiso claro de uso público.

Para agregar un cuarto ejemplo (o más): copiar el archivo aquí y agregar
una entrada en el arreglo `MUESTRAS` de `SampleAudioClips.jsx` con el
mismo nombre de archivo.
