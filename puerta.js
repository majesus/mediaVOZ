/* Puerta de ruido (noise gate adaptativa) para el micrófono: PCM 16 bits, 16 kHz, mono.
   Solo deja pasar el audio cuando hay voz por encima del ruido de fondo; el resto se sustituye por silencio digital,
   de modo que el detector de fin de turno de Gemini ve silencio real y no espera indefinidamente.
   - suelo de ruido adaptativo (baja rápido, sube despacio) y umbral = máx(umbralMin, suelo × 2,5);
   - apertura con 90 ms de voz (180 ms mientras habla el asistente, para no reinterpretar su propio eco);
   - cierre tras `hang` ms sin voz; audio previo (240 ms) para no perder la primera sílaba;
   - turno máximo: si la puerta lleva abierta más de `maxTurno` ms se considera ruido continuo, se absorbe en el suelo y se cierra. */
(function(root){
"use strict";
const NIVEL={quiet:0.010,normal:0.015,loud:0.030};
function crea(o){
  o=o||{};
  const M={floor:0.008,abierta:false,cuenta:0,hasta:0,desde:0,previo:[],bloqueada:false,calma:0,forzados:0,
    umbralMin:NIVEL[o.nivel]||NIVEL.normal,hang:o.hang||500,maxTurno:o.maxTurno||40000,pre:8};
  const rms=b=>{const v=new Int16Array(b);let q=0;for(let i=0;i<v.length;i++){const d=v[i]/32768;q+=d*d}return Math.sqrt(q/Math.max(1,v.length))};
  const sil=b=>new ArrayBuffer(b.byteLength);
  M.proceso=(buf,agente)=>{
    const t=performance.now(),r=rms(buf),d=buf.byteLength/32,thr=Math.max(M.umbralMin,M.floor*2.5)*(agente?1.5:1),voz=r>thr;
    if(!M.abierta){
      if(!agente) M.floor=r<M.floor?M.floor*0.8+r*0.2:M.floor*0.995+r*0.005;
      if(M.bloqueada){ if(voz) M.calma=0; else{ M.calma+=d; if(M.calma>=500){M.bloqueada=false;M.calma=0} } return [sil(buf)]; }
      M.previo.push(buf); while(M.previo.length>M.pre) M.previo.shift();
      M.cuenta=voz?M.cuenta+d:0;
      if(M.cuenta>=(agente?180:90)){ M.abierta=true; M.desde=t; M.hasta=t+M.hang; M.cuenta=0; const out=M.previo; M.previo=[]; return out; }
      return [sil(buf)];
    }
    if(voz) M.hasta=t+M.hang;
    if(t-M.desde>M.maxTurno){ M.abierta=false; M.bloqueada=true; M.calma=0; M.floor=Math.max(M.floor,r*0.9); M.previo=[]; M.forzados++; if(o.alForzar) o.alForzar(); return [sil(buf)]; }
    if(t>M.hasta){ M.abierta=false; M.previo=[]; return [sil(buf)]; }
    return [buf];
  };
  return M;
}
root.Puerta={crea,NIVEL};
})(typeof window!=="undefined"?window:globalThis);
