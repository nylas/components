(function (te, W) {
  typeof exports == "object" && typeof module != "undefined"
    ? (module.exports = W())
    : typeof define == "function" && define.amd
    ? define(W)
    : ((te = typeof globalThis != "undefined" ? globalThis : te || self),
      (te.app = W()));
})(this, function () {
  "use strict";
  const te = window.customElements.define.bind(window.customElements);
  window.customElements.define = (e, ...t) => {
    if (!customElements.get(e)) return te(e, ...t);
  };
  function W() {}
  function ke(e) {
    return e();
  }
  function ye() {
    return Object.create(null);
  }
  function Z(e) {
    e.forEach(ke);
  }
  function ze(e) {
    return typeof e == "function";
  }
  function Le(e, t) {
    return e != e
      ? t == t
      : e !== t || (e && typeof e == "object") || typeof e == "function";
  }
  function Pe(e) {
    return Object.keys(e).length === 0;
  }
  function se(e) {
    return e == null ? "" : e;
  }
  let ie = !1;
  function Oe() {
    ie = !0;
  }
  function Be() {
    ie = !1;
  }
  function Ue(e, t, l, a) {
    for (; e < t; ) {
      const d = e + ((t - e) >> 1);
      l(d) <= a ? (e = d + 1) : (t = d);
    }
    return e;
  }
  function Je(e) {
    if (e.hydrate_init) return;
    e.hydrate_init = !0;
    const t = e.childNodes,
      l = new Int32Array(t.length + 1),
      a = new Int32Array(t.length);
    l[0] = -1;
    let d = 0;
    for (let n = 0; n < t.length; n++) {
      const s = t[n].claim_order,
        i = Ue(1, d + 1, (h) => t[l[h]].claim_order, s) - 1;
      a[n] = l[i] + 1;
      const v = i + 1;
      (l[v] = n), (d = Math.max(v, d));
    }
    const p = [],
      r = [];
    let u = t.length - 1;
    for (let n = l[d] + 1; n != 0; n = a[n - 1]) {
      for (p.push(t[n - 1]); u >= n; u--) r.push(t[u]);
      u--;
    }
    for (; u >= 0; u--) r.push(t[u]);
    p.reverse(), r.sort((n, s) => n.claim_order - s.claim_order);
    for (let n = 0, s = 0; n < r.length; n++) {
      for (; s < p.length && r[n].claim_order >= p[s].claim_order; ) s++;
      const i = s < p.length ? p[s] : null;
      e.insertBefore(r[n], i);
    }
  }
  function f(e, t) {
    ie
      ? (Je(e),
        (e.actual_end_child === void 0 ||
          (e.actual_end_child !== null &&
            e.actual_end_child.parentElement !== e)) &&
          (e.actual_end_child = e.firstChild),
        t !== e.actual_end_child
          ? e.insertBefore(t, e.actual_end_child)
          : (e.actual_end_child = t.nextSibling))
      : t.parentNode !== e && e.appendChild(t);
  }
  function X(e, t, l) {
    ie && !l
      ? f(e, t)
      : (t.parentNode !== e || (l && t.nextSibling !== l)) &&
        e.insertBefore(t, l || null);
  }
  function q(e) {
    e.parentNode.removeChild(e);
  }
  function k(e) {
    return document.createElement(e);
  }
  function O(e) {
    return document.createTextNode(e);
  }
  function j() {
    return O(" ");
  }
  function we() {
    return O("");
  }
  function K(e, t, l, a) {
    return e.addEventListener(t, l, a), () => e.removeEventListener(t, l, a);
  }
  function y(e, t, l) {
    l == null
      ? e.removeAttribute(t)
      : e.getAttribute(t) !== l && e.setAttribute(t, l);
  }
  function qe(e) {
    return Array.from(e.childNodes);
  }
  function Q(e, t) {
    (t = "" + t), e.wholeText !== t && (e.data = t);
  }
  function oe(e, t) {
    for (let l = 0; l < e.options.length; l += 1) {
      const a = e.options[l];
      if (a.__value === t) {
        a.selected = !0;
        return;
      }
    }
  }
  function $(e, t, l) {
    e.classList[l ? "add" : "remove"](t);
  }
  let Me;
  function ae(e) {
    Me = e;
  }
  const le = [],
    re = [],
    ce = [],
    De = [],
    xe = Promise.resolve();
  let pe = !1;
  function He() {
    pe || ((pe = !0), xe.then(Se));
  }
  function Re() {
    return He(), xe;
  }
  function be(e) {
    ce.push(e);
  }
  let ge = !1;
  const ve = new Set();
  function Se() {
    if (!ge) {
      ge = !0;
      do {
        for (let e = 0; e < le.length; e += 1) {
          const t = le[e];
          ae(t), We(t.$$);
        }
        for (ae(null), le.length = 0; re.length; ) re.pop()();
        for (let e = 0; e < ce.length; e += 1) {
          const t = ce[e];
          ve.has(t) || (ve.add(t), t());
        }
        ce.length = 0;
      } while (le.length);
      for (; De.length; ) De.pop()();
      (pe = !1), (ge = !1), ve.clear();
    }
  }
  function We(e) {
    if (e.fragment !== null) {
      e.update(), Z(e.before_update);
      const t = e.dirty;
      (e.dirty = [-1]),
        e.fragment && e.fragment.p(e.ctx, t),
        e.after_update.forEach(be);
    }
  }
  const Xe = new Set();
  function Te(e, t) {
    e && e.i && (Xe.delete(e), e.i(t));
  }
  function _e(e, t) {
    e.d(1), t.delete(e.key);
  }
  function he(e, t, l, a, d, p, r, u, n, s, i, v) {
    let h = e.length,
      _ = p.length,
      c = h;
    const M = {};
    for (; c--; ) M[e[c].key] = c;
    const S = [],
      N = new Map(),
      T = new Map();
    for (c = _; c--; ) {
      const w = v(d, p, c),
        x = l(w);
      let H = r.get(x);
      H ? a && H.p(w, t) : ((H = s(x, w)), H.c()),
        N.set(x, (S[c] = H)),
        x in M && T.set(x, Math.abs(c - M[x]));
    }
    const C = new Set(),
      J = new Set();
    function E(w) {
      Te(w, 1), w.m(u, i), r.set(w.key, w), (i = w.first), _--;
    }
    for (; h && _; ) {
      const w = S[_ - 1],
        x = e[h - 1],
        H = w.key,
        L = x.key;
      w === x
        ? ((i = w.first), h--, _--)
        : N.has(L)
        ? !r.has(H) || C.has(H)
          ? E(w)
          : J.has(L)
          ? h--
          : T.get(H) > T.get(L)
          ? (J.add(H), E(w))
          : (C.add(L), h--)
        : (n(x, r), h--);
    }
    for (; h--; ) {
      const w = e[h];
      N.has(w.key) || n(w, r);
    }
    for (; _; ) E(S[_ - 1]);
    return S;
  }
  function Ge(e, t, l, a) {
    const { fragment: d, on_mount: p, on_destroy: r, after_update: u } = e.$$;
    d && d.m(t, l),
      a ||
        be(() => {
          const n = p.map(ke).filter(ze);
          r ? r.push(...n) : Z(n), (e.$$.on_mount = []);
        }),
      u.forEach(be);
  }
  function Ke(e, t) {
    const l = e.$$;
    l.fragment !== null &&
      (Z(l.on_destroy),
      l.fragment && l.fragment.d(t),
      (l.on_destroy = l.fragment = null),
      (l.ctx = []));
  }
  function Qe(e, t) {
    e.$$.dirty[0] === -1 && (le.push(e), He(), e.$$.dirty.fill(0)),
      (e.$$.dirty[(t / 31) | 0] |= 1 << t % 31);
  }
  function Ve(e, t, l, a, d, p, r = [-1]) {
    const u = Me;
    ae(e);
    const n = (e.$$ = {
      fragment: null,
      ctx: null,
      props: p,
      update: W,
      not_equal: d,
      bound: ye(),
      on_mount: [],
      on_destroy: [],
      on_disconnect: [],
      before_update: [],
      after_update: [],
      context: new Map(u ? u.$$.context : t.context || []),
      callbacks: ye(),
      dirty: r,
      skip_bound: !1,
    });
    let s = !1;
    if (
      ((n.ctx = l
        ? l(e, t.props || {}, (i, v, ...h) => {
            const _ = h.length ? h[0] : v;
            return (
              n.ctx &&
                d(n.ctx[i], (n.ctx[i] = _)) &&
                (!n.skip_bound && n.bound[i] && n.bound[i](_), s && Qe(e, i)),
              v
            );
          })
        : []),
      n.update(),
      (s = !0),
      Z(n.before_update),
      (n.fragment = a ? a(n.ctx) : !1),
      t.target)
    ) {
      if (t.hydrate) {
        Oe();
        const i = qe(t.target);
        n.fragment && n.fragment.l(i), i.forEach(q);
      } else n.fragment && n.fragment.c();
      t.intro && Te(e.$$.fragment),
        Ge(e, t.target, t.anchor, t.customElement),
        Be(),
        Se();
    }
    ae(u);
  }
  class Ze {
    $destroy() {
      Ke(this, 1), (this.$destroy = W);
    }
    $on(t, l) {
      const a = this.$$.callbacks[t] || (this.$$.callbacks[t] = []);
      return (
        a.push(l),
        () => {
          const d = a.indexOf(l);
          d !== -1 && a.splice(d, 1);
        }
      );
    }
    $set(t) {
      this.$$set &&
        !Pe(t) &&
        ((this.$$.skip_bound = !0), this.$$set(t), (this.$$.skip_bound = !1));
    }
  }
  function $e() {
    var e = k("style");
    (e.id = "svelte-9gb56p-style"),
      (e.textContent =
        ".datepicker.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p{font-family:var(--font);width:100%;font-size:var(--font-size);background:var(--background);font-family:sans-serif;font-size:14px}.datepicker-wrapper.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p{padding:1rem}.datepicker-dates.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p{display:flex;flex-direction:column}.label-days.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p{flex:1;display:flex;flex-wrap:wrap}.datepicker-header.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p{padding:10px;color:var(--text);margin:0px}.datepicker-controls.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p{display:flex;align-items:center;justify-content:space-between;padding:10px}.datepicker-btn.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p{height:31px;width:31px;background:var(--background);font-size:18px;cursor:pointer;font-weight:700;border-radius:50px;border:none;color:var(--text)}.datepicker-btn.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p:hover{background:var(--primary-dark) !important;color:var(--button-active-text)}.datepicker-btn.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p:focus{outline:none}.label-days.svelte-9gb56p>div.svelte-9gb56p.svelte-9gb56p{flex-basis:14.2857142857%;text-align:center}.days.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p{width:100%;display:flex;flex-wrap:wrap}.label.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p{color:var(--text-light);font-size:10px}.current.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p{font-weight:700}.current-month.svelte-9gb56p h3.svelte-9gb56p.svelte-9gb56p{color:var(--text);margin:0px}.selected.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p{background:var(--primary) !important;color:var(--button-active-text) !important;font-weight:700}.days.svelte-9gb56p div.svelte-9gb56p.svelte-9gb56p{flex-basis:14.2857142857%;text-align:center;margin-top:3px;box-sizing:border-box;margin-bottom:3px}.days.svelte-9gb56p div.svelte-9gb56p button.svelte-9gb56p{border-radius:50px;background:var(--background);color:var(--text);width:30px;font-size:12px;font-weight:500;height:30px;padding:0;text-align:center;cursor:pointer;border:none}.days.svelte-9gb56p div.svelte-9gb56p button.svelte-9gb56p:focus{outline:0}.days.svelte-9gb56p div.svelte-9gb56p button.svelte-9gb56p:hover{background:var(--primary-dark);color:var(--button-active-text) !important}.days.svelte-9gb56p div.svelte-9gb56p button.svelte-9gb56p:disabled{color:var(--text-light);opacity:0.6;cursor:not-allowed}.timepicker.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p{display:flex;justify-content:space-between;align-items:center;padding:10px 10px}.timepicker.svelte-9gb56p div.svelte-9gb56p.svelte-9gb56p{display:flex}.timepicker.svelte-9gb56p p.svelte-9gb56p.svelte-9gb56p{margin:0;color:var(--text-light)}.picker.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p{border-radius:4px;border:none;color:var(--text);padding:5px 0px;background:var(--background);margin:0px 3px;width:100%}.clock.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p{border-radius:4px;display:flex;width:75px;background:var(--background)}.time.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p{flex:1}.clock-button.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p{border-radius:4px;color:#a4aaad;background:none;cursor:pointer;flex:1;padding:5px 0px;border:none;outline:0}.clock-button.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p:disabled{cursor:not-allowed}.clock-button-active.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p{color:#fff;background:var(--primary)}.tooltip.svelte-9gb56p.svelte-9gb56p.svelte-9gb56p{position:relative;display:inline-block}.tooltip.svelte-9gb56p .tooltiptext.svelte-9gb56p.svelte-9gb56p{opacity:0;visibility:hidden;width:120px;background-color:white;color:#000;text-align:center;border-radius:6px;padding:5px 0;box-shadow:0 1px 10px rgba(0, 0, 0, 0.11), 0 3px 10px rgba(0, 0, 0, 0.12);position:absolute;z-index:1;top:110%;left:50%;margin-left:-60px;transition:opacity 0.3s;transition-delay:1s}.tooltip.svelte-9gb56p:hover .tooltiptext.svelte-9gb56p.svelte-9gb56p{opacity:1;visibility:visible}"),
      f(document.head, e);
  }
  function Ee(e, t, l) {
    const a = e.slice();
    return (a[41] = t[l]), a;
  }
  function Ae(e, t, l) {
    const a = e.slice();
    return (a[44] = t[l]), a;
  }
  function Ne(e, t, l) {
    const a = e.slice();
    return (a[47] = t[l]), a;
  }
  function Ce(e, t) {
    let l,
      a,
      d = t[47].day + "",
      p,
      r,
      u,
      n,
      s;
    function i() {
      return t[24](t[47]);
    }
    return {
      key: e,
      first: null,
      c() {
        (l = k("div")),
          (a = k("button")),
          (p = O(d)),
          (u = j()),
          (a.disabled = r = t[47].isDisabled),
          y(a, "class", "svelte-9gb56p"),
          $(a, "label", !t[47].activeMonth),
          $(a, "current", t[47].activeMonth),
          $(a, "selected", t[47].isSelected),
          y(l, "class", "svelte-9gb56p"),
          (this.first = l);
      },
      m(v, h) {
        X(v, l, h),
          f(l, a),
          f(a, p),
          f(l, u),
          n || ((s = K(a, "click", i)), (n = !0));
      },
      p(v, h) {
        (t = v),
          h[0] & 4 && d !== (d = t[47].day + "") && Q(p, d),
          h[0] & 4 && r !== (r = t[47].isDisabled) && (a.disabled = r),
          h[0] & 4 && $(a, "label", !t[47].activeMonth),
          h[0] & 4 && $(a, "current", t[47].activeMonth),
          h[0] & 4 && $(a, "selected", t[47].isSelected);
      },
      d(v) {
        v && q(l), (n = !1), s();
      },
    };
  }
  function Ie(e) {
    let t,
      l,
      a,
      d,
      p,
      r = [],
      u = new Map(),
      n,
      s,
      i,
      v = [],
      h = new Map(),
      _,
      c,
      M,
      S,
      N,
      T,
      C,
      J,
      E,
      w,
      x,
      H,
      L,
      U,
      R = e[3];
    const P = (b) => b[44];
    for (let b = 0; b < R.length; b += 1) {
      let g = Ae(e, R, b),
        I = P(g);
      u.set(I, (r[b] = je(I, g)));
    }
    let B = e[4];
    const V = (b) => b[41];
    for (let b = 0; b < B.length; b += 1) {
      let g = Ee(e, B, b),
        I = V(g);
      h.set(I, (v[b] = Fe(I, g)));
    }
    return {
      c() {
        (t = k("div")),
          (l = k("p")),
          (l.textContent = "Set time"),
          (a = j()),
          (d = k("div")),
          (p = k("select"));
        for (let b = 0; b < r.length; b += 1) r[b].c();
        (s = j()), (i = k("select"));
        for (let b = 0; b < v.length; b += 1) v[b].c();
        (c = j()),
          (M = k("div")),
          (S = k("button")),
          (N = O("AM")),
          (J = j()),
          (E = k("button")),
          (w = O("PM")),
          y(l, "class", "svelte-9gb56p"),
          y(p, "class", "picker svelte-9gb56p"),
          y(i, "class", "picker svelte-9gb56p"),
          y(d, "class", "time svelte-9gb56p"),
          y(
            S,
            "class",
            (T =
              "" +
              (se(
                e[1].getHours() < 12
                  ? "clock-button clock-button-active"
                  : "clock-button",
              ) +
                " svelte-9gb56p")),
          ),
          (S.disabled = C = e[9]()),
          y(
            E,
            "class",
            (x =
              "" +
              (se(
                e[1].getHours() >= 12
                  ? "clock-button clock-button-active"
                  : "clock-button",
              ) +
                " svelte-9gb56p")),
          ),
          (E.disabled = H = e[10]()),
          y(M, "class", "clock svelte-9gb56p"),
          y(t, "class", "timepicker svelte-9gb56p");
      },
      m(b, g) {
        X(b, t, g), f(t, l), f(t, a), f(t, d), f(d, p);
        for (let I = 0; I < r.length; I += 1) r[I].m(p, null);
        oe(p, e[1].getHours()), e[25](p), f(d, s), f(d, i);
        for (let I = 0; I < v.length; I += 1) v[I].m(i, null);
        oe(i, e[1].getMinutes()),
          e[27](i),
          f(t, c),
          f(t, M),
          f(M, S),
          f(S, N),
          f(M, J),
          f(M, E),
          f(E, w),
          L ||
            ((U = [
              K(p, "blur", e[26]),
              K(i, "blur", e[28]),
              K(S, "click", e[29]),
              K(E, "click", e[30]),
            ]),
            (L = !0));
      },
      p(b, g) {
        g[0] & 10 &&
          ((R = b[3]), (r = he(r, g, P, 1, b, R, u, p, _e, je, null, Ae))),
          g[0] & 2 && n !== (n = b[1].getHours()) && oe(p, b[1].getHours()),
          g[0] & 16 &&
            ((B = b[4]), (v = he(v, g, V, 1, b, B, h, i, _e, Fe, null, Ee))),
          g[0] & 2 && _ !== (_ = b[1].getMinutes()) && oe(i, b[1].getMinutes()),
          g[0] & 2 &&
            T !==
              (T =
                "" +
                (se(
                  b[1].getHours() < 12
                    ? "clock-button clock-button-active"
                    : "clock-button",
                ) +
                  " svelte-9gb56p")) &&
            y(S, "class", T),
          g[0] & 512 && C !== (C = b[9]()) && (S.disabled = C),
          g[0] & 2 &&
            x !==
              (x =
                "" +
                (se(
                  b[1].getHours() >= 12
                    ? "clock-button clock-button-active"
                    : "clock-button",
                ) +
                  " svelte-9gb56p")) &&
            y(E, "class", x),
          g[0] & 1024 && H !== (H = b[10]()) && (E.disabled = H);
      },
      d(b) {
        b && q(t);
        for (let g = 0; g < r.length; g += 1) r[g].d();
        e[25](null);
        for (let g = 0; g < v.length; g += 1) v[g].d();
        e[27](null), (L = !1), Z(U);
      },
    };
  }
  function et(e) {
    let t,
      l = e[44].text + "",
      a,
      d,
      p,
      r;
    return {
      c() {
        (t = k("option")),
          (a = O(l)),
          (d = j()),
          (t.__value = p = e[44].value),
          (t.value = t.__value),
          (t.disabled = r = e[44].disabled);
      },
      m(u, n) {
        X(u, t, n), f(t, a), f(t, d);
      },
      p(u, n) {
        n[0] & 8 && l !== (l = u[44].text + "") && Q(a, l),
          n[0] & 8 &&
            p !== (p = u[44].value) &&
            ((t.__value = p), (t.value = t.__value)),
          n[0] & 8 && r !== (r = u[44].disabled) && (t.disabled = r);
      },
      d(u) {
        u && q(t);
      },
    };
  }
  function tt(e) {
    let t,
      l = e[44].text + "",
      a,
      d,
      p,
      r;
    return {
      c() {
        (t = k("option")),
          (a = O(l)),
          (d = j()),
          (t.__value = p = e[44].value),
          (t.value = t.__value),
          (t.disabled = r = e[44].disabled);
      },
      m(u, n) {
        X(u, t, n), f(t, a), f(t, d);
      },
      p(u, n) {
        n[0] & 8 && l !== (l = u[44].text + "") && Q(a, l),
          n[0] & 8 &&
            p !== (p = u[44].value) &&
            ((t.__value = p), (t.value = t.__value)),
          n[0] & 8 && r !== (r = u[44].disabled) && (t.disabled = r);
      },
      d(u) {
        u && q(t);
      },
    };
  }
  function je(e, t) {
    let l, a, d, p;
    function r(s, i) {
      if (
        ((a == null || i[0] & 10) &&
          (a = s[1].getHours() >= 12 && s[44].value >= 12),
        a)
      )
        return tt;
      if (
        ((d == null || i[0] & 10) &&
          (d = s[1].getHours() < 12 && s[44].value < 12),
        d)
      )
        return et;
    }
    let u = r(t, [-1, -1]),
      n = u && u(t);
    return {
      key: e,
      first: null,
      c() {
        (l = we()), n && n.c(), (p = we()), (this.first = l);
      },
      m(s, i) {
        X(s, l, i), n && n.m(s, i), X(s, p, i);
      },
      p(s, i) {
        (t = s),
          u === (u = r(t, i)) && n
            ? n.p(t, i)
            : (n && n.d(1),
              (n = u && u(t)),
              n && (n.c(), n.m(p.parentNode, p)));
      },
      d(s) {
        s && q(l), n && n.d(s), s && q(p);
      },
    };
  }
  function Fe(e, t) {
    let l,
      a = t[41].text + "",
      d,
      p,
      r,
      u;
    return {
      key: e,
      first: null,
      c() {
        (l = k("option")),
          (d = O(a)),
          (p = j()),
          (l.__value = r = t[41].value),
          (l.value = l.__value),
          (l.disabled = u = t[41].disabled),
          (this.first = l);
      },
      m(n, s) {
        X(n, l, s), f(l, d), f(l, p);
      },
      p(n, s) {
        (t = n),
          s[0] & 16 && a !== (a = t[41].text + "") && Q(d, a),
          s[0] & 16 &&
            r !== (r = t[41].value) &&
            ((l.__value = r), (l.value = l.__value)),
          s[0] & 16 && u !== (u = t[41].disabled) && (l.disabled = u);
      },
      d(n) {
        n && q(l);
      },
    };
  }
  function lt(e) {
    let t,
      l,
      a,
      d,
      p,
      r = (e[0] ? " and time" : "") + "",
      u,
      n,
      s,
      i,
      v,
      h = e[11][e[7]] + "",
      _,
      c,
      M,
      S,
      N,
      T,
      C,
      J,
      E,
      w,
      x,
      H,
      L,
      U,
      R,
      P,
      B,
      V,
      b,
      g = [],
      I = new Map(),
      ue,
      ne,
      de,
      ee = e[2];
    const fe = (D) => D[47];
    for (let D = 0; D < ee.length; D += 1) {
      let F = Ne(e, ee, D),
        G = fe(F);
      I.set(G, (g[D] = Ce(G, F)));
    }
    let Y = e[0] && Ie(e);
    return {
      c() {
        (t = k("div")),
          (l = k("div")),
          (a = k("div")),
          (d = k("h2")),
          (p = O(`Pick a date
        `)),
          (u = O(r)),
          (n = j()),
          (s = k("div")),
          (i = k("div")),
          (v = k("h3")),
          (_ = O(h)),
          (c = j()),
          (M = O(e[8])),
          (S = j()),
          (N = k("div")),
          (T = k("div")),
          (C = k("button")),
          (C.textContent = "\u2039"),
          (J = j()),
          (E = k("span")),
          (E.textContent = "Previous month"),
          (w = j()),
          (x = k("div")),
          (H = k("button")),
          (H.textContent = "\u203A"),
          (L = j()),
          (U = k("span")),
          (U.textContent = "Next month"),
          (R = j()),
          (P = k("div")),
          (B = k("div")),
          (B.innerHTML = `<div class="day label svelte-9gb56p">SUN</div> 
          <div class="day label svelte-9gb56p">MON</div> 
          <div class="day label svelte-9gb56p">TUE</div> 
          <div class="day label svelte-9gb56p">WED</div> 
          <div class="day label svelte-9gb56p">THU</div> 
          <div class="day label svelte-9gb56p">FRI</div> 
          <div class="day label svelte-9gb56p">SAT</div>`),
          (V = j()),
          (b = k("div"));
        for (let D = 0; D < g.length; D += 1) g[D].c();
        (ue = j()),
          Y && Y.c(),
          y(d, "class", "datepicker-header svelte-9gb56p"),
          y(v, "class", "svelte-9gb56p"),
          y(i, "class", "current-month svelte-9gb56p"),
          y(C, "class", "datepicker-btn svelte-9gb56p"),
          y(E, "class", "tooltiptext svelte-9gb56p"),
          y(T, "class", "tooltip svelte-9gb56p"),
          y(H, "class", "datepicker-btn svelte-9gb56p"),
          y(U, "class", "tooltiptext svelte-9gb56p"),
          y(x, "class", "tooltip svelte-9gb56p"),
          y(N, "class", "svelte-9gb56p"),
          y(s, "class", "datepicker-controls svelte-9gb56p"),
          y(B, "class", "label-days svelte-9gb56p"),
          y(b, "id", "calendarDays"),
          y(b, "class", "days svelte-9gb56p"),
          y(P, "class", "datepicker-dates svelte-9gb56p"),
          y(a, "class", "datepicker-wrapper svelte-9gb56p"),
          y(l, "class", "datepicker svelte-9gb56p"),
          y(l, "id", "datepicker"),
          y(t, "class", "svelte-9gb56p");
      },
      m(D, F) {
        X(D, t, F),
          f(t, l),
          f(l, a),
          f(a, d),
          f(d, p),
          f(d, u),
          f(a, n),
          f(a, s),
          f(s, i),
          f(i, v),
          f(v, _),
          f(v, c),
          f(v, M),
          f(s, S),
          f(s, N),
          f(N, T),
          f(T, C),
          f(T, J),
          f(T, E),
          f(N, w),
          f(N, x),
          f(x, H),
          f(x, L),
          f(x, U),
          f(a, R),
          f(a, P),
          f(P, B),
          f(P, V),
          f(P, b);
        for (let G = 0; G < g.length; G += 1) g[G].m(b, null);
        f(P, ue),
          Y && Y.m(P, null),
          ne ||
            ((de = [K(C, "click", e[22]), K(H, "click", e[23])]), (ne = !0));
      },
      p(D, F) {
        F[0] & 1 && r !== (r = (D[0] ? " and time" : "") + "") && Q(u, r),
          F[0] & 128 && h !== (h = D[11][D[7]] + "") && Q(_, h),
          F[0] & 256 && Q(M, D[8]),
          F[0] & 8196 &&
            ((ee = D[2]), (g = he(g, F, fe, 1, D, ee, I, b, _e, Ce, null, Ne))),
          D[0]
            ? Y
              ? Y.p(D, F)
              : ((Y = Ie(D)), Y.c(), Y.m(P, null))
            : Y && (Y.d(1), (Y = null));
      },
      i: W,
      o: W,
      d(D) {
        D && q(t);
        for (let F = 0; F < g.length; F += 1) g[F].d();
        Y && Y.d(), (ne = !1), Z(de);
      },
    };
  }
  const Ye = 8634e4;
  function m(e) {
    let t = "" + (e.getMonth() + 1),
      l = "" + e.getDate(),
      a = e.getFullYear();
    return (
      t.length < 2 && (t = "0" + t),
      l.length < 2 && (l = "0" + l),
      [a, t, l].join("-")
    );
  }
  function nt(e, t, l) {
    let a, d, p, r;
    const u = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let { value: n = new Date() } = t,
      { min: s } = t,
      { max: i } = t,
      { timepicker: v = !1 } = t,
      { change: h } = t,
      _ = new Date(),
      c = new Date(),
      M = [],
      S = [],
      N = [],
      T,
      C;
    const J = () => {
        n && l(1, (c = n)), v && (P(), V());
      },
      E = (o, A, me = 1) => new Date(o, A + me, 0).getDate(),
      w = (o) => {
        l(21, (_ = new Date(_.setMonth(_.getMonth() + o)))), I();
      },
      x = (o) => {
        const A = new Date(o);
        v && (A.setHours(parseInt(T.value)), A.setMinutes(parseInt(C.value))),
          l(1, (c = new Date(A))),
          s && m(s) === m(o) && l(1, (c = new Date(s))),
          i && m(i) === m(o) && l(1, (c = new Date(i))),
          g(),
          v && (B(), b());
      },
      H = () => {
        l(1, (c = new Date(c.setHours(parseInt(T.value))))),
          s && !i
            ? m(s) === m(c) &&
              l(1, (c = new Date(c.setMinutes(s.getMinutes()))))
            : i && !s
            ? m(i) === m(c) &&
              l(1, (c = new Date(c.setMinutes(i.getMinutes()))))
            : i &&
              s &&
              (m(s) === m(c)
                ? l(1, (c = new Date(c.setMinutes(s.getMinutes()))))
                : m(i) === m(c) &&
                  l(1, (c = new Date(c.setMinutes(i.getMinutes()))))),
          b();
      },
      L = () => {
        l(1, (c = new Date(c.setMinutes(parseInt(C.value)))));
      },
      U = (o) => {
        l(1, (c = new Date(c.setHours(c.getHours() + o))));
      },
      R = (o) => (
        (o = o > 12 ? o - 12 : o === 0 ? 12 : o),
        `${o}`.length < 2 ? `0${o}` : `${o}`
      ),
      P = () => {
        const o = [];
        for (let A = 0; A < 24; A++)
          o.push({ value: A, text: R(A), disabled: !1 });
        l(3, (S = o)), B();
      },
      B = () =>
        l(
          3,
          (S = S.map(
            (o) => (
              (o.disabled = !1),
              s && !i
                ? m(s) === m(c) && (o.disabled = o.value < s.getHours())
                : i && !s
                ? m(i) === m(c) && (o.disabled = o.value > i.getHours())
                : i &&
                  s &&
                  (m(s) === m(c)
                    ? (o.disabled = o.value < s.getHours())
                    : m(i) === m(c) && (o.disabled = o.value > i.getHours())),
              o
            ),
          )),
        ),
      V = () => {
        const o = [];
        for (let A = 0; A < 60; A++)
          o.push({
            value: A,
            text: `${A}`.length < 2 ? `0${A}` : `${A}`,
            disabled: !1,
          });
        l(4, (N = o)), b();
      },
      b = () =>
        l(
          4,
          (N = N.map(
            (o) => (
              (o.disabled = !1),
              s && !i
                ? m(s) === m(c) &&
                  c.getHours() === s.getHours() &&
                  (o.disabled = o.value < s.getMinutes())
                : i && !s
                ? m(i) === m(c) &&
                  c.getHours() === i.getHours() &&
                  (o.disabled = o.value > i.getMinutes())
                : i &&
                  s &&
                  (m(s) === m(c) && c.getHours() === s.getHours()
                    ? (o.disabled = o.value < s.getMinutes())
                    : m(i) === m(c) &&
                      c.getHours() === i.getHours() &&
                      (o.disabled = o.value > i.getMinutes())),
              o
            ),
          )),
        ),
      g = () =>
        l(
          2,
          (M = M.map(
            (o) => (
              s && !i && (o.isDisabled = o.date.getTime() + Ye < s.getTime()),
              i && !s && (o.isDisabled = o.date.getTime() > i.getTime()),
              i &&
                s &&
                (o.isDisabled =
                  o.date.getTime() + Ye < s.getTime() ||
                  o.date.getTime() > i.getTime()),
              (o.isSelected = m(o.date) === m(c) && !o.isDisabled),
              o
            ),
          )),
        ),
      I = () => {
        l(2, (M = [])), l(21, (_ = new Date(_.setDate(1))));
        const o = E(_.getFullYear(), _.getMonth()),
          A = E(_.getFullYear(), _.getMonth(), 0);
        for (let z = _.getDay(); z > 0; z--)
          l(
            2,
            (M = [
              ...M,
              {
                day: A - z + 1,
                activeMonth: !1,
                date: new Date(_.getFullYear(), _.getMonth() - 1, A - z + 1),
              },
            ]),
          );
        for (let z = 1; z <= o; z++)
          l(
            2,
            (M = [
              ...M,
              {
                day: z,
                activeMonth: !0,
                date: new Date(_.getFullYear(), _.getMonth(), z),
              },
            ]),
          );
        const me = 42 - M.length;
        for (let z = 1; z <= me; z++)
          l(
            2,
            (M = [
              ...M,
              {
                day: z,
                activeMonth: !1,
                date: new Date(_.getFullYear(), _.getMonth() + 1, z),
              },
            ]),
          );
        g();
      };
    I();
    const ue = () => w(-1),
      ne = () => w(1),
      de = (o) => x(o.date);
    function ee(o) {
      re[o ? "unshift" : "push"](() => {
        (T = o), l(5, T), l(3, S);
      });
    }
    const fe = () => H();
    function Y(o) {
      re[o ? "unshift" : "push"](() => {
        (C = o), l(6, C), l(4, N);
      });
    }
    const D = () => L(),
      F = () => c.getHours() >= 12 && U(-12),
      G = () => c.getHours() < 12 && U(12);
    return (
      (e.$$set = (o) => {
        "value" in o && l(17, (n = o.value)),
          "min" in o && l(18, (s = o.min)),
          "max" in o && l(19, (i = o.max)),
          "timepicker" in o && l(0, (v = o.timepicker)),
          "change" in o && l(20, (h = o.change));
      }),
      (e.$$.update = () => {
        e.$$.dirty[0] & 1048578 &&
          c &&
          h &&
          Re().then(() => {
            h(c);
          }),
          e.$$.dirty[0] & 2097152 && l(7, (a = _.getMonth())),
          e.$$.dirty[0] & 2097152 && l(8, (d = _.getFullYear())),
          e.$$.dirty[0] & 4 &&
            M.filter((o) => o.activeMonth && !o.isDisabled).length,
          e.$$.dirty[0] & 917505 && (n || s || i || v) && (J(), g()),
          e.$$.dirty[0] & 262146 &&
            l(
              9,
              (p = () => {
                if (s) return m(s) === m(c) ? s.getHours() >= 12 : !1;
              }),
            ),
          e.$$.dirty[0] & 524290 &&
            l(
              10,
              (r = () => {
                if (i) return m(i) === m(c) ? i.getHours() < 12 : !1;
              }),
            );
      }),
      [
        v,
        c,
        M,
        S,
        N,
        T,
        C,
        a,
        d,
        p,
        r,
        u,
        w,
        x,
        H,
        L,
        U,
        n,
        s,
        i,
        h,
        _,
        ue,
        ne,
        de,
        ee,
        fe,
        Y,
        D,
        F,
        G,
      ]
    );
  }
  class st extends Ze {
    constructor(t) {
      super();
      document.getElementById("svelte-9gb56p-style") || $e(),
        Ve(
          this,
          t,
          nt,
          lt,
          Le,
          { value: 17, min: 18, max: 19, timepicker: 0, change: 20 },
          [-1, -1],
        );
    }
  }
  return st;
});
//# sourceMappingURL=index.js.map
