/* Informe de conversación en Markdown y HTML (diseño suizo clásico).
   Sin dependencias. Uso: InformeSwiss.construyeMd(r, ctx), InformeSwiss.construyeHtml(r, ctx),
   InformeSwiss.descarga(nombre, texto, tipo), InformeSwiss.pideInforme(opciones). */
(function(root){
"use strict";
const esc=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const norm=t=>String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
const mdl=t=>String(t==null?"":t).replace(/\r?\n/g," ").replace(/\|/g,"\\|");
const fechaLarga=d=>d.toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric"});
const horaCorta=d=>d.toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"});
const AVISO="Informe generado automáticamente con un modelo de IA a partir de la transcripción. Es un borrador: revíselo antes de usarlo.";

/* Secciones presentes, con numeración consecutiva */
function secciones(r,ctx){
  const S=[],tv=ctx.tituloValoraciones||"Valoraciones";
  if(r.resumen) S.push({id:"resumen",t:"Resumen"});
  if(r.hallazgos&&r.hallazgos.length) S.push({id:"hallazgos",t:"Hallazgos"});
  if(r.citas&&r.citas.length) S.push({id:"citas",t:"Citas literales"});
  if(r.valoraciones&&r.valoraciones.length) S.push({id:"valoraciones",t:tv});
  if((r.alertas&&r.alertas.length)||(ctx.dudosas&&ctx.dudosas.length)||(ctx.faltas&&ctx.faltas.length)) S.push({id:"alertas",t:"Alertas para la revisión humana"});
  if(r.seguimiento) S.push({id:"seguimiento",t:"Seguimiento sugerido"});
  S.forEach((s,i)=>s.n=String(i+1).padStart(2,"0"));
  return S;
}
function meta(ctx){
  const f=ctx.fecha||new Date(),m=[["Fecha",fechaLarga(f)+", "+horaCorta(f)]];
  if(ctx.duracion) m.push(["Duración",ctx.duracion]);
  m.push(["Intervenciones",String((ctx.turnos||[]).length)]);
  if(ctx.modelo) m.push(["Modelo del informe",ctx.modelo]);
  return m;
}
const cita=c=>typeof c==="string"?{t:c,lit:true}:c;

function construyeMd(r,ctx){
  const L=[],S=secciones(r,ctx),tit=ctx.titulo||"Conversación";
  L.push("# Informe de la conversación","", "**"+tit+"**"+(ctx.subtitulo?" · "+ctx.subtitulo:""),"");
  L.push(meta(ctx).map(([k,v])=>k+": "+v).join(" · "),"");
  for(const s of S){
    L.push("## "+s.n+" · "+s.t,"");
    if(s.id==="resumen") L.push(r.resumen,"");
    if(s.id==="hallazgos"){ r.hallazgos.forEach(h=>L.push("- **"+h.tema+".** "+h.detalle)); L.push(""); }
    if(s.id==="citas"){ r.citas.map(cita).forEach(c=>L.push("> «"+c.t+"»"+(c.lit?"":" *(no coincide literalmente con la transcripción; verifíquela)*"),"")); }
    if(s.id==="valoraciones"){ L.push("| Elemento | Valor | Motivo |","| --- | --- | --- |"); r.valoraciones.forEach(v=>L.push("| "+mdl(v.elemento)+" | "+mdl(v.valor)+" | "+mdl(v.motivo)+" |")); L.push(""); }
    if(s.id==="alertas"){
      (r.alertas||[]).forEach(a=>L.push("- "+a));
      (ctx.dudosas||[]).forEach(d=>L.push("- ["+d.t+"] "+d.et+": «"+d.r+"»"));
      (ctx.faltas||[]).forEach(f=>L.push("- Dato que la persona echó en falta: «"+f+"»"));
      L.push("");
    }
    if(s.id==="seguimiento") L.push(r.seguimiento,"");
  }
  if((ctx.turnos||[]).length){
    L.push("## Anexo · Transcripción","");
    ctx.turnos.forEach(x=>L.push("**["+x.t+"] "+x.quien+":** "+String(x.texto).trim(),""));
  }
  L.push("---","","*"+(ctx.aviso||AVISO)+"*","");
  return L.join("\n");
}

const CSS=`
:root{color-scheme:light dark;--bg:#fafaf9;--surf:#f5f5f4;--line:#e7e5e4;--ink:#1c1917;--ink70:rgba(28,25,23,.7);--ink40:rgba(28,25,23,.4);--acc:#C8102E;--acc20:rgba(200,16,46,.2)}
@media(prefers-color-scheme:dark){:root{--bg:#0c0a09;--surf:#1c1917;--line:#292524;--ink:#fafaf9;--ink70:rgba(250,250,249,.7);--ink40:rgba(250,250,249,.4)}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:400 16px/1.625 'IBM Plex Sans','Hanken Grotesk','Barlow','Host Grotesk','DM Sans',system-ui,sans-serif;font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased}
.wrap{max-width:72rem;margin:0 auto;padding:0 16px}
.g{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:16px}
.cap{font-size:12px;letter-spacing:.05em;text-transform:uppercase;line-height:1.5}
.q70{color:var(--ink70)}.q40{color:var(--ink40)}
header.top{padding:64px 0 48px;border-bottom:1px solid var(--line)}
.bar{width:48px;height:8px;background:var(--acc);margin:0 0 32px}
h1{font-weight:300;letter-spacing:-.02em;line-height:1.05;font-size:clamp(2.25rem,7vw,4.5rem);margin:16px 0 24px;text-wrap:balance;grid-column:1/-1}
.sub{font-size:20px;font-weight:300;color:var(--ink70);max-width:60ch;margin:0 0 40px;grid-column:1/-1}
dl.meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:24px 16px;margin:0}
dl.meta dt{font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:var(--ink40)}dl.meta dd{margin:4px 0 0;font-weight:500}
section.s{padding:64px 0;border-bottom:1px solid var(--line)}
.lab{grid-column:1/-1;margin-bottom:24px}.lab .n{display:block;font-size:12px;letter-spacing:.05em;color:var(--acc)}
h2{font-weight:300;letter-spacing:-.01em;line-height:1.2;font-size:clamp(1.5rem,3.4vw,1.875rem);margin:6px 0 0;text-wrap:balance}
.body{grid-column:1/-1}
.body p,.body li,.body blockquote{max-width:60ch;text-wrap:pretty}
.body p{margin:0}.lead{font-size:20px;font-weight:300;line-height:1.55}
ul.flat{list-style:none;margin:0;padding:0}ul.flat li{padding:12px 0;border-top:1px solid var(--line)}ul.flat li:first-child{border-top:0;padding-top:0}
ul.flat b{font-weight:500}
blockquote{margin:0 0 16px;padding:0 0 0 16px;border-left:2px solid var(--acc);font-weight:300;font-size:18px}
.nolit{display:block;font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:var(--acc);font-weight:400;margin-top:4px}
.scroll{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:15px}
th{font-size:12px;letter-spacing:.05em;text-transform:uppercase;font-weight:400;color:var(--ink40);text-align:left;padding:0 16px 8px 0;border-bottom:1px solid var(--ink)}
td{padding:12px 16px 12px 0;border-bottom:1px solid var(--line);vertical-align:top}
ul.al li{position:relative;padding:8px 0 8px 24px;border:0;max-width:60ch}
ul.al li::before{content:"";position:absolute;left:0;top:19px;width:8px;height:8px;background:var(--acc)}
.tr .t{display:grid;grid-template-columns:96px minmax(0,1fr);gap:16px;padding:12px 0;border-top:1px solid var(--line)}
.tr .t:first-child{border-top:0}.tr .who{font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:var(--ink40);padding-top:4px}
.tr .who i{font-style:normal;display:block;color:var(--ink40)}.tr .t.ia .who{color:var(--acc)}
.tr .t p{max-width:60ch}
footer{padding:48px 0 96px}footer p{font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:var(--ink40);max-width:60ch;margin:0}
button{font:500 14px/1 inherit;font-family:inherit;min-height:44px;padding:0 24px;border:1px solid var(--ink);border-radius:0;background:transparent;color:var(--ink);cursor:pointer;margin-top:24px}
button:hover{background:var(--ink);color:var(--bg)}button:focus-visible,a:focus-visible{outline:2px solid var(--acc);outline-offset:3px}
@media(min-width:768px){.wrap{padding:0 32px}header.top{padding:96px 0 64px}section.s{padding:96px 0}
 .lab{grid-column:1/span 4;margin-bottom:0}.body{grid-column:5/span 8}h1{grid-column:1/span 10}.sub{grid-column:1/span 8}}
@media print{button{display:none}body{background:#fff;color:#000}section.s{padding:32px 0;break-inside:avoid-page}header.top{padding:0 0 24px}}
`;

function construyeHtml(r,ctx){
  const S=secciones(r,ctx),tit=ctx.titulo||"Conversación",f=ctx.fecha||new Date();
  const sec=(s,html)=>'<section class="s" aria-labelledby="h-'+s.id+'"><div class="wrap g"><div class="lab"><span class="n">'+s.n+'</span><h2 id="h-'+s.id+'">'+esc(s.t)+'</h2></div><div class="body">'+html+'</div></div></section>';
  let h='<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="theme-color" content="#fafaf9" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#0c0a09" media="(prefers-color-scheme: dark)">'
   +'<title>Informe · '+esc(tit)+'</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&amp;display=swap" rel="stylesheet"><style>'+CSS+'</style></head><body>'
   +'<header class="top"><div class="wrap"><div class="bar" aria-hidden="true"></div><div class="g"><p class="cap q70" style="grid-column:1/-1;margin:0">Informe de la conversación</p><h1>'+esc(tit)+'</h1>'+(ctx.subtitulo?'<p class="sub">'+esc(ctx.subtitulo)+'</p>':'')+'</div>'
   +'<dl class="meta">'+meta(ctx).map(([k,v])=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd></div>').join('')+'</dl><button type="button" onclick="window.print()">Imprimir o guardar en PDF</button></div></header><main>';
  for(const s of S){
    let b="";
    if(s.id==="resumen") b='<p class="lead">'+esc(r.resumen)+'</p>';
    if(s.id==="hallazgos") b='<ul class="flat">'+r.hallazgos.map(x=>'<li><b>'+esc(x.tema)+'.</b> '+esc(x.detalle)+'</li>').join('')+'</ul>';
    if(s.id==="citas") b=r.citas.map(cita).map(c=>'<blockquote>«'+esc(c.t)+'»'+(c.lit?'':'<span class="nolit">No coincide literalmente con la transcripción; verifíquela</span>')+'</blockquote>').join('');
    if(s.id==="valoraciones") b='<div class="scroll"><table><thead><tr><th scope="col">Elemento</th><th scope="col">Valor</th><th scope="col">Motivo</th></tr></thead><tbody>'+r.valoraciones.map(v=>'<tr><td>'+esc(v.elemento)+'</td><td>'+esc(v.valor)+'</td><td>'+esc(v.motivo)+'</td></tr>').join('')+'</tbody></table></div>';
    if(s.id==="alertas") b='<ul class="flat al">'+(r.alertas||[]).map(a=>'<li>'+esc(a)+'</li>').join('')+(ctx.dudosas||[]).map(d=>'<li><span class="q40">['+esc(d.t)+'] '+esc(d.et)+'</span><br>«'+esc(d.r)+'»</li>').join('')+(ctx.faltas||[]).map(x=>'<li><span class="q40">Dato que echó en falta</span><br>«'+esc(x)+'»</li>').join('')+'</ul>';
    if(s.id==="seguimiento") b='<p>'+esc(r.seguimiento)+'</p>';
    h+=sec(s,b);
  }
  if((ctx.turnos||[]).length){
    h+='<section class="s" aria-labelledby="h-anexo"><div class="wrap g"><div class="lab"><span class="n">Anexo</span><h2 id="h-anexo">Transcripción</h2></div><div class="body tr">'
      +ctx.turnos.map(x=>'<div class="t'+(x.quien==="Asistente"?' ia':'')+'"><div class="who">'+esc(x.quien)+'<i>'+esc(x.t)+'</i></div><p>'+esc(String(x.texto).trim())+'</p></div>').join('')+'</div></div></section>';
  }
  h+='</main><footer><div class="wrap"><p>'+esc(ctx.aviso||AVISO)+'</p></div></footer></body></html>';
  return h;
}

function descarga(nombre,texto,tipo){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([texto],{type:tipo}));a.download=nombre;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
const slug=t=>String(t||"informe").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"informe";

/* ---- Llamada a Gemini (texto) con recuperación ante 404 ---- */
const GEN="https://generativelanguage.googleapis.com/v1beta/models";
async function errGoogle(r){let m="";try{m=(await r.json())?.error?.message||""}catch(e){}return "Google respondió HTTP "+r.status+(m?": "+m:"")+"."}
async function modeloDisponible(clave){
  const r=await fetch(GEN+"?pageSize=200",{credentials:"omit",cache:"no-store",headers:{"x-goog-api-key":clave}});
  if(!r.ok) throw new Error(await errGoogle(r));
  const ms=((await r.json()).models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes("generateContent")).map(m=>m.name.replace(/^models\//,""));
  const quita=n=>/(live|tts|image|embed|audio|vision|thinking|preview-\d|exp|learnlm|gemma|robotics|computer)/i.test(n),buenos=ms.filter(n=>!quita(n));
  const pref=["gemini-flash-latest","gemini-2.5-flash","gemini-2.0-flash","gemini-1.5-flash"];
  return pref.find(n=>buenos.includes(n))||buenos.find(n=>/flash/i.test(n)&&!/lite/i.test(n))||buenos.find(n=>/flash/i.test(n))||buenos[0]||null;
}
/* Llamada a Gemini (texto) con tiempo de espera, recuperación ante 404 y otros modelos ante saturación o silencio.
   opc: {porPeticion: ms máximos por intento (40000), total: ms máximos en conjunto (90000)} */
async function llamaTexto(modelo,clave,prompt,schema,opc){
  opc=opc||{};
  const porPeticion=opc.porPeticion||40000,total=opc.total||90000,fin=Date.now()+total;
  const tope=m=>{const e=new Error(m);e.timeout=true;return e};
  const cuerpo=JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{temperature:0.3,responseMimeType:"application/json",responseSchema:schema}});
  const envia=async m=>{
    const resta=fin-Date.now(); if(resta<1500) throw tope("Tiempo de espera agotado: Gemini no respondió en "+Math.round(total/1000)+" s.");
    const ms=Math.min(porPeticion,resta),ac=new AbortController(),h=setTimeout(()=>ac.abort(),ms);
    try{return await fetch(GEN+"/"+encodeURIComponent(m)+":generateContent",{method:"POST",credentials:"omit",cache:"no-store",signal:ac.signal,headers:{"Content-Type":"application/json","x-goog-api-key":clave},body:cuerpo})}
    catch(e){if(e&&e.name==="AbortError") throw tope("El modelo "+m+" no respondió en "+Math.round(ms/1000)+" s."); throw e}
    finally{clearTimeout(h)}
  };
  let usado=modelo,r=null,e0="";
  try{r=await envia(modelo)}catch(e){if(!e.timeout) throw e; e0=e.message}
  if(r&&r.status===404){const alt=await modeloDisponible(clave);if(!alt||alt===modelo) throw new Error(await errGoogle(r));usado=alt;r=await envia(alt);}
  /* Saturación (503), límite (429), error del servidor (500) o silencio del modelo: se prueban otros modelos de texto mientras quede tiempo */
  if(!r||[429,500,503].includes(r.status)){
    if(r) e0=await errGoogle(r);
    for(const alt of ["gemini-2.5-flash","gemini-2.5-flash-lite","gemini-2.0-flash","gemini-flash-lite-latest"].filter(m=>m!==modelo&&m!==usado)){
      if(fin-Date.now()<3000) break;
      try{const r2=await envia(alt); if(r2.ok||![404,429,500,503].includes(r2.status)){usado=alt;r=r2;break}}catch(e){if(!e.timeout) throw e}
    }
    if(!r||[429,500,503].includes(r.status)) throw new Error(e0||"Gemini no está disponible en este momento.");
  }
  if(!r.ok) throw new Error(await errGoogle(r));
  const espera=Math.max(2000,fin-Date.now()),j=await Promise.race([r.json(),new Promise((_,no)=>setTimeout(()=>no(tope("Gemini dejó de responder a mitad de la respuesta.")),espera))]),
    t=(j&&j.candidates&&j.candidates[0]&&j.candidates[0].content&&j.candidates[0].content.parts||[]).map(p=>p.text||"").join("");
  if(!t) throw new Error("Respuesta vacía del modelo.");
  return {datos:JSON.parse(t.replace(/^```json\s*|```\s*$/g,"")),modelo:usado};
}
const SCHEMA={type:"OBJECT",required:["resumen","hallazgos","citas","valoraciones","alertas","seguimiento"],properties:{
  resumen:{type:"STRING"},
  hallazgos:{type:"ARRAY",items:{type:"OBJECT",required:["tema","detalle"],properties:{tema:{type:"STRING"},detalle:{type:"STRING"}}}},
  citas:{type:"ARRAY",items:{type:"STRING"}},
  valoraciones:{type:"ARRAY",items:{type:"OBJECT",required:["elemento","valor","motivo"],properties:{elemento:{type:"STRING"},valor:{type:"STRING"},motivo:{type:"STRING"}}}},
  alertas:{type:"ARRAY",items:{type:"STRING"}},seguimiento:{type:"STRING"}}};

/* opciones: {clave, modelo, contexto (texto), turnos:[{quien,t,texto}], decisiones (etiqueta de «valoraciones»), extra (texto), quienPersona:"Persona"} */
async function pideInforme(o){
  const trans=o.turnos.map(x=>"["+x.t+"] "+x.quien+": "+String(x.texto).trim()).join("\n");
  const prompt="Eres analista. Redacta en español un informe breve y objetivo de la conversación siguiente. No inventes nada que no figure en la transcripción; si algo no consta, no lo menciones. "+
   "«citas» debe contener fragmentos LITERALES dichos por la persona (copiados sin cambios). «valoraciones» recoge "+(o.decisiones||"puntuaciones, preferencias o decisiones expresadas")+" (elemento, valor, motivo); si no hay, devuelve una lista vacía. "+
   "«alertas» recoge contradicciones, respuestas inverosímiles, bromas, temas ajenos o puntos que una persona debería revisar. «seguimiento» propone en una frase qué revisar o hacer después.\n\n"+
   (o.contexto?"CONTEXTO:\n"+o.contexto+"\n\n":"")+(o.extra?o.extra+"\n\n":"")+"TRANSCRIPCIÓN:\n"+trans;
  const {datos:r,modelo}=await llamaTexto(o.modelo,o.clave,prompt,SCHEMA);
  const pers=norm(o.turnos.filter(x=>x.quien===(o.quienPersona||"Persona")).map(x=>x.texto).join(" "));
  r.citas=(r.citas||[]).map(c=>({t:c,lit:norm(c).length>0&&pers.includes(norm(c))}));
  return {informe:r,modelo};
}

root.InformeSwiss={construyeMd,construyeHtml,descarga,pideInforme,llamaTexto,slug,norm,esc,AVISO};
})(typeof window!=="undefined"?window:globalThis);
