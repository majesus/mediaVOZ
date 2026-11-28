/* Palabras clave en tiempo real: marcador con etiqueta (estilo Anotador Banco TAM).
   Uso: const C=Claves.crea({obtenClave,obtenModelo,obtenContexto,alCambiar}); nodo=C.nodo(texto,id); C.activo=true|false. */
(function(root){
"use strict";
const CSS=".kw{color:#14110F;padding:3px 0;border-radius:8px;-webkit-box-decoration-break:clone;box-decoration-break:clone;padding-left:5px;padding-right:5px;font-weight:400}"+
".kw{background:#FFEA00}"+
".kw-bd{display:inline-block;font:500 10px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;padding:2px 4px;margin:0 6px 0 2px;vertical-align:super;color:#14110F;letter-spacing:.02em;border-radius:4px;text-transform:uppercase}"+
".kw-ctl{display:inline-flex;align-items:center;gap:8px;font-size:.78rem;margin:0 0 .5rem}.kw-ctl input{width:16px;height:16px}.kw-ctl small{opacity:.7}.kw-ctl small.err{opacity:1;color:#b00020;font-weight:600}.kw-ctl small button{margin-left:6px;padding:2px 8px;font-size:11px}";
const COD={PRE:["Precio","#FFE066"],CONF:["Confianza","#8FD3FF"],CANT:["Cantidad","#FFB38A"],PROD:["Producto","#B7F55C"],PLAZ:["Plazo o tiempo","#C9B6FF"],MARC:["Marca","#FF9EC4"],CALI:["Calidad","#7EE6C8"],NEC:["Necesidad","#FFC857"],OBJ:["Objeción o duda","#FF8A80"],EMO:["Emoción","#E3A8FF"],DISP:["Disponibilidad","#9FB8FF"],PAGO:["Pago o financiación","#E6D3A3"],USO:["Uso o contexto","#A5E8A0"],OTRO:["Otro","#D9D9D9"]};
const SCHEMA={type:"OBJECT",required:["claves"],properties:{claves:{type:"ARRAY",items:{type:"OBJECT",required:["frase","codigo","tipo"],properties:{frase:{type:"STRING"},codigo:{type:"STRING",enum:Object.keys(COD)},tipo:{type:"STRING",enum:["foco","dato"]}}}}}};
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
      out.push({s,e,tipo:c.tipo==="dato"?"dato":"foco",codigo:COD[String(c.codigo||"").toUpperCase()]?String(c.codigo).toUpperCase():"OTRO"});
    }
    return out.sort((a,b)=>a.s-b.s).slice(0,3);
  }
  const fallos=new Map();
  const conTope=(p,ms)=>Promise.race([p,new Promise((_,no)=>setTimeout(()=>no(Object.assign(new Error("Tiempo de espera agotado ("+Math.round(ms/1000)+" s)."),{timeout:true})),ms))]);
  const est=(m,err)=>{ M.estado=m; if(o.alEstado) o.alEstado(m,!!err); };
  function refresca(){
    if(enCurso.size) return est("Analizando"+(enCurso.size>1?" ("+enCurso.size+")":"")+"…");
    if(M.error) return est(M.error,true);
    est("Activo.");
  }
  async function analiza(texto){
    const clave=o.obtenClave(); if(!clave||!I) return;
    const prompt="Marcas palabras clave en tiempo real de lo que dice una persona durante una conversación, para que quien entrevista sepa en qué centrarse.\n\n"+
     "MOTIVO DE LA EXPERIENCIA:\n"+o.obtenContexto()+"\n\n"+
     "Devuelve entre 0 y 3 expresiones de 1 a 4 palabras, copiadas LITERALMENTE del texto, que sean clave para ese motivo. No marques relleno, saludos ni palabras genéricas; si nada es relevante, devuelve una lista vacía. "+
     "tipo «foco»: tema, motivación, objeción o emoción que conviene profundizar. tipo «dato»: cifra, nombre, plazo, importe o decisión concreta. "+
     "«codigo»: elige el que mejor encaje de esta lista: "+Object.entries(COD).map(([k,v])=>k+" ("+v[0]+")").join(", ")+".\n\nTEXTO DE LA PERSONA:\n"+texto;
    /* Tiempo de espera: 10 s por intento y 24 s en total; si el modelo elegido no responde, llamaTexto prueba otros. */
    const r=await conTope(I.llamaTexto(M.modelo,clave,prompt,SCHEMA,{porPeticion:10000,total:24000}),30000);
    return valida(texto,r.datos&&r.datos.claves);
  }
  const ESPERAS=[4000,12000,25000];
  async function ejecuta(texto,id){
    if(cache.has(texto)||enCurso.has(texto)) return;
    enCurso.add(texto); refresca();
    try{
      cache.set(texto,await analiza(texto)||[]); fallos.delete(texto); M.error="";
      if(o.alCambiar) o.alCambiar();
    }catch(e){
      const n=(fallos.get(texto)||0)+1; fallos.set(texto,n);
      const dia=/per ?day|PerDay|daily/i.test(e.message||"");
      if(dia){ M.bloqueo=Date.now()+1800000; M.error="Cupo diario de Gemini agotado: las palabras clave se pausan 30 min (el resto sigue funcionando)."; }
      else if(n<=ESPERAS.length){
        const w=ESPERAS[n-1]; M.error="Palabras clave: "+(e.message||"error")+" Reintento "+n+"/"+ESPERAS.length+" en "+Math.round(w/1000)+" s.";
        const h=setTimeout(()=>{ timers.delete(id); ejecuta(texto,id); },w); timers.set(id,{texto,h});
      }else M.error="Palabras clave: no se pudo analizar tras "+ESPERAS.length+" reintentos ("+(e.message||"error")+").";
    }finally{ enCurso.delete(texto); refresca(); }
  }
  function pide(texto,id){
    if(!M.activo||texto.trim().length<12||cache.has(texto)||enCurso.has(texto)) return;
    if(!o.obtenClave()){ est("Sin clave de Gemini: introdúzcala para marcar palabras clave."); return; }
    if(Date.now()<(M.bloqueo||0)||(fallos.get(texto)||0)>ESPERAS.length) return;
    const previo=timers.get(id); if(previo&&previo.texto===texto) return;
    if(previo) clearTimeout(previo.h);
    timers.set(id,{texto,h:setTimeout(()=>{ timers.delete(id); ejecuta(texto,id); },300)});
  }
  /* Reintento manual: borra fallos y bloqueos y vuelve a analizar lo pendiente. */
  M.reintenta=()=>{ fallos.clear(); M.bloqueo=0; M.error=""; timers.forEach(x=>clearTimeout(x.h)); timers.clear(); refresca(); if(o.alCambiar) o.alCambiar(); };
  M.nodo=(texto,id,cerrada)=>{
    const t=String(texto), f=document.createElement("span"), ms=M.activo?cache.get(t):null;
    if(M.activo&&!ms&&cerrada!==false) pide(t,id);
    if(!ms||!ms.length){ f.append(t); return f; }
    let p=0;
    for(const m of ms){
      if(m.s>p) f.append(t.slice(p,m.s));
      const k=document.createElement("mark"); k.className="kw kw-"+m.tipo; k.style.backgroundColor=COD[m.codigo][1]; k.textContent=t.slice(m.s,m.e); f.append(k);
      const b=document.createElement("sup"); b.className="kw-bd kw-"+m.tipo; b.style.backgroundColor=COD[m.codigo][1]; b.textContent=m.codigo+(m.tipo==="foco"?" ?":""); b.title=COD[m.codigo][0]+(m.tipo==="foco"?" · tema que conviene profundizar":" · dato concreto"); f.append(b);
      p=m.e;
    }
    if(p<t.length) f.append(t.slice(p));
    return f;
  };
  M.reinicia=()=>{fallos.clear();cache.clear();timers.forEach(x=>clearTimeout(x.h));timers.clear();enCurso.clear()};
  return M;
}
root.Claves={crea};
})(typeof window!=="undefined"?window:globalThis);
