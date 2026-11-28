/* Silencio del interlocutor: si la persona no responde, el asistente espera unos segundos, pregunta si sigue ahí
   (o reformula) y, si continúa el silencio, se despide con cortesía y cierra la conversación.
   Uso: const S=Silencio.crea({espera1,espera2,hablaAgente,activo,envia,alAviso,alCerrar}); S.voz() cada vez que la persona habla. */
(function(root){
"use strict";
const AVISO1="[Aviso del sistema, no es la persona] La persona lleva unos segundos sin responder. Pregúntale con amabilidad si sigue ahí o reformula tu última pregunta de forma más sencilla. Una sola frase corta; no supongas lo que habría contestado.";
const AVISO2="[Aviso del sistema, no es la persona] Sigue sin haber respuesta. Despídete con cortesía en una sola frase: di que cierras la conversación por ahora y que puede volver a empezarla cuando quiera. No hagas más preguntas.";
function crea(o){
  const M={etapa:0,ref:Date.now(),despedida:0,ultimoAudio:0,AVISO1,AVISO2};
  const ya=()=>Date.now();
  M.reinicia=()=>{M.etapa=0;M.ref=ya();M.despedida=0;M.ultimoAudio=0};
  /* La persona ha hablado: se reinicia la cuenta (salvo que ya estemos despidiéndonos). */
  M.voz=()=>{ if(M.despedida||M.etapa===3) return; M.etapa=0; M.ref=ya(); };
  function tick(){
    const t=ya();
    if(!o.activo()){ M.ref=t; return; }
    if(M.etapa===3) return;
    if(o.hablaAgente()){ M.ultimoAudio=t; if(!M.despedida) M.ref=t; return; }
    if(M.despedida){
      /* Cierre cuando el asistente termina de despedirse (o, como tope, 15 s después del aviso). */
      if((M.ultimoAudio>M.despedida&&t-M.ultimoAudio>1500)||t-M.despedida>15000){ M.etapa=3; o.alCerrar(); }
      return;
    }
    if(t-M.ultimoAudio<1200){ M.ref=t; return; }
    const e1=(Number(o.espera1())||0)*1000, e2=(Number(o.espera2())||0)*1000;
    if(!e1) return;
    const q=t-M.ref;
    if(M.etapa===0&&q>=e1){ M.etapa=1; M.ref=t; o.envia(AVISO1); if(o.alAviso) o.alAviso(1); }
    else if(M.etapa===1&&q>=(e2||e1)){ M.etapa=2; M.despedida=t; o.envia(AVISO2); if(o.alAviso) o.alAviso(2); }
  }
  M.h=setInterval(tick,200);
  M.detiene=()=>clearInterval(M.h);
  M.tick=tick;
  return M;
}
root.Silencio={crea,AVISO1,AVISO2};
})(typeof window!=="undefined"?window:globalThis);
