# Entrevistador de voz

Módulo independiente de Live Lab: una sola página (`entrevistador.html`) que se abre en el navegador, sin servidor ni dependencias. Cada persona pega su propia clave de Google AI Studio; la clave no se guarda ni se incluye en el código.

- **Configuración asistida:** describe el negocio y Gemini propone los campos (los datos que faltan se marcan `[COMPLETAR]`).
- **Entrevista por voz** con protocolo editable; casos de partida y test de conceptos (yogur) con respuestas dudosas registradas.
- **Informe automático** con citas verificadas contra la transcripción, y **CSV** de la transcripción.

`proyecto-yogures-v2e.json` y `instrucciones-yogures-v2e.txt` contienen el proyecto del test de conceptos; `INFORME_V2E.md` e `INFORME_V2F.md`, los cambios y las pruebas. Datos ficticios; uso docente. Verificado con Google simulado; sin probar con clave real, Firefox ni Safari.
