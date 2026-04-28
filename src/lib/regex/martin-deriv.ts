
type AnyAnn = Record<'eps' | 'char' | 'star' | 'prod' | 'plus', unknown>;
type RegexT<Ann extends AnyAnn> =
  {
    t: 'eps'
    a: Ann['eps'],
  }
  |
  {
    t: 'char',
    a: Ann['char'],
    c: string,
  }
  |
  {
    t: 'star',
    a: Ann['star'],
    e: RegexT<Ann>,
  }
  |
  {
    t: 'prod',
    a: Ann['prod'],
    l: RegexT<Ann>,
    r: RegexT<Ann>,
  }
  |
  {
    t: 'plus',
    a: Ann['plus'],
    l: RegexT<Ann>,
    r: RegexT<Ann>,
  }
type NoAnn = Record<'eps' | 'char' | 'star' | 'prod' | 'plus', undefined>;
type Regex = RegexT<NoAnn>;
function eps_a<Ann extends AnyAnn>(a: Ann['eps']): RegexT<Ann> {
  return { t: 'eps', a }
}
function eps(): Regex { return eps_a(undefined) }
function char_a<Ann extends AnyAnn>(c: string, a: Ann['char']): RegexT<Ann> {
  return { t: 'char', c, a }
}
function char(c: string): Regex { return char_a(c, undefined) }
function star_a<Ann extends AnyAnn>(e: RegexT<Ann>, a: Ann['star']): RegexT<Ann> {
  return { t: 'star', e, a }
}
function star(e: Regex): Regex { return star_a(e, undefined) }
function prod_a<Ann extends AnyAnn>(l: RegexT<Ann>, r: RegexT<Ann>, a: Ann['prod']): RegexT<Ann> {
  if (l.t === 'eps') return r;
  return { t: 'prod', l, r, a }
}
function prod(l: Regex, r: Regex): Regex { return prod_a(l, r, undefined) }
function plus_a<Ann extends AnyAnn>(l: RegexT<Ann>, r: RegexT<Ann>, a: Ann['prod']): RegexT<Ann> {
  if (l.t === 'eps') return r;
  if (r.t === 'eps') return l;
  return { t: 'plus', l, r, a }
}
function plus(l: Regex, r: Regex): Regex { return plus_a(l, r, undefined) }
type EmptyAnn = Record<'eps' | 'char' | 'star' | 'prod' | 'plus', boolean>;
type RegexWithEmpty = RegexT<EmptyAnn>;
function prod_empty(l: RegexWithEmpty, r: RegexWithEmpty): RegexWithEmpty {
  return prod_a(l, r, l.a && r.a);
}
function analyze(r: Regex): RegexWithEmpty {
  switch(r.t) {
    case 'eps': return eps_a(true)
    case 'char': return char_a(r.c, false)
    case 'star': return star_a(analyze(r.e), true)
    case 'prod': return prod_empty(analyze(r.l), analyze(r.r))
    case 'plus': {
      const la = analyze(r.l);
      const ra = analyze(r.r);
      return plus_a(la, ra, la.a || ra.a);
    }
  }
}
function format(r: RegexT<AnyAnn>): string {
  switch (r.t) {
    case 'eps': return ""
    case 'char': return r.c
    case 'star': return `(${format(r.e)})*`
    case 'prod': return `${format(r.l)}${format(r.r)}`
    case 'plus': return `${format(r.l)}|${format(r.r)}`
  }
}
function reduce_plus(ms: Array<RegexT<AnyAnn>>): RegexT<AnyAnn> {
  return ms.reduce((l, r) => plus_a(l, r, undefined))
}

type Derivatives<M> = {
  zeroth: Array<M>,
  d: (i: M, c: string) => Set<M>,
  decode: (i: M) => RegexWithEmpty,
}
function map_set<T, U>(s: Set<T>, i: (t: T) => U): Set<U> {
  return new Set(Array.from(s).map(i))
}
function derivatives<R>(r: RegexWithEmpty, receiver: <M extends string>(ders: Derivatives<M>) => R): R {
  switch (r.t) {
    case 'eps': {
      const ders = {
        zeroth: [""],
        d: (_d, _c) => new Set(),
        decode: (_) => r,
      } satisfies Derivatives<"">;
      return receiver(ders)
    }
    case 'char': {
      let ders = {
        zeroth: ['0'],
        d: (i, c) => {
          if (i === '0' && r.c === c) return new Set(['1']);
          return new Set();
        },
        decode: (i) => i === '0' ? r : analyze(eps()),
      } satisfies Derivatives<'0' | '1'>;
      return receiver(ders)
    }
    case 'star': {
      return derivatives(r.e, <E extends string>(derse: Derivatives<E>) => {
        type DE = 'e' | `m${E}`;
        const d_eps = 'e';
        const inject_e = (e: E) => `m${e}` as const;
        const ders = {
          zeroth: [d_eps],
          d: (m, c) => {
            let eps = m === 'e';
            let dms = new Set<DE>();
            if (m[0] === 'm') {
              const me = m.slice(1) as E;
              dms = map_set(derse.d(me, c), inject_e)
              eps = derse.decode(me).a
            }
            if (eps) {
              dms = dms.union(new Set(derse.zeroth.flatMap(me => Array.from(derse.d(me, c)).map(inject_e))));
            }
            return dms
          },
          decode: (m) => {
            if (m === 'e') return r
            return prod_empty(derse.decode(m.slice(1) as E), r);
          }
        } satisfies Derivatives<DE>;
        return receiver(ders)
      })
    }
    case 'prod': {
      return derivatives(r.l, <L extends string>(dersl: Derivatives<L>) => derivatives(r.r, <R extends string>(dersr: Derivatives<R>) => {
        type DLR = `l${L}` | `r${R}`;
        const inject_dl = (d: L) => `l${d}` as const;
        const inject_dr = (d: R) => `r${d}` as const;
        const ders = {
          zeroth: [...dersl.zeroth.map(inject_dl)],
          d: (m, c) => {
            if (m[0] === 'r') return map_set(dersr.d(m.slice(1) as R, c), inject_dr);
            const ml = m.slice(1) as L;
            let dms: Set<DLR> = map_set(dersl.d(ml, c), inject_dl);
            if (dersl.decode(ml).a) {
              const adds = dersr.zeroth.flatMap(mr => Array.from(dersr.d(mr, c)));
              dms = dms.union(new Set(adds.map(inject_dr)))
            }
            return dms
          },
          decode: (m) => {
            switch (m[0]) {
              case 'l': return prod_empty(dersl.decode(m.slice(1) as L), r.r)
              case 'r': return dersr.decode(m.slice(1) as R)
              default: throw new Error('unreachable')
            }
          }
        } satisfies Derivatives<DLR>;
        return receiver(ders)
      }));
    }
    case 'plus': {
      return derivatives(r.l, <L extends string>(dersl: Derivatives<L>) => derivatives(r.r, <R extends string>(dersr: Derivatives<R>) => {
        type DLR = `l${L}` | `r${R}`;
        const inject_dl = (d: L) => `l${d}` as const;
        const inject_dr = (d: R) => `r${d}` as const;
        const ders = {
          zeroth: [...dersl.zeroth.map(inject_dl), ...dersr.zeroth.map(inject_dr)],
          d: (m, c) => {
            switch (m[0]) {
              case 'l': return map_set(dersl.d(m.slice(1) as L, c), inject_dl)
              case 'r': return map_set(dersr.d(m.slice(1) as R, c), inject_dr)
              default: throw new Error('unreachable')
            }
          },
          decode: (m) => {
            switch (m[0]) {
              case 'l': return dersl.decode(m.slice(1) as L)
              case 'r': return dersr.decode(m.slice(1) as R)
              default: throw new Error('unreachable')
            }
          }
        } satisfies Derivatives<DLR>;
        return receiver(ders)
      }))
    }
  }
}
function all_ders<M>(ders: Derivatives<M>, base: Iterable<M>, c: string): Set<M> {
  return new Set(Array.from(base).flatMap(m => Array.from(ders.d(m, c))))
}
function format_ders<M>(ders: Derivatives<M>, ms: Iterable<M>): string {
  const mss = Array.from(ms);
  if (mss.length === 0) return "∅"
  return format(reduce_plus(mss.map(m => ders.decode(m))))
}

const test = star(prod(char('a'), star(char('a'))));
console.log(format(test));
derivatives(analyze(test), <M>(ders: Derivatives<M>) => {
  console.log(format_ders(ders, ders.zeroth));
  let ds = new Set(ders.zeroth);
  console.log(ds);
  ds = all_ders(ders, ds, 'a');
  console.log(ds);
  console.log(format_ders(ders, ds));
  ds = all_ders(ders, ds, 'a');
  console.log(ds);
  console.log(format_ders(ders, ds));
  ds = all_ders(ders, ds, 'a');
  console.log(ds);
  console.log(format_ders(ders, ds));
  ds = all_ders(ders, ds, 'b');
  console.log(format_ders(ders, ds));
  ds = all_ders(ders, ds, 'a');
  console.log(format_ders(ders, ds));
  ds = all_ders(ders, ds, 'a');
  console.log(format_ders(ders, ds));
})