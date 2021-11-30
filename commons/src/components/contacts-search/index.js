(function (J, j) {
  typeof exports == "object" && typeof module != "undefined"
    ? (module.exports = j())
    : typeof define == "function" && define.amd
    ? define(j)
    : ((J = typeof globalThis != "undefined" ? globalThis : J || self),
      (J.app = j()));
})(this, function () {
  "use strict";
  const J = window.customElements.define.bind(window.customElements);
  window.customElements.define = (e, ...t) => {
    if (!customElements.get(e)) return J(e, ...t);
  };
  function j() {}
  function ce(e) {
    return e();
  }
  function fe() {
    return Object.create(null);
  }
  function F(e) {
    e.forEach(ce);
  }
  function Ee(e) {
    return typeof e == "function";
  }
  function Ae(e, t) {
    return e != e
      ? t == t
      : e !== t || (e && typeof e == "object") || typeof e == "function";
  }
  function Se(e) {
    return Object.keys(e).length === 0;
  }
  let Y = !1;
  function Le() {
    Y = !0;
  }
  function Te() {
    Y = !1;
  }
  function Ne(e, t, n, i) {
    for (; e < t; ) {
      const r = e + ((t - e) >> 1);
      n(r) <= i ? (e = r + 1) : (t = r);
    }
    return e;
  }
  function ze(e) {
    if (e.hydrate_init) return;
    e.hydrate_init = !0;
    const t = e.childNodes,
      n = new Int32Array(t.length + 1),
      i = new Int32Array(t.length);
    n[0] = -1;
    let r = 0;
    for (let l = 0; l < t.length; l++) {
      const h = t[l].claim_order,
        a = Ne(1, r + 1, (d) => t[n[d]].claim_order, h) - 1;
      i[l] = n[a] + 1;
      const u = a + 1;
      (n[u] = l), (r = Math.max(u, r));
    }
    const s = [],
      o = [];
    let c = t.length - 1;
    for (let l = n[r] + 1; l != 0; l = i[l - 1]) {
      for (s.push(t[l - 1]); c >= l; c--) o.push(t[c]);
      c--;
    }
    for (; c >= 0; c--) o.push(t[c]);
    s.reverse(), o.sort((l, h) => l.claim_order - h.claim_order);
    for (let l = 0, h = 0; l < o.length; l++) {
      for (; h < s.length && o[l].claim_order >= s[h].claim_order; ) h++;
      const a = h < s.length ? s[h] : null;
      e.insertBefore(o[l], a);
    }
  }
  function v(e, t) {
    Y
      ? (ze(e),
        (e.actual_end_child === void 0 ||
          (e.actual_end_child !== null &&
            e.actual_end_child.parentElement !== e)) &&
          (e.actual_end_child = e.firstChild),
        t !== e.actual_end_child
          ? e.insertBefore(t, e.actual_end_child)
          : (e.actual_end_child = t.nextSibling))
      : t.parentNode !== e && e.appendChild(t);
  }
  function L(e, t, n) {
    Y && !n
      ? v(e, t)
      : (t.parentNode !== e || (n && t.nextSibling !== n)) &&
        e.insertBefore(t, n || null);
  }
  function S(e) {
    e.parentNode.removeChild(e);
  }
  function Ie(e, t) {
    for (let n = 0; n < e.length; n += 1) e[n] && e[n].d(t);
  }
  function b(e) {
    return document.createElement(e);
  }
  function B(e) {
    return document.createTextNode(e);
  }
  function O() {
    return B(" ");
  }
  function Me() {
    return B("");
  }
  function z(e, t, n, i) {
    return e.addEventListener(t, n, i), () => e.removeEventListener(t, n, i);
  }
  function ue(e) {
    return function (t) {
      return t.preventDefault(), e.call(this, t);
    };
  }
  function p(e, t, n) {
    n == null
      ? e.removeAttribute(t)
      : e.getAttribute(t) !== n && e.setAttribute(t, n);
  }
  function je(e) {
    return Array.from(e.childNodes);
  }
  function q(e, t) {
    (t = "" + t), e.wholeText !== t && (e.data = t);
  }
  function Z(e, t) {
    e.value = t == null ? "" : t;
  }
  function P(e, t, n) {
    e.classList[n ? "add" : "remove"](t);
  }
  let ae;
  function x(e) {
    ae = e;
  }
  const Q = [],
    R = [],
    $ = [],
    de = [],
    he = Promise.resolve();
  let ee = !1;
  function me() {
    ee || ((ee = !0), he.then(_e));
  }
  function Be() {
    return me(), he;
  }
  function te(e) {
    $.push(e);
  }
  let ne = !1;
  const ie = new Set();
  function _e() {
    if (!ne) {
      ne = !0;
      do {
        for (let e = 0; e < Q.length; e += 1) {
          const t = Q[e];
          x(t), Oe(t.$$);
        }
        for (x(null), Q.length = 0; R.length; ) R.pop()();
        for (let e = 0; e < $.length; e += 1) {
          const t = $[e];
          ie.has(t) || (ie.add(t), t());
        }
        $.length = 0;
      } while (Q.length);
      for (; de.length; ) de.pop()();
      (ee = !1), (ne = !1), ie.clear();
    }
  }
  function Oe(e) {
    if (e.fragment !== null) {
      e.update(), F(e.before_update);
      const t = e.dirty;
      (e.dirty = [-1]),
        e.fragment && e.fragment.p(e.ctx, t),
        e.after_update.forEach(te);
    }
  }
  const De = new Set();
  function pe(e, t) {
    e && e.i && (De.delete(e), e.i(t));
  }
  function Fe(e, t) {
    e.d(1), t.delete(e.key);
  }
  function qe(e, t, n, i, r, s, o, c, l, h, a, u) {
    let d = e.length,
      _ = s.length,
      k = d;
    const C = {};
    for (; k--; ) C[e[k].key] = k;
    const I = [],
      E = new Map(),
      g = new Map();
    for (k = _; k--; ) {
      const w = u(r, s, k),
        T = n(w);
      let N = o.get(T);
      N ? i && N.p(w, t) : ((N = h(T, w)), N.c()),
        E.set(T, (I[k] = N)),
        T in C && g.set(T, Math.abs(k - C[T]));
    }
    const A = new Set(),
      m = new Set();
    function y(w) {
      pe(w, 1), w.m(c, a), o.set(w.key, w), (a = w.first), _--;
    }
    for (; d && _; ) {
      const w = I[_ - 1],
        T = e[d - 1],
        N = w.key,
        D = T.key;
      w === T
        ? ((a = w.first), d--, _--)
        : E.has(D)
        ? !o.has(N) || A.has(N)
          ? y(w)
          : m.has(D)
          ? d--
          : g.get(N) > g.get(D)
          ? (m.add(N), y(w))
          : (A.add(D), d--)
        : (l(T, o), d--);
    }
    for (; d--; ) {
      const w = e[d];
      E.has(w.key) || l(w, o);
    }
    for (; _; ) y(I[_ - 1]);
    return I;
  }
  function Ke(e, t, n, i) {
    const { fragment: r, on_mount: s, on_destroy: o, after_update: c } = e.$$;
    r && r.m(t, n),
      i ||
        te(() => {
          const l = s.map(ce).filter(Ee);
          o ? o.push(...l) : F(l), (e.$$.on_mount = []);
        }),
      c.forEach(te);
  }
  function Ue(e, t) {
    const n = e.$$;
    n.fragment !== null &&
      (F(n.on_destroy),
      n.fragment && n.fragment.d(t),
      (n.on_destroy = n.fragment = null),
      (n.ctx = []));
  }
  function Ve(e, t) {
    e.$$.dirty[0] === -1 && (Q.push(e), me(), e.$$.dirty.fill(0)),
      (e.$$.dirty[(t / 31) | 0] |= 1 << t % 31);
  }
  function Ge(e, t, n, i, r, s, o = [-1]) {
    const c = ae;
    x(e);
    const l = (e.$$ = {
      fragment: null,
      ctx: null,
      props: s,
      update: j,
      not_equal: r,
      bound: fe(),
      on_mount: [],
      on_destroy: [],
      on_disconnect: [],
      before_update: [],
      after_update: [],
      context: new Map(c ? c.$$.context : t.context || []),
      callbacks: fe(),
      dirty: o,
      skip_bound: !1,
    });
    let h = !1;
    if (
      ((l.ctx = n
        ? n(e, t.props || {}, (a, u, ...d) => {
            const _ = d.length ? d[0] : u;
            return (
              l.ctx &&
                r(l.ctx[a], (l.ctx[a] = _)) &&
                (!l.skip_bound && l.bound[a] && l.bound[a](_), h && Ve(e, a)),
              u
            );
          })
        : []),
      l.update(),
      (h = !0),
      F(l.before_update),
      (l.fragment = i ? i(l.ctx) : !1),
      t.target)
    ) {
      if (t.hydrate) {
        Le();
        const a = je(t.target);
        l.fragment && l.fragment.l(a), a.forEach(S);
      } else l.fragment && l.fragment.c();
      t.intro && pe(e.$$.fragment),
        Ke(e, t.target, t.anchor, t.customElement),
        Te(),
        _e();
    }
    x(c);
  }
  class He {
    $destroy() {
      Ue(this, 1), (this.$destroy = j);
    }
    $on(t, n) {
      const i = this.$$.callbacks[t] || (this.$$.callbacks[t] = []);
      return (
        i.push(n),
        () => {
          const r = i.indexOf(n);
          r !== -1 && i.splice(r, 1);
        }
      );
    }
    $set(t) {
      this.$$set &&
        !Se(t) &&
        ((this.$$.skip_bound = !0), this.$$set(t), (this.$$.skip_bound = !1));
    }
  }
  const Je = (e, t) => {
      let n;
      return function (...r) {
        const s = () => {
          clearTimeout(n), e(...r);
        };
        clearTimeout(n), (n = setTimeout(s, t));
      };
    },
    Qe = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  function Re() {
    var e = b("style");
    (e.id = "svelte-hwkti6-style"),
      (e.textContent =
        ":root{font-family:sans-serif}.contacts-container.svelte-hwkti6.svelte-hwkti6{display:flex;align-items:center;flex-wrap:wrap;padding:0.4rem var(--outer-padding);border-bottom:1px solid var(--border)}.contacts-container.svelte-hwkti6 .svelte-hwkti6:focus{outline:5px auto var(--primary)}.contacts-container.svelte-hwkti6>div.svelte-hwkti6{padding-bottom:0.1rem;padding-right:0.1rem}.contact-item.svelte-hwkti6.svelte-hwkti6{display:inline-flex;background:var(--primary-light);color:var(--primary);align-items:center;border-radius:calc(var(--border-radius) / 2);padding:0.2rem 0.8rem;margin-right:0.25rem;margin-top:2px;margin-bottom:2px}.contact-item.svelte-hwkti6>button.svelte-hwkti6{color:var(--text-secondary);border:none;background:none;padding:2px 4px;font-weight:bold;font-size:13px;cursor:pointer}.contact-item__name.svelte-hwkti6.svelte-hwkti6{color:var(--text-secondary);font-size:12px;padding-right:0.75rem}.dropdown.svelte-hwkti6.svelte-hwkti6{width:100%;position:relative;display:inline-block}.dropdown-content.svelte-hwkti6.svelte-hwkti6{display:block;position:absolute;max-height:350px;background:var(--background);left:calc(var(--outer-padding) / 2);right:calc(var(--outer-padding) / 2);overflow-y:auto;color:var(--text);box-shadow:var(--shadow);z-index:1;border-radius:calc(var(--border-radius) / 2)}.dropdown-item.svelte-hwkti6.svelte-hwkti6{cursor:pointer;padding:var(--outer-padding);font-size:var(--font-size-small)}.dropdown-item.active.svelte-hwkti6.svelte-hwkti6{background-color:var(--primary);color:white}.dropdown-item.active.svelte-hwkti6 .dropdown-item__email.svelte-hwkti6{color:var(--bg) !important}.dropdown-item.selected.svelte-hwkti6.svelte-hwkti6{opacity:0.3}.dropdown-item__name.svelte-hwkti6.svelte-hwkti6{font-weight:bold;display:inline-flex}.dropdown-item__email.svelte-hwkti6.svelte-hwkti6{color:var(--text-light);display:inline-flex;margin-left:0.25rem}.search-field.svelte-hwkti6.svelte-hwkti6{border:none;color:var(--text);background:var(--bg);width:1px}.search-field.svelte-hwkti6.svelte-hwkti6:focus{width:100px}.search-form.svelte-hwkti6.svelte-hwkti6{display:flex;padding-top:0.5rem;padding-bottom:0.5rem;align-items:center}.contacts-results.svelte-hwkti6.svelte-hwkti6{display:flex;align-items:center}.contacts-placeholder.svelte-hwkti6.svelte-hwkti6{font-size:var(--font-size-small);margin-right:10px;min-width:30px;display:flex;color:var(--text-light)}"),
      v(document.head, e);
  }
  function we(e, t, n) {
    const i = e.slice();
    return (i[38] = t[n]), (i[40] = n), i;
  }
  function ke(e, t, n) {
    const i = e.slice();
    return (i[38] = t[n]), i;
  }
  function We(e) {
    let t = e[38].email + "",
      n;
    return {
      c() {
        n = B(t);
      },
      m(i, r) {
        L(i, n, r);
      },
      p(i, r) {
        r[0] & 8 && t !== (t = i[38].email + "") && q(n, t);
      },
      d(i) {
        i && S(n);
      },
    };
  }
  function Xe(e) {
    let t,
      n = e[38].name + "",
      i,
      r,
      s = `<${e[38].email}>`,
      o;
    return {
      c() {
        (t = b("strong")),
          (i = B(n)),
          (r = O()),
          (o = B(s)),
          p(t, "class", "svelte-hwkti6");
      },
      m(c, l) {
        L(c, t, l), v(t, i), L(c, r, l), L(c, o, l);
      },
      p(c, l) {
        l[0] & 8 && n !== (n = c[38].name + "") && q(i, n),
          l[0] & 8 && s !== (s = `<${c[38].email}>`) && q(o, s);
      },
      d(c) {
        c && S(t), c && S(r), c && S(o);
      },
    };
  }
  function ge(e, t) {
    let n, i, r, s, o, c, l;
    function h(_, k) {
      return _[38].name ? Xe : We;
    }
    let a = h(t),
      u = a(t);
    function d() {
      return t[23](t[38]);
    }
    return {
      key: e,
      first: null,
      c() {
        (n = b("div")),
          (i = b("span")),
          u.c(),
          (r = O()),
          (s = b("button")),
          (s.textContent = "\xD7"),
          (o = O()),
          p(i, "class", "contact-item__name svelte-hwkti6"),
          p(s, "type", "button"),
          p(s, "name", "term"),
          p(s, "class", "svelte-hwkti6"),
          p(n, "class", "contact-item svelte-hwkti6"),
          (this.first = n);
      },
      m(_, k) {
        L(_, n, k),
          v(n, i),
          u.m(i, null),
          v(n, r),
          v(n, s),
          v(n, o),
          c || ((l = z(s, "click", d)), (c = !0));
      },
      p(_, k) {
        (t = _),
          a === (a = h(t)) && u
            ? u.p(t, k)
            : (u.d(1), (u = a(t)), u && (u.c(), u.m(i, null)));
      },
      d(_) {
        _ && S(n), u.d(), (c = !1), l();
      },
    };
  }
  function Ye(e) {
    let t, n, i, r;
    return {
      c() {
        (t = b("form")),
          (n = b("input")),
          p(n, "type", "text"),
          p(n, "name", "email"),
          p(n, "autocomplete", "off"),
          p(n, "class", "search-field svelte-hwkti6"),
          p(t, "class", "search-form svelte-hwkti6");
      },
      m(s, o) {
        L(s, t, o),
          v(t, n),
          e[27](n),
          Z(n, e[4]),
          i ||
            ((r = [
              z(n, "keydown", e[15]),
              z(n, "blur", e[28]),
              z(n, "input", e[29]),
              z(t, "submit", ue(e[17])),
            ]),
            (i = !0));
      },
      p(s, o) {
        o[0] & 16 && n.value !== s[4] && Z(n, s[4]);
      },
      d(s) {
        s && S(t), e[27](null), (i = !1), F(r);
      },
    };
  }
  function Ze(e) {
    let t, n, i, r;
    return {
      c() {
        (t = b("form")),
          (n = b("input")),
          p(n, "type", "text"),
          p(n, "name", "email"),
          p(n, "autocomplete", "off"),
          p(n, "class", "search-field svelte-hwkti6"),
          p(t, "class", "search-form svelte-hwkti6");
      },
      m(s, o) {
        L(s, t, o),
          v(t, n),
          e[24](n),
          Z(n, e[4]),
          i ||
            ((r = [
              z(n, "keydown", e[15]),
              z(n, "blur", e[25]),
              z(n, "input", e[26]),
              z(t, "submit", ue(e[17])),
            ]),
            (i = !0));
      },
      p(s, o) {
        o[0] & 16 && n.value !== s[4] && Z(n, s[4]);
      },
      d(s) {
        s && S(t), e[24](null), (i = !1), F(r);
      },
    };
  }
  function ve(e) {
    let t,
      n,
      i = e[9] && !e[7].length && be();
    function r(c, l) {
      return !c[9] && !c[7].length ? xe : Pe;
    }
    let s = r(e),
      o = s(e);
    return {
      c() {
        (t = b("div")),
          i && i.c(),
          (n = O()),
          o.c(),
          p(t, "class", "dropdown-content svelte-hwkti6");
      },
      m(c, l) {
        L(c, t, l), i && i.m(t, null), v(t, n), o.m(t, null);
      },
      p(c, l) {
        c[9] && !c[7].length
          ? i || ((i = be()), i.c(), i.m(t, n))
          : i && (i.d(1), (i = null)),
          s === (s = r(c)) && o
            ? o.p(c, l)
            : (o.d(1), (o = s(c)), o && (o.c(), o.m(t, null)));
      },
      d(c) {
        c && S(t), i && i.d(), o.d();
      },
    };
  }
  function be(e) {
    let t;
    return {
      c() {
        (t = b("p")),
          (t.textContent = "Loading..."),
          p(t, "class", "dropdown-item svelte-hwkti6");
      },
      m(n, i) {
        L(n, t, i);
      },
      d(n) {
        n && S(t);
      },
    };
  }
  function Pe(e) {
    let t,
      n = e[7],
      i = [];
    for (let r = 0; r < n.length; r += 1) i[r] = ye(we(e, n, r));
    return {
      c() {
        for (let r = 0; r < i.length; r += 1) i[r].c();
        t = Me();
      },
      m(r, s) {
        for (let o = 0; o < i.length; o += 1) i[o].m(r, s);
        L(r, t, s);
      },
      p(r, s) {
        if (s[0] & 332160) {
          n = r[7];
          let o;
          for (o = 0; o < n.length; o += 1) {
            const c = we(r, n, o);
            i[o]
              ? i[o].p(c, s)
              : ((i[o] = ye(c)), i[o].c(), i[o].m(t.parentNode, t));
          }
          for (; o < i.length; o += 1) i[o].d(1);
          i.length = n.length;
        }
      },
      d(r) {
        Ie(i, r), r && S(t);
      },
    };
  }
  function xe(e) {
    let t;
    return {
      c() {
        (t = b("p")),
          (t.textContent = "No results found"),
          p(t, "class", "dropdown-item svelte-hwkti6");
      },
      m(n, i) {
        L(n, t, i);
      },
      p: j,
      d(n) {
        n && S(t);
      },
    };
  }
  function $e(e) {
    let t,
      n = e[38].email + "",
      i;
    return {
      c() {
        (t = b("div")),
          (i = B(n)),
          p(t, "class", "dropdown-item__name svelte-hwkti6");
      },
      m(r, s) {
        L(r, t, s), v(t, i);
      },
      p(r, s) {
        s[0] & 128 && n !== (n = r[38].email + "") && q(i, n);
      },
      d(r) {
        r && S(t);
      },
    };
  }
  function et(e) {
    let t,
      n = e[38].name + "",
      i,
      r,
      s,
      o = e[38].email + "",
      c;
    return {
      c() {
        (t = b("div")),
          (i = B(n)),
          (r = O()),
          (s = b("div")),
          (c = B(o)),
          p(t, "class", "dropdown-item__name svelte-hwkti6"),
          p(s, "class", "dropdown-item__email svelte-hwkti6");
      },
      m(l, h) {
        L(l, t, h), v(t, i), L(l, r, h), L(l, s, h), v(s, c);
      },
      p(l, h) {
        h[0] & 128 && n !== (n = l[38].name + "") && q(i, n),
          h[0] & 128 && o !== (o = l[38].email + "") && q(c, o);
      },
      d(l) {
        l && S(t), l && S(r), l && S(s);
      },
    };
  }
  function ye(e) {
    let t, n, i, r;
    function s(a, u) {
      return a[38].name ? et : $e;
    }
    let o = s(e),
      c = o(e);
    function l() {
      return e[30](e[38]);
    }
    function h() {
      return e[31](e[40]);
    }
    return {
      c() {
        (t = b("div")),
          c.c(),
          (n = O()),
          p(t, "class", "dropdown-item svelte-hwkti6"),
          P(t, "active", e[8] === e[40]),
          P(t, "selected", e[18](e[38].email));
      },
      m(a, u) {
        L(a, t, u),
          c.m(t, null),
          v(t, n),
          i || ((r = [z(t, "mousedown", l), z(t, "mouseenter", h)]), (i = !0));
      },
      p(a, u) {
        (e = a),
          o === (o = s(e)) && c
            ? c.p(e, u)
            : (c.d(1), (c = o(e)), c && (c.c(), c.m(t, n))),
          u[0] & 256 && P(t, "active", e[8] === e[40]),
          u[0] & 262272 && P(t, "selected", e[18](e[38].email));
      },
      d(a) {
        a && S(t), c.d(), (i = !1), F(r);
      },
    };
  }
  function tt(e) {
    let t,
      n,
      i,
      r,
      s,
      o,
      c,
      l = [],
      h = new Map(),
      a,
      u,
      d,
      _,
      k = e[3];
    const C = (m) => m[38].email;
    for (let m = 0; m < k.length; m += 1) {
      let y = ke(e, k, m),
        w = C(y);
      h.set(w, (l[m] = ge(w, y)));
    }
    function I(m, y) {
      if (m[1] && !m[3].length) return Ze;
      if (!m[1]) return Ye;
    }
    let E = I(e),
      g = E && E(e),
      A = e[6] && e[2] && ve(e);
    return {
      c() {
        (t = b("div")),
          (n = b("div")),
          (i = b("div")),
          (r = b("div")),
          (s = B(e[0])),
          (o = O()),
          (c = b("div"));
        for (let m = 0; m < l.length; m += 1) l[m].c();
        (a = O()),
          g && g.c(),
          (u = O()),
          A && A.c(),
          p(r, "class", "contacts-placeholder svelte-hwkti6"),
          p(c, "class", "contacts-results-inner svelte-hwkti6"),
          p(i, "class", "contacts-results svelte-hwkti6"),
          p(n, "class", "contacts-container svelte-hwkti6"),
          p(t, "class", "dropdown svelte-hwkti6");
      },
      m(m, y) {
        L(m, t, y), v(t, n), v(n, i), v(i, r), v(r, s), v(i, o), v(i, c);
        for (let w = 0; w < l.length; w += 1) l[w].m(c, null);
        v(n, a),
          g && g.m(n, null),
          v(t, u),
          A && A.m(t, null),
          e[32](t),
          d || ((_ = z(n, "click", e[13])), (d = !0));
      },
      p(m, y) {
        y[0] & 1 && q(s, m[0]),
          y[0] & 2056 &&
            ((k = m[3]), (l = qe(l, y, C, 1, m, k, h, c, Fe, ge, null, ke))),
          E === (E = I(m)) && g
            ? g.p(m, y)
            : (g && g.d(1), (g = E && E(m)), g && (g.c(), g.m(n, null))),
          m[6] && m[2]
            ? A
              ? A.p(m, y)
              : ((A = ve(m)), A.c(), A.m(t, null))
            : A && (A.d(1), (A = null));
      },
      i: j,
      o: j,
      d(m) {
        m && S(t);
        for (let y = 0; y < l.length; y += 1) l[y].d();
        g && g.d(), A && A.d(), e[32](null), (d = !1), _();
      },
    };
  }
  function nt(e, t, n) {
    let i;
    var r =
      (this && this.__awaiter) ||
      function (f, M, K, H) {
        function oe(U) {
          return U instanceof K
            ? U
            : new K(function (X) {
                X(U);
              });
        }
        return new (K || (K = Promise))(function (U, X) {
          function _t(V) {
            try {
              re(H.next(V));
            } catch (se) {
              X(se);
            }
          }
          function pt(V) {
            try {
              re(H.throw(V));
            } catch (se) {
              X(se);
            }
          }
          function re(V) {
            V.done ? U(V.value) : oe(V.value).then(_t, pt);
          }
          re((H = H.apply(f, M || [])).next());
        });
      };
    let { contacts: s } = t,
      { value: o = [] } = t,
      { placeholder: c = "To" } = t,
      { single: l = !1 } = t,
      { change: h } = t,
      { show_dropdown: a = !0 } = t,
      u = [],
      d = "",
      _ = 0,
      k = !1,
      C,
      I,
      E = [],
      g = !1;
    const A = () => {
        Array.isArray(s) && n(22, (E = s)), Array.isArray(o) && n(3, (u = o));
      },
      m = () => [],
      y = (f) => {
        n(9, (k = !0)), n(22, (E = [])), w(f);
      },
      w = Je(
        (f) =>
          r(void 0, void 0, void 0, function* () {
            n(9, (k = !0));
            const M = typeof s == "function" ? s : m;
            try {
              n(22, (E = yield M(f))), n(9, (k = !1));
            } catch (K) {
              n(9, (k = !1));
            }
          }),
        350,
      ),
      T = (f) => {
        n(3, (u = u.filter((M) => M.email !== f))), D();
      },
      N = (f) => {
        if (l && u.length === 1) {
          n(3, (u = [f])), n(6, (g = !1));
          return;
        }
        W(f.email) || n(3, (u = [...u, f])), D();
      },
      D = () => {
        C && (!l || !u.length) && (C.focus(), n(6, (g = !0)));
      },
      G = (f) => {
        setTimeout(() => {
          f.addContact && !i.length && d && le(),
            n(6, (g = !1)),
            n(4, (d = "")),
            C && C.blur();
        }, f.blurIn | 500);
      },
      lt = (f) => {
        D(),
          f.key === "Backspace" &&
            u.length &&
            !d &&
            n(3, (u = u.slice(0, u.length - 1))),
          f.key === "Tab" && le(),
          f.key === "ArrowDown" && E.length && _ <= E.length && n(8, (_ += 1)),
          f.key === "ArrowUp" && E.length && _ != 0 && n(8, (_ -= 1)),
          f.key === "Escape" && E.length && G({});
      },
      Ce = (f) => {
        n(8, (_ = f));
      },
      le = () => {
        (l && u.length === 1) ||
          (i.length &&
            (W(i[_].email) ||
              (n(3, (u = [...u, i[_]])), n(8, (_ = 0)), G({ blurIn: 0 }))),
          !W(d) &&
            d &&
            Qe(d) &&
            (n(3, (u = [...u, { email: d }])),
            n(8, (_ = 0)),
            G({ blurIn: 0 })));
      },
      W = (f) => u.map((M) => M.email).includes(f),
      ot = (f) => T(f.email);
    function rt(f) {
      R[f ? "unshift" : "push"](() => {
        (C = f), n(5, C);
      });
    }
    const st = () => G({ addContact: !0 });
    function ct() {
      (d = this.value), n(4, d);
    }
    function ft(f) {
      R[f ? "unshift" : "push"](() => {
        (C = f), n(5, C);
      });
    }
    const ut = () => G({ addContact: !0 });
    function at() {
      (d = this.value), n(4, d);
    }
    const dt = (f) => N(f),
      ht = (f) => Ce(f);
    function mt(f) {
      R[f ? "unshift" : "push"](() => {
        (I = f), n(10, I);
      });
    }
    return (
      (e.$$set = (f) => {
        "contacts" in f && n(19, (s = f.contacts)),
          "value" in f && n(20, (o = f.value)),
          "placeholder" in f && n(0, (c = f.placeholder)),
          "single" in f && n(1, (l = f.single)),
          "change" in f && n(21, (h = f.change)),
          "show_dropdown" in f && n(2, (a = f.show_dropdown));
      }),
      (e.$$.update = () => {
        e.$$.dirty[0] & 32 &&
          C &&
          (C.setAttribute("tabindex", "-1"),
          C.focus(),
          C.removeAttribute("tabindex")),
          e.$$.dirty[0] & 2097160 &&
            u &&
            h &&
            Be().then(() => {
              h(u);
            }),
          e.$$.dirty[0] & 1572864 && (s || o) && A(),
          e.$$.dirty[0] & 524368 && g && typeof s == "function" && y(d),
          e.$$.dirty[0] & 4194320 &&
            n(
              7,
              (i = E.filter((f) => {
                const M = d ? d.toLowerCase() : "",
                  K = f.name ? f.name.toLowerCase() : "",
                  H = f.email ? f.email.toLowerCase() : "",
                  oe = K.includes(M),
                  U = H.includes(M);
                return (oe || U) && !W(f.email);
              })),
            ),
          e.$$.dirty[0] & 128 && i && n(8, (_ = 0));
      }),
      [
        c,
        l,
        a,
        u,
        d,
        C,
        g,
        i,
        _,
        k,
        I,
        T,
        N,
        D,
        G,
        lt,
        Ce,
        le,
        W,
        s,
        o,
        h,
        E,
        ot,
        rt,
        st,
        ct,
        ft,
        ut,
        at,
        dt,
        ht,
        mt,
      ]
    );
  }
  class it extends He {
    constructor(t) {
      super();
      document.getElementById("svelte-hwkti6-style") || Re(),
        Ge(
          this,
          t,
          nt,
          tt,
          Ae,
          {
            contacts: 19,
            value: 20,
            placeholder: 0,
            single: 1,
            change: 21,
            show_dropdown: 2,
          },
          [-1, -1],
        );
    }
  }
  return it;
});
//# sourceMappingURL=index.js.map
