(function () {
  "use strict";

  var fmt = function (n) {
    return "$" + Math.round(n).toLocaleString("es-CL");
  };

  /* ---------- Demo de la cuenta ---------- */

  var TOTAL = 47400;

  // "shared" = entre cuántas personas se fracciona el plato
  var DISHES = [
    { name: "Hamburguesa Clásica", price: 11900, shared: 1 },
    { name: "Hamburguesa Clásica", price: 11900, shared: 1 },
    { name: "Papas Trufadas", price: 8900, shared: 2, note: "Para compartir, se fracciona en 2" },
    { name: "Limonada de menta", price: 3900, shared: 1 },
    { name: "Limonada de menta", price: 3900, shared: 1 },
    { name: "Brownie con Helado", price: 6900, shared: 1 }
  ];

  var demo = document.getElementById("demo");
  if (demo) {
    var list = document.getElementById("dishes");
    var peopleEl = document.getElementById("people");
    var tipBox = document.getElementById("tip");
    var tipAmount = document.getElementById("tip-amount");
    var partEl = document.getElementById("part");
    var payBtn = document.getElementById("pay");
    var segs = demo.querySelectorAll(".seg");

    var state = { mode: "equal", people: 4, picked: {} };
    var payTimer = null;

    DISHES.forEach(function (d, i) {
      var li = document.createElement("li");
      var label = document.createElement("label");
      label.className = "dish";

      var input = document.createElement("input");
      input.type = "checkbox";
      input.setAttribute("aria-label", "Incluir " + d.name + " en mi parte");
      input.addEventListener("change", function () {
        state.picked[i] = input.checked;
        render();
      });

      var name = document.createElement("span");
      name.className = "dish-name";
      name.textContent = d.name;
      if (d.note) {
        var small = document.createElement("small");
        small.textContent = d.note;
        name.appendChild(small);
      }

      var price = document.createElement("span");
      price.className = "dish-price";
      price.textContent = fmt(d.price);

      label.appendChild(input);
      label.appendChild(name);
      label.appendChild(price);
      li.appendChild(label);
      list.appendChild(li);
    });

    function baseAmount() {
      if (state.mode === "equal") return TOTAL / state.people;
      return DISHES.reduce(function (sum, d, i) {
        return state.picked[i] ? sum + d.price / d.shared : sum;
      }, 0);
    }

    function render() {
      var base = baseAmount();
      var tip = tipBox.checked ? Math.round(base * 0.1) : 0;
      var total = Math.round(base) + tip;

      peopleEl.textContent = state.people;
      tipAmount.textContent = fmt(tip);
      partEl.textContent = fmt(total);

      if (!payBtn.classList.contains("is-done")) {
        payBtn.textContent = total > 0 ? "Pagar " + fmt(total) : "Marca lo que consumiste";
        payBtn.disabled = total <= 0;
      }
    }

    segs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.mode = btn.getAttribute("data-mode");
        demo.setAttribute("data-mode", state.mode);
        segs.forEach(function (s) {
          var on = s === btn;
          s.classList.toggle("is-on", on);
          s.setAttribute("aria-pressed", on ? "true" : "false");
        });
        render();
      });
    });

    document.getElementById("minus").addEventListener("click", function () {
      if (state.people > 1) { state.people -= 1; render(); }
    });

    document.getElementById("plus").addEventListener("click", function () {
      if (state.people < 12) { state.people += 1; render(); }
    });

    tipBox.addEventListener("change", render);

    payBtn.addEventListener("click", function () {
      if (payBtn.disabled) return;
      payBtn.classList.add("is-done");
      payBtn.textContent = "¡Pago realizado!";
      clearTimeout(payTimer);
      payTimer = setTimeout(function () {
        payBtn.classList.remove("is-done");
        render();
      }, 2200);
    });

    render();
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
