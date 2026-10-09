(function(){
"use strict";
var F=window.FORMV10;
if(!F)return;

var style=document.createElement("style");
style.id="formV12Style";
style.textContent=
'.timer-clear-v12{height:44px;padding:0 11px!important;display:flex!important;align-items:center;gap:6px;border:1.5px solid var(--ink)!important;background:var(--paper)!important;color:var(--ink)!important;font-size:9px!important;text-transform:uppercase;font-weight:900}.timer-clear-v12 svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2}.reorder-hint-v12{width:100%;font-size:9px;text-transform:uppercase;color:var(--muted);padding:3px 0 0}.exercise.v10.reorder-ready-v12{user-select:none;-webkit-user-select:none}.exercise.v10.dragging-v12{opacity:.82;border:2px solid var(--ink);background:var(--lav);transform:scale(.99);z-index:20;position:relative}.exercise.v10.dragging-v12 .cardtools-v10{pointer-events:none}';
document.head.appendChild(style);

window.formTimerClear=function(){
  if(!current)return;
  var t=F.timerState();
  t.elapsed=0;
  t.running=false;
  t.startedAt=null;
  t.ended=false;
  delete current.durationSec;
  F.draft();
  F.tick();
};

function ensureClear(){
  var controls=document.querySelector(".timer-controls-v11");
  if(!controls||controls.querySelector(".timer-clear-v12"))return;
  var b=document.createElement("button");
  b.type="button";
  b.className="btn timer-clear-v12";
  b.setAttribute("aria-label","Clear session timer");
  b.title="Clear";
  b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11a8 8 0 1 1 2.3 5.7"></path><path d="M4 5v6h6"></path></svg><span>Clear</span>';
  b.addEventListener("click",window.formTimerClear);
  controls.appendChild(b);
}

var oldEnsure=F.ensureTools;
F.ensureTools=function(){
  oldEnsure();
  ensureClear();
};

function cards(){
  return Array.prototype.slice.call(document.querySelectorAll("#exerciseList .exercise.v10"));
}
function allFolded(){
  var a=cards();
  return a.length>1 && a.every(function(c){return c.classList.contains("collapsed")});
}
function syncOrder(){
  if(!current)return;
  current.ids=cards().map(function(c){return c.dataset.cardId}).filter(Boolean);
  F.renumber();
  F.draft();
}
function updateHint(){
  var tools=document.getElementById("sessionV10Tools");
  if(!tools)return;
  var hint=document.getElementById("reorderHintV12");
  var yes=allFolded();
  cards().forEach(function(c){c.classList.toggle("reorder-ready-v12",yes)});
  if(yes){
    if(!hint){
      hint=document.createElement("div");
      hint.id="reorderHintV12";
      hint.className="reorder-hint-v12";
      hint.textContent="Hold an exercise, then drag it up or down to reorder.";
      tools.appendChild(hint);
    }
  }else if(hint){
    hint.remove();
  }
}
function moveCard(card,y){
  var list=document.getElementById("exerciseList");
  if(!list)return;
  var others=cards().filter(function(c){return c!==card});
  var before=null;
  for(var i=0;i<others.length;i++){
    var r=others[i].getBoundingClientRect();
    if(y<r.top+r.height/2){before=others[i];break}
  }
  if(before)list.insertBefore(card,before); else list.appendChild(card);
  F.renumber();
}
function autoScroll(y){
  var edge=95,step=12;
  if(y<edge)window.scrollBy(0,-step);
  else if(y>window.innerHeight-edge)window.scrollBy(0,step);
}
function setupTouchDrag(){
  var list=document.getElementById("exerciseList");
  if(!list||list.dataset.v12Drag==="1")return;
  list.dataset.v12Drag="1";
  var candidate=null,dragging=null,timer=null,startY=0,startX=0;

  function cancelTimer(){if(timer){clearTimeout(timer);timer=null}}
  list.addEventListener("touchstart",function(e){
    if(!allFolded()||e.touches.length!==1)return;
    if(e.target.closest("button,a,input,select,textarea"))return;
    var card=e.target.closest(".exercise.v10.collapsed");
    if(!card)return;
    candidate=card;
    startY=e.touches[0].clientY;
    startX=e.touches[0].clientX;
    cancelTimer();
    timer=setTimeout(function(){
      if(!candidate)return;
      dragging=candidate;
      dragging.classList.add("dragging-v12");
      if(navigator.vibrate){try{navigator.vibrate(25)}catch(err){}}
    },260);
  },{passive:true});

  list.addEventListener("touchmove",function(e){
    if(e.touches.length!==1)return;
    var t=e.touches[0];
    if(!dragging){
      if(candidate&&(Math.abs(t.clientY-startY)>8||Math.abs(t.clientX-startX)>8)){
        cancelTimer();candidate=null;
      }
      return;
    }
    e.preventDefault();
    moveCard(dragging,t.clientY);
    autoScroll(t.clientY);
  },{passive:false});

  function finish(){
    cancelTimer();
    if(dragging){
      dragging.classList.remove("dragging-v12");
      syncOrder();
    }
    candidate=null;dragging=null;
  }
  list.addEventListener("touchend",finish,{passive:true});
  list.addEventListener("touchcancel",finish,{passive:true});

  var mouseDrag=null;
  list.addEventListener("mousedown",function(e){
    if(!allFolded()||e.button!==0||e.target.closest("button,a,input,select,textarea"))return;
    var card=e.target.closest(".exercise.v10.collapsed");
    if(!card)return;
    mouseDrag=card;mouseDrag.classList.add("dragging-v12");
    e.preventDefault();
  });
  window.addEventListener("mousemove",function(e){
    if(!mouseDrag)return;
    moveCard(mouseDrag,e.clientY);
    autoScroll(e.clientY);
  });
  window.addEventListener("mouseup",function(){
    if(!mouseDrag)return;
    mouseDrag.classList.remove("dragging-v12");
    syncOrder();
    mouseDrag=null;
  });
}

var oldEnhance=F.enhance;
F.enhance=function(){
  oldEnhance();
  ensureClear();
  setupTouchDrag();
  updateHint();
};

var oldFold=window.formFold;
window.formFold=function(id){
  oldFold(id);
  updateHint();
};
var oldFoldAll=window.formFoldAll;
window.formFoldAll=function(){
  oldFoldAll();
  updateHint();
};
var oldOpenAll=window.formOpenAll;
window.formOpenAll=function(){
  oldOpenAll();
  updateHint();
};

ensureClear();
setupTouchDrag();
updateHint();
})();