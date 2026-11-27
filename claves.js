/* Palabras clave en tiempo real: marcador con etiqueta (estilo Anotador Banco TAM).
   Uso: const C=Claves.crea({obtenClave,obtenModelo,obtenContexto,alCambiar}); nodo=C.nodo(texto,id); C.activo=true|false. */
(function(root){
"use strict";
const CSS=".kw{color:#14110F;padding:3px 0;border-radius:8px;-webkit-box-decoration-break:clone;box-decoration-break:clone;padding-left:5px;padding-right:5px;font-weight:400}"+
".kw-foco{background:#FFEA00}.kw-dato{background:#6BFF3B}"+
".kw-bd{display:inline-block;font:500 10px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;padding:2px 4px;margin:0 6px 0 2px;vertical-align:super;color:#14110F;letter-spacing:.02em;border-radius:4px;text-transform:uppercase}"+
".kw-foco.kw-bd{background:#FFEA00}.kw-dato.kw-bd{background:#6BFF3B}"+
".kw-ctl{display:inline-flex;align-items:center;gap:8px;font-size:.78rem;margin:0 0 .5rem}.kw-ctl input{width:16px;height:16px}.kw-ctl small{opacity:.7}";
const SCHEMA={type:"OBJECT",required:["claves"],properties:{claves:{type:"ARRAY",items:{type:"OBJECT",required:["frase","codigo","tipo"],properties:{frase:{type:"STRING"},codigo:{type:"STRING"},tipo:{type:"STRING",enum:["foco","dato"]}}}}}};
function crea(o){
  const I=root.InformeSwiss;
  if(!document.getElementById("kw-css")){const s=document.createElement("style");s.id="kw-css";s.textContent=CSS;document.head.appendChild(s)}
  const cache=new Map(), timers=new Map(), enCurso=new Set();
  const M={activo:true,error:"",cache,modelo:"gemini-2.5-flash-lite"};
  const lim=t=>String(t).toLowerCase();
  function valida(texto,lista){
    const L=lim(texto),vistos=[],out=[];
    for(const c of lista||[]){
      const f=String(c.frase||"").trim(); if(!f||f.length>60) continue;
      const i=L.indexOf(lim(f)); if(i<0) continue;
      const s=i,e=i+f.length; if(vistos.some(v=>s<v[1]&&e>v[0])) continue;
      vistos.push([s,e]);
      out.push({s,e,tipo:c.tipo==="dato"?"dato":"foco",codigo:String(c.codigo||"").replace(/[^\p{L}\p{N}·.\-]/gu,"").slice(0,6).toUpperCase()||"CLAVE"});
    }
    return out.sort((a,b)=>a.s-b.s).slice(0,3);
  }
  async function analiza(texto){
    const clave=o.obtenClave(); if(!clave||!I) return;
    const prompt="Marcas palabras clave en tiempo real de lo que dice una persona durante una conversación, para que quien entrevista sepa en qué centrarse.\n\n"+
     "MOTIVO DE LA EXPERIENCIA:\n"+o.obtenContexto()+"\n\n"+
     "Devuelve entre 0 y 3 expresiones de 1 a 4 palabras, copiadas LITERALMENTE del texto, que sean clave para ese motivo. No marques relleno, saludos ni palabras genéricas; si nada es relevante, devuelve una lista vacía. "+
     "tipo «foco»: tema, motivación, objeción o emoción que conviene profundizar. tipo «dato»: cifra, nombre, plazo, importe o decisión concreta. "+
     "«codigo»: etiqueta de 2 a 5 letras mayúsculas que resume el tema (por ejemplo PRE, PLAZ, CONF).\n\nTEXTO DE LA PERSONA:\n"+texto;
    const r=await I.llamaTexto(M.modelo,clave,prompt,SCHEMA);
    return valida(texto,r.datos&&r.datos.claves);
  }
  const est=m=>{ M.estado=m; if(o.alEstado) o.alEstado(m); };
  function pide(texto,id){
    if(!M.activo||texto.trim().length<12||cache.has(texto)||enCurso.has(texto)) return;
    if(!o.obtenClave()){ est("Sin clave de Gemini: introdúzcala para marcar palabras clave."); return; }
    if(Date.now()<(M.bloqueo||0)) return;
    const previo=timers.get(id); if(previo&&previo.texto===texto) return;
    if(previo) clearTimeout(previo.h);
    const h=setTimeout(async()=>{
      timers.delete(id);
      if(cache.has(texto)||enCurso.has(texto)) return; enCurso.add(texto); est("Analizando…");
      try{ cache.set(texto,await analiza(texto)||[]); est("Activo."); if(o.alCambiar) o.alCambiar(); }
      catch(e){ const dia=/per ?day|PerDay|daily/i.test(e.message); M.bloqueo=Date.now()+(dia?1800000:15000);
        est(dia?"Cupo diario de Gemini agotado: las palabras clave se pausan 30 min (el resto sigue funcionando).":"Error: "+e.message+" Se reintentará en 15 s."); }
      finally{ enCurso.delete(texto); }
    },300);
    timers.set(id,{texto,h});
  }
  M.nodo=(texto,id,cerrada)=>{
    const t=String(texto), f=document.createElement("span"), ms=M.activo?cache.get(t):null;
    if(M.activo&&!ms&&cerrada!==false) pide(t,id);
    if(!ms||!ms.length){ f.append(t); return f; }
    let p=0;
    for(const m of ms){
      if(m.s>p) f.append(t.slice(p,m.s));
      const k=document.createElement("mark"); k.className="kw kw-"+m.tipo; k.textContent=t.slice(m.s,m.e); f.append(k);
      const b=document.createElement("sup"); b.className="kw-bd kw-"+m.tipo; b.textContent=m.codigo+(m.tipo==="foco"?" ?":""); b.title=m.tipo==="foco"?"Tema que conviene profundizar":"Dato concreto"; f.append(b);
      p=m.e;
    }
    if(p<t.length) f.append(t.slice(p));
    return f;
  };
  M.reinicia=()=>{cache.clear();timers.forEach(x=>clearTimeout(x.h));timers.clear();enCurso.clear()};
  return M;
}
root.Claves={crea};
})(typeof window!=="undefined"?window:globalThis);
