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
  alEstado:m=>{const e=$("kwEst");if(e)e.textContent=m}
});
const orig=render;
render=function(){
  orig.apply(this,arguments);
  if(!C.activo) return;
  const nodos=$("log").querySelectorAll(".entry");
  nodos.forEach((n,i)=>{ const e=entries[i]; if(!e||!n.classList.contains("you")||n.childNodes.length<2) return;
    const t=n.childNodes[1]; if(t.nodeType!==3) return; n.replaceChild(C.nodo(e.text,i),t); });
};
const row=document.querySelector(".exportrow"), lab=document.createElement("label");
lab.className="kw-ctl"; lab.innerHTML='<input type="checkbox" id="kwChk" checked> Palabras clave en directo <small id="kwEst"></small>';
(row||$("log").parentNode).appendChild(lab);
$("kwChk").onchange=e=>{C.activo=e.target.checked;render()};
render();
})();
