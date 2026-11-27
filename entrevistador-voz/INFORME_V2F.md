# v2f del entrevistador de voz y actualización del seminario (v2e)

## Entrevistador de voz (`entrevistador.html`)
- **Asistente de configuración:** a partir de una descripción del negocio, Gemini propone rol, objetivo, tono, idioma, duración, primera indicación, preguntas guía, contexto y datos mediante respuesta con esquema JSON. Los datos que faltan se marcan «[COMPLETAR: …]» y no se inventan. Modelo de texto editable (`gemini-2.5-flash` por defecto). La clave viaja en la cabecera `x-goog-api-key`, nunca en la dirección, y no se guarda.
- **Informe automático:** resumen, hallazgos, citas literales, valoraciones, alertas para el investigador y seguimiento. La página comprueba localmente que cada cita aparece en las intervenciones de la persona y señala las que no coinciden. Descarga en TXT.
- **CSV** de la transcripción (`tiempo;hablante;texto`, UTF-8 con BOM, para Excel).
- **Conversación de ejemplo** escrita a mano (no generada por IA) para probar detección de dudosas, CSV e informe sin micrófono.
- Se conserva todo lo de v2e: protocolo del yogur con criterio, registro de respuestas dudosas, panel de configuración plegable.

## Seminario
- `presentacion-v2e.html`: 31 diapositivas (5 nuevas, 22 a 26: entrevistador de voz, configuración asistida, criterio, informe y CSV, gobernanza). Se parte de la presentación Live Lab vigente; las etiquetas numéricas posteriores se han renumerado.
- `guion-estudio-voz-v2e.html`: 31 entradas, 52 preguntas frecuentes (bloque 8 nuevo), 36 términos (6 nuevos) y referencias cruzadas renumeradas.
- No se ha sobrescrito ningún archivo anterior.

## Pruebas (Chromium, Google simulado con `page.route`)
Asistente de configuración (campos rellenados, `[COMPLETAR]`, enum de tono, clave en cabecera y no en URL, mensajes sin descripción o sin clave, error HTTP 403), conversación de ejemplo (respuesta dudosa registrada), CSV (BOM, 14 líneas, cabecera), informe (6 secciones, una cita no literal señalada, solicitud con transcripción y marcadas), descarga del informe; regresión de las cinco sesiones del yogur (protocolo íntegro, una despedida, cierre sin audio posterior, dudosas 1/0/2/1/0). Presentación: 31 diapositivas sin errores de consola ni desbordes; guion sin errores.

## No verificado
- Generación de configuración e informe con la API real de Gemini (el nombre del modelo de texto puede cambiar) y sesión de voz real: **el tono del modelo no está garantizado**.
- Firefox, Safari y publicación en GitHub Pages.
- Las capturas de pantalla de la v2f no se han incorporado a la presentación (las diapositivas nuevas son esquemáticas). La mención al Reglamento europeo de IA es indicativa.
