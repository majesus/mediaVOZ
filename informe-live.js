/* Live Lab · Informe de la conversación (.md y .html, diseño suizo clásico).
   Módulo añadido: no modifica la lógica de las experiencias. Lee `entries`, `CASES` y `chosen` de piloto-empresas.js. */
(function(){
"use strict";
const $=id=>document.getElementById(id), I=window.InformeSwiss;
const btn=$("reportBtn"), log=$("log");
if(!btn||!I) return;
const st=document.createElement("style");
st.textContent=".exportrow{display:flex;gap:10px;flex-wrap:wrap}#reportDialog h2{margin-bottom:6px}#reportDialog .actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}#reportDialog .actions button{padding:10px 15px}#repMsg{min-height:1.4em;font-size:13px;margin:12px 0 0;color:var(--accent)}#repMsg.ok{color:var(--ink)}#repPrev{margin-top:14px;border-top:1px solid var(--line);padding-top:12px;font-size:14px;color:#444;max-height:30vh;overflow:auto}#repPrev b{color:var(--ink)}";
document.head.appendChild(st);
const dlg=document.createElement("dialog");dlg.id="reportDialog";
dlg.innerHTML='<form method="dialog"><div class="panelhead"><h2>Informe de la conversación</h2><button value="close" class="quiet">Cerrar ×</button></div></form>'+
 '<small>Un modelo de texto de Gemini redacta un resumen con hallazgos, citas, datos y alertas a partir de la conversación. Al generarlo, la transcripción se envía a Google con la clave de Configuración. Es un borrador: revíselo antes de usarlo.</small>'+
 '<label for="repModel">Modelo de texto</label><select id="repModel"><option value="gemini-flash-latest">gemini-flash-latest</option><option value="gemini-2.5-flash">gemini-2.5-flash</option><option value="gemini-2.5-pro">gemini-2.5-pro</option><option value="gemini-2.0-flash">gemini-2.0-flash</option></select>'+
 '<div class="actions"><button type="button" id="repGen" class="primary">Generar informe</button><button type="button" id="repMd" disabled>↓ Descargar .md</button><button type="button" id="repHtml" disabled>↓ Descargar .html</button></div>'+
 '<p id="repMsg" role="status" aria-live="polite"></p><div id="repPrev" hidden></div>';
document.body.appendChild(dlg);
let ultimo=null;
const sync=()=>{ btn.disabled = !(typeof entries!=="undefined" && entries.length); };
new MutationObserver(sync).observe(log,{childList:true}); sync();
const turnos=()=>entries.filter(e=>e.role!=="Sistema"&&e.role!=="Herramienta").map(e=>({quien:["Tú","Original"].includes(e.role)?"Persona":"Asistente",t:e.time,texto:e.text}));
function contexto(){ const c=CASES[chosen], T=turnos();
  return {
    texto:"Experiencia: "+c.brand+" ("+c.name+"). Agente: "+c.agent+". "+c.title+". "+c.desc+" Conversación de demostración con una empresa ficticia; «Persona» es quien prueba la experiencia.",
    ctx:{titulo:c.brand,subtitulo:c.title+" · "+c.agent,fecha:new Date(),duracion:T.length?T[T.length-1].t:"",turnos:T,
         tituloValoraciones:"Datos y decisiones",aviso:I.AVISO+" Conversación de demostración con datos ficticios."}};
}
btn.onclick=()=>{ ultimo=null; $("repMd").disabled=$("repHtml").disabled=true; $("repPrev").hidden=true; $("repMsg").textContent=""; dlg.showModal(); };
$("repGen").onclick=async()=>{
  const m=$("repMsg"), clave=($("key").value||"").trim();
  m.className=""; if(!clave){ m.textContent="Falta la clave: ciérre este cuadro, introdúzcala en Configuración y vuelva a abrirlo."; return; }
  $("repGen").disabled=true; m.textContent="Generando el informe…";
  try{
    const {texto,ctx}=contexto();
    const r=await I.pideInforme({clave,modelo:$("repModel").value,contexto:texto,turnos:ctx.turnos,decisiones:"datos y decisiones concretas (reservas, citas, importes, referencias, acciones acordadas)"});
    ctx.modelo=r.modelo; if(![...$("repModel").options].some(o=>o.value===r.modelo)) $("repModel").add(new Option(r.modelo,r.modelo)); $("repModel").value=r.modelo;
    ultimo={r:r.informe,ctx};
    const p=$("repPrev"); p.textContent=""; const b=document.createElement("b"); b.textContent="Resumen. "; p.append(b,r.informe.resumen||""); p.hidden=false;
    $("repMd").disabled=$("repHtml").disabled=false; m.className="ok"; m.textContent="Informe generado. Descárguelo en .md o en .html.";
  }catch(e){ m.textContent="No se pudo generar: "+e.message; }
  $("repGen").disabled=false;
};
const nombre=ext=>I.slug(CASES[chosen].brand)+"-informe-"+new Date().toISOString().slice(0,10)+"."+ext;
$("repMd").onclick=()=>{ if(ultimo) I.descarga(nombre("md"),I.construyeMd(ultimo.r,ultimo.ctx),"text/markdown;charset=utf-8"); };
$("repHtml").onclick=()=>{ if(ultimo) I.descarga(nombre("html"),I.construyeHtml(ultimo.r,ultimo.ctx),"text/html;charset=utf-8"); };
})();
