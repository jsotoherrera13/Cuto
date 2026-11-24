(function () {
  "use strict";

  var fmt = function (n) {
    return "$" + Math.round(n).toLocaleString("es-CL");
  };

  /* ---------- Demo de la cuenta ---------- */

  const DISHES = [
    {name:"Hamburguesa Clásica",price:11900},{name:"Hamburguesa Clásica",price:11900},
    {name:"Papas Trufadas",price:8900},{name:"Limonada de menta",price:3900},
    {name:"Limonada de menta",price:3900},{name:"Brownie con Helado",price:6900}
  ];
  const TOTAL=DISHES.reduce((sum,d)=>sum+d.price,0);
  const get=id=>document.getElementById(id);
  function calculate(state){
    if(state.mode==="all")return TOTAL;
    if(state.mode==="free")return Math.max(0,Math.min(TOTAL,Math.round(Number(state.free)||0)));
    if(state.mode==="mine")return DISHES.reduce((sum,d,i)=>{const p=state.picked[i];return sum+(p?Math.round(d.price*p.take/p.of):0)},0);
    return Math.round(TOTAL/state.people);
  }
  const demo=get("demo");
  if(demo){
    const list=get("dishes"),pay=get("pay"),state={mode:"equal",people:4,picked:{},free:0,tip:10};
    const buttons=Array.from(demo.querySelectorAll(".seg"));
    let timer=null;
    const controls=[];
    function create(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
    function select(label,from,to,value,onchange){
      const el=create("select");el.setAttribute("aria-label",label);
      for(let n=from;n<=to;n++){const o=create("option","",String(n));o.value=String(n);el.append(o)}
      el.value=String(value);el.addEventListener("change",()=>onchange(Number(el.value)));return el
    }
    DISHES.forEach((d,i)=>{
      const li=create("li"),label=create("label","dish"),box=create("input"),name=create("span","dish-name",d.name),price=create("span","dish-price",fmt(d.price)),fraction=create("div","fraction-panel");
      box.type="checkbox";box.setAttribute("aria-label","Seleccionar "+d.name+" "+(i+1));
      box.addEventListener("change",()=>{if(box.checked)state.picked[i]={of:1,take:1};else delete state.picked[i];updateFraction(i);render()});
      label.append(box,name,price);li.append(label,fraction);list.append(li);
      controls.push({fraction,box});
    });
    function updateFraction(i){
      const p=state.picked[i],f=controls[i].fraction;
      f.replaceChildren();f.hidden=!p;
      if(!p)return;
      const totalLabel=create("label","","Dividir en");
      const of=select("Fracciones totales de "+DISHES[i].name,1,8,p.of,n=>{p.of=n;p.take=1;updateFraction(i);render()});
      totalLabel.append(of);
      const takeLabel=create("label","","Fracciones que pago");
      const take=select("Mis fracciones de "+DISHES[i].name,1,p.of,p.take,n=>{p.take=n;updateFraction(i);render()});
      takeLabel.append(take);f.append(totalLabel,takeLabel,create("strong","fraction-total","Tu parte: "+fmt(Math.round(DISHES[i].price*p.take/p.of))));
    }
    function render(){
      const base=calculate(state),tip=Math.round(base*state.tip/100),total=base+tip;
      get("demo-full").textContent=fmt(TOTAL);
      get("people").textContent=state.people;
      get("base-amount").textContent=fmt(base);
      get("tip-label").textContent="Propina voluntaria ("+state.tip+"%)";
      get("tip-amount").textContent=fmt(tip);
      get("part").textContent=fmt(total);
      get("free-row").hidden=state.mode!=="free";
      get("stepper-row").hidden=state.mode!=="equal";
      get("invite-note").hidden=state.mode!=="all";
      pay.textContent=total>0?"Simular pago "+fmt(total):"Selecciona un consumo o monto";
      pay.disabled=total<=0;
    }
    function refresh(){clearTimeout(timer);pay.classList.remove("is-done");render()}
    buttons.forEach(btn=>btn.addEventListener("click",()=>{
      state.mode=btn.dataset.mode;demo.dataset.mode=state.mode;
      buttons.forEach(b=>{b.classList.toggle("is-on",b===btn);b.setAttribute("aria-pressed",String(b===btn))});
      refresh();
    }));
    get("minus").addEventListener("click",()=>{state.people=Math.max(1,state.people-1);refresh()});
    get("plus").addEventListener("click",()=>{state.people=Math.min(20,state.people+1);refresh()});
    get("free-amount").addEventListener("input",e=>{state.free=e.target.value;refresh()});
    get("free-amount").addEventListener("change",e=>{state.free=Math.max(0,Math.min(TOTAL,Math.round(Number(e.target.value)||0)));e.target.value=state.free;refresh()});
    get("tip-rate").addEventListener("change",e=>{state.tip=Number(e.target.value);refresh()});
    pay.addEventListener("click",()=>{if(pay.disabled)return;pay.classList.add("is-done");pay.textContent="¡Pago simulado realizado!";pay.disabled=true;clearTimeout(timer);timer=setTimeout(refresh,2200)});
    controls.forEach((_,i)=>updateFraction(i));render();
  }

  /* ---------- Mapa de sala ---------- */

  // Estados de ejemplo: free | pending | paid. "left" es lo que falta por pagar.
  var TABLES = [
    { n: 1, state: "paid" },
    { n: 2, state: "free" },
    { n: 3, state: "pending", left: 15200 },
    { n: 4, state: "free" },
    { n: 5, state: "paid" },
    { n: 6, state: "pending", left: 8900 },
    { n: 7, state: "free" },
    { n: 8, state: "paid" },
    { n: 9, state: "pending", left: 31450 },
    { n: 10, state: "free" },
    { n: 11, state: "paid" },
    { n: 12, state: "pending", left: 11850, extra: " Ya pagaron 3 de 4 personas." }
  ];

  var LABELS = { free: "libre", pending: "por pagar", paid: "pagada" };

  var grid = document.getElementById("tables");
  var note = document.getElementById("floor-note");

  if (grid && note) {
    var buttons = [];

    TABLES.forEach(function (t) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "table";
      btn.setAttribute("data-state", t.state);
      btn.setAttribute("aria-pressed", "false");
      btn.setAttribute("aria-label", "Mesa " + t.n + ", " + LABELS[t.state]);

      var num = document.createElement("b");
      num.textContent = t.n;
      var lab = document.createElement("span");
      lab.textContent = LABELS[t.state];

      btn.appendChild(num);
      btn.appendChild(lab);

      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");

        if (t.state === "pending") {
          note.textContent = "Mesa " + t.n + ": quedan " + fmt(t.left) + " por pagar." + (t.extra || "") +
            " El panel no deja cerrarla hasta que el saldo llegue a cero.";
        } else if (t.state === "paid") {
          note.textContent = "Mesa " + t.n + ": cuenta pagada completa. Ya se puede cerrar.";
        } else {
          note.textContent = "Mesa " + t.n + ": libre, lista para recibir clientes.";
        }
      });

      buttons.push(btn);
      grid.appendChild(btn);
    });
  }
})();
