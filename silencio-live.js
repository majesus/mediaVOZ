/* Live Lab · silencio del interlocutor. Módulo añadido: lee la sesión de piloto-empresas.js (session, send, record, requestStop). */
(function(){
"use strict";
const $=id=>document.getElementById(id);
if(!window.Silencio||typeof requestStop!=="function") return;
const cfg=$("config"),ref=$("resetPrompt");
function campo(etq,id,vals,def){const l=document.createElement("label");l.textContent=etq;const s=document.createElement("select");s.id=id;for(const[v,t] of vals)s.add(new Option(t,v));s.value=def;l.append(s);cfg.insertBefore(l,ref);return s}
const sec=a=>a.map(n=>[String(n),n+" s"]);
campo("Silencio: preguntar si la persona sigue ahí tras (agentes conversacionales)","sil1",[["0","Desactivado"],...sec([8,12,15,20,30,45,60])],"15");
campo("Silencio: despedirse y cerrar tras otros","sil2",sec([8,10,15,20,30,45]),"15");
let ultimo=null,hits=0,nTu=0,lenTu=0;
const buf=new Uint8Array(256);
const S=Silencio.crea({
  espera1:()=>$("sil1").value, espera2:()=>$("sil2").value,
  activo:()=>{const s=session;return !!(s&&s.ready&&!s.paused&&!s.closing&&!s.kind&&!s.manual)},
  hablaAgente:()=>!!(session&&session.sources&&session.sources.size>0),
  envia:t=>{if(session)send(session,{realtimeInput:{text:t}})},
  alAviso:e=>{record("Sistema",e===1?"Silencio de la persona: el asistente pregunta si sigue ahí.":"Silencio prolongado: el asistente se despide.")},
  alCerrar:()=>{const s=session;if(!s) return;s.motivoCierre="Conversación cerrada por silencio prolongado. Puedes descargar el registro.";record("Sistema","Conversación cerrada por silencio prolongado.");requestStop(s)}
});
/* Detector de voz de la persona: nivel del micrófono, transcripción parcial o texto nuevo en el registro. */
setInterval(()=>{
  const s=session;
  if(s!==ultimo){ultimo=s;S.reinicia();hits=0;nTu=0;lenTu=0}
  if(!s||!s.ready||!s.inMeter) return;
  if(s.puerta){ if(s.puerta.abierta) S.voz(); }
  else if(!(s.sources&&s.sources.size>0)){
    s.inMeter.getByteTimeDomainData(buf);let q=0;for(const v of buf){const d=(v-128)/128;q+=d*d}
    const rms=Math.sqrt(q/buf.length);hits=rms>0.02?hits+1:Math.max(0,hits-0.25);
    if(hits>=3){hits=0;S.voz()}
  }
  const p=$("partial");if(p&&p.textContent.trim()) S.voz();
  const tu=entries.filter(e=>e.role==="Tú"||e.role==="Original"),len=tu.reduce((n,e)=>n+e.text.length,0);
  if(tu.length!==nTu||len!==lenTu){ if(len>lenTu) S.voz(); nTu=tu.length;lenTu=len }
},100);
})();
