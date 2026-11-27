<div align="center">

# mediaVOZ · Live Lab

**Asistentes de voz para los negocios: nueve experiencias para probar en directo, en tu propio ordenador, con tu propia clave gratuita de Google AI Studio.**

Seminario *Inteligencia artificial en los negocios* · Universidad de Sevilla

![HTML](https://img.shields.io/badge/HTML%20%2B%20JS-sin%20dependencias-171717)
![Gemini Live API](https://img.shields.io/badge/Gemini-Live%20API-c91820)
![Datos](https://img.shields.io/badge/datos-ficticios-555)
![Licencia](https://img.shields.io/badge/uso-docente-555)

</div>

---

## Tranquilidad ante todo

> **Live Lab es un simulador docente.** No tiene servidor propio y **no guarda tu clave API, ni tus conversaciones, ni transcripciones, ni entrevistas**.
>
> - Tu clave vive solo en la memoria de la pestaña mientras la usas y se borra al finalizar la sesión. No se escribe en ningún archivo, cookie ni almacenamiento del navegador.
> - La conversación solo existe en la pestaña abierta. Si cierras o recargas, desaparece. Solo se conserva si tú pulsas **Descargar TXT**.
> - Lo único que se guarda, en tu propio navegador, son las **operaciones ficticias** de las demos (una reserva de auriculares inventados, una cita en una clínica inventada…), para que puedas verlas en una tabla y exportarlas a CSV. Se borran con **Vaciar base**.
> - Todas las empresas, productos, pedidos y agendas son **inventados**.

Lo que sí debes saber: tu voz (y la imagen de la cámara, si la activas) se envía a Google para que el modelo la procese. Lee el apartado [Precauciones](#precauciones).

---

## Qué incluye

| # | Sector | Experiencia | Qué demuestra |
|---|---|---|---|
| 01 | Comercio y retail | **NOVA Store** · Nora | De la consulta a la reserva; incidencias de pedidos |
| 02 | Gaming | **Ecos de Arkania** · Lyra | Un personaje que da pistas y valida un enigma |
| 03 | Almacén y logística | **Vision Desk** · Vega | Dar de alta mercancía enseñando la etiqueta a la cámara |
| 04 | Salud | **Clínica Horizonte** · Alba | Agenda de citas sin dobles reservas |
| 05 | Finanzas | **Atlas Capital Lab** · Alex | Escenarios de ahorro calculados, no inventados |
| 06 | Educación | **Mentor Business School** · Clara | Tutoría oral con rúbrica |
| 07 | Traducción | **Bridge Live** | Voz a voz en otro idioma |
| 08 | Transcripción | **Minute Studio** | Actas en modo literal o editado |
| 09 | Información actual | **Radar Live** · Marina | Búsqueda en Google con fuentes |

---

## Puesta en marcha en tres minutos

### 1 · Consigue tu clave gratuita de Google AI Studio

1. Entra en **[aistudio.google.com](https://aistudio.google.com)** con tu cuenta de Google (mayor de 18 años y país admitido).
2. Acepta las condiciones de uso.
3. Abre **Get API key** → **Create API key**. Si te lo pide, crea un proyecto nuevo de Google Cloud: no hace falta tarjeta.
4. Copia la clave. Empieza por `AIza…`.

Mientras el proyecto **no tenga facturación activada**, trabajas en el **nivel gratuito (free tier)**: no se te puede cobrar nada. A cambio, hay límites de uso por minuto y por día que varían según el modelo; consúltalos en AI Studio, en el apartado de límites de uso. Si una sesión falla por cuota, espera un minuto o cambia de modelo.

### 2 · Descarga la aplicación

```bash
git clone https://github.com/majesus/mediaVOZ.git
```

O bien **Code → Download ZIP** y descomprímelo. Mantén los cuatro archivos `piloto-*` en la misma carpeta.

### 3 · Ábrela

Abre `piloto-empresas.html` en **Chrome** o **Edge**. Si el navegador no deja usar el micrófono desde un archivo local, sirve la carpeta así:

```bash
cd mediaVOZ
python -m http.server 8000
```

y entra en **http://localhost:8000/piloto-empresas.html**.

### Alternativa: usarla directamente en la web

Si el repositorio tiene activado **GitHub Pages** (Settings → Pages → *Deploy from a branch* → `main` / raíz), la aplicación está disponible en **https://majesus.github.io/mediaVOZ/** y no hay que descargar nada. Funciona por HTTPS, de modo que el micrófono no da problemas. Cada persona pega su propia clave en Configuración; la web no incluye ninguna.

### 4 · Configura y habla

**Configuración ⚙** → pega tu clave → elige un caso → **Iniciar experiencia** → concede el micrófono. Cada panel propone frases para probar.

---

## Precauciones

**Con tu clave**

- Trátala como una contraseña: no la compartas, no la pegues en chats, foros ni capturas de pantalla, y **nunca la subas a GitHub**.
- No la escribas dentro de los archivos de la aplicación: no hace falta.
- En Google Cloud puedes **restringirla** para que solo funcione con la *Generative Language API*.
- Si sospechas que se ha filtrado, **elimínala** en AI Studio y crea otra. Al terminar el curso, puedes borrarla.
- No actives la facturación si solo quieres practicar.

**Con lo que dices**

- En el nivel gratuito, Google puede usar el contenido que envías para mejorar sus productos, y puede ser revisado por personas. Por eso: **no digas datos personales, clínicos, financieros ni confidenciales**. Usa los datos inventados de cada caso.
- La cámara de Vision Desk solo envía imágenes mientras está activada: enseña una etiqueta o un objeto de prueba, nunca personas ni documentos reales.
- La búsqueda web puede consumir cuota adicional.

**Con los resultados**

- Las respuestas pueden equivocarse. Nada de lo que ocurre aquí es una compra, cita, diagnóstico ni recomendación financiera real.

---

## Cómo está construida

```
mediaVOZ/
├── piloto-empresas.html   Interfaz
├── piloto-empresas.css    Estilo
├── piloto-casos.js        Casos, datos ficticios, funciones y base de operaciones
├── piloto-empresas.js     Sesión de voz con la Gemini Live API
├── PROMPT_LIVE_LAB.md     Prompt maestro para reconstruirla con un asistente de código
└── README.md
```

- **Conexión segura desde el navegador.** La clave solo se usa para pedir a Google un *token efímero* de un solo uso; la conversación viaja con ese token.
- **Datos blindados.** El asistente nunca recibe colecciones completas: un pedido solo se consulta por su código exacto, las claves consultables están en una lista blanca, cada persona solo ve sus citas y las respuestas grandes se bloquean.
- **Sin dobles reservas.** Las operaciones se guardan en IndexedDB dentro de una transacción con índice único: abre dos pestañas, reserva el mismo hueco en ambas y verás que solo una lo consigue.
- **Modelos.** Conversación: `gemini-3.8-live`, `gemini-3.8-live-extended-thinking`, `gemini-3.1-flash-live-preview`, `gemini-2.5-flash-native-audio-preview-12-2025`. Especializados: `gemini-3.5-live-translate-preview` y `gemini-3.5-transcribe-live`. La disponibilidad depende de tu clave.

---

## Si algo no funciona

| Síntoma | Qué revisar |
|---|---|
| «No se pudo obtener token temporal» | Clave mal copiada, cuota agotada o modelo no disponible para tu cuenta |
| No se oye nada / no te escucha | Permiso de micrófono del navegador; usa `localhost` en lugar de abrir el archivo |
| La sesión se corta | Límite de nueve minutos por demostración, red inestable o cuota |
| Responde a ruidos | Configuración → Interrupciones → *Con filtro* y sensibilidad *Baja* |

---

## Documentación

[Live API · capacidades](https://ai.google.dev/gemini-api/docs/live-guide) · [Herramientas y funciones](https://ai.google.dev/gemini-api/docs/live-tools) · [Tokens efímeros](https://ai.google.dev/gemini-api/docs/ephemeral-tokens) · [Límites de uso](https://ai.google.dev/gemini-api/docs/rate-limits) · [Condiciones de la API](https://ai.google.dev/gemini-api/terms)

---

<div align="center">

Material docente con fines educativos · Datos y empresas ficticios · No apto para producción

</div>
