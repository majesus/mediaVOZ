/* Live Lab · palabras clave en tiempo real sobre las intervenciones de la persona. Envuelve render() sin modificar su lógica. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
if(!window.Claves||typeof render!=="function") return;
const C=Claves.crea({
  obtenClave:()=>$("key").value.trim(),
  obtenModelo:()=>($("repModel")&&$("repModel").value)||"gemini-flash-latest",
  obtenContexto:()=>{const c=CASES[chosen];return c.brand+" — "+c.title+". "+c.desc},
  alCambiar:()=>render(),
  alEstado:(m,err)=>{const e=$("kwEst");if(!e) return;e.textContent=m;e.className=err?"err":"";e.setAttribute("role","status");
    if(err){const b=document.createElement("button");b.type="button";b.textContent="Reintentar";b.onclick=()=>C.reintenta();e.append(" ",b)}}
});
const orig=render;
render=function(){
  orig.apply(this,arguments);
  if(!C.activo) return;
  const nodos=$("log").querySelectorAll(".entry");
  nodos.forEach((n,i)=>{ const e=entries[i]; if(!e||!n.classList.contains("you")||n.childNodes.length<2) return;
    const t=n.childNodes[1]; if(t.nodeType!==3) return; const cerrada=entries.slice(i+1).some(x=>x.role!=="Sistema"&&x.role!=="Herramienta"); n.replaceChild(C.nodo(e.text,i,cerrada),t); });
};
const row=document.querySelector(".exportrow"), lab=document.createElement("label");
lab.className="kw-ctl"; lab.innerHTML='<input type="checkbox" id="kwChk" checked> Palabras clave en directo <select id="kwMod" aria-label="Modelo de las palabras clave"><option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite (el más barato)</option><option value="gemini-2.5-flash">gemini-2.5-flash</option><option value="gemini-flash-latest">gemini-flash-latest</option><option value="gemini-2.0-flash">gemini-2.0-flash</option></select> <small id="kwEst"></small>';
(row||$("log").parentNode).appendChild(lab);
$("kwMod").onchange=e=>{C.modelo=e.target.value;C.reintenta()};
$("kwChk").onchange=e=>{C.activo=e.target.checked;render()};
render();
})();
