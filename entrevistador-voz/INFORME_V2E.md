# Protocolo del yogur v2e: criterio y presencia humana

**Origen del problema.** En una prueba con respuestas absurdas («compro 8 al día, siete días a la semana», «¿es incompatible con esnifar cocaína?») el asistente las aceptó con total naturalidad. La causa está en el protocolo v2c: pedía reacciones *neutras* («entiendo», «vale») ante cualquier respuesta y no daba ningún criterio para distinguir una respuesta plausible de una inverosímil, de una broma o de un asunto ajeno al estudio.

## Cambios en el protocolo (`instrucciones-yogures-v2e.txt`)

1. **Escucha activa.** Antes de cada pregunta, un comentario breve que retome algo concreto de lo dicho, con fórmulas que no valoran ni opinan; ritmo adaptado al de la persona. Sustituye a las muletillas neutras de v2c.
2. **Sección «Criterio y presencia»**: respuestas inverosímiles (sorpresa amable y petición abierta de aclaración), bromas (sonrisa breve y reconducción), temas ajenos o inadecuados (reencuadre fijo «eso se sale de lo que puedo comentarle; volvamos al yogur», segunda insistencia, ofrecimiento de cerrar), control de calidad (una sola aclaración por respuesta, máximo tres por sesión), coherencia entre lo dicho y la escala de 1 a 5, y prohibición expresa de decir que se anotan respuestas «dudosas».
3. **Se mantiene** toda la metodología: neutralidad, ausencia de pistas, textos literales de los conceptos, aleatorización por la página, despedida única, tratamiento de datos que faltan.

## Cambios en la página (`voz-minima-v2e.html`)

Nuevo campo **«Frases que marcan una respuesta dudosa»** (formato `frase | etiqueta`, una por línea). Cuando el asistente pronuncia una de ellas, la página anota la respuesta anterior de la persona, con su marca de tiempo, en el apartado **«Respuestas dudosas o incoherentes»** de la pantalla y de la transcripción descargada, para que el investigador decida su exclusión. Frases por defecto: «Quiero asegurarme de haberle entendido bien | Aclaración pedida» y «eso se sale de lo que puedo comentarle | Fuera de tema». El campo se guarda en el JSON del proyecto (`proyecto-yogures-v2e.json`).

**Límite de esta detección:** depende de que el modelo use la frase prevista. Si no la usa, la respuesta dudosa no se anota; la transcripción completa sigue disponible.

## Fragmentos antes y después

El «antes» reproduce el comportamiento descrito en la prueba; no es una transcripción literal. El «después» es una réplica escrita por mí siguiendo el protocolo v2e (no es salida de Gemini).

**Cifra imposible**
- Antes: «Compro ocho al día, siete días a la semana.» → «Entiendo. Pasamos a la siguiente pregunta.»
- Después: «¿Ocho al día? Quiero asegurarme de haberle entendido bien; cuénteme un poco cómo es eso.» → «Bueno, en casa somos cinco…» → «Ah, ya, entre los cinco de casa.» (registrada como *Aclaración pedida*).

**Tema inadecuado**
- Antes: «¿Es incompatible con esnifar cocaína?» → respuesta o aceptación sin reparo.
- Después: «Eso se sale de lo que puedo comentarle; volvamos al yogur.» → si insiste: «Si prefiere, podemos dejarlo aquí.» → cierre con «Que tenga un buen día.» (dos entradas *Fuera de tema*).

**Broma**
- Después: «Lo compraría si viniera con un cochecito de regalo, jajaja.» → «Ja, ja, me ha hecho gracia. Y sin el cochecito, tal cual, ¿qué haría?»

**Contradicción**
- Después: dice que lo compraría seguro y puntúa 1 → «Quiero asegurarme de haberle entendido bien: me decía que lo compraría seguro y ahora un 1; ¿cuál refleja mejor su postura?» → «Un cinco.» → «Un 5, de acuerdo.»

## Pruebas (Chromium con Google simulado)

Cinco sesiones simuladas (`sesiones-simuladas-yogures-v2e.txt`): absurda, broma, inadecuada, contradicción y cooperativa. Resultados: protocolo y fichas enviados íntegros; orden de conceptos sorteado; una sola despedida y cierre automático sin audio posterior; el apartado de dudosas registra 1, 0, 2, 1 y 0 entradas respectivamente, en pantalla y en la descarga; el JSON conserva el campo nuevo; sin errores de consola.

## No verificado

- **Sin sesión real con el modelo no se puede garantizar el tono.** Si el modelo reacciona con la naturalidad prevista, la intensidad del humor y la calidad del reencuadre solo se comprueban en voz y con una clave real.
- Firefox, Safari y la página publicada en GitHub Pages.
- La presentación (`presentacion-v2d.html`) no se ha actualizado con estas novedades.
