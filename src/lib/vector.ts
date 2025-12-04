/**
 * This is a custom, class-less vector library
 */

export type Vec2D = {
  x1: number,
  x2: number,
}

export function vv(x1?: number, x2?: number): Vec2D {
  return {x1: x1 || 0, x2: x2 !== undefined ? x2 : (x1 || 0)};
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function vclamp(v: Vec2D, xmin: number, xmax: number, ymin: number, ymax: number): Vec2D {
  return {
    x1: clamp(v.x1, xmin, xmax),
    x2: clamp(v.x2, ymin, ymax),
  }
}

export function vadd(a: Vec2D, b: Vec2D): Vec2D {
  return {x1: a.x1 + b.x1, x2: a.x2 + b.x2};
}

export function vaddto(a: Vec2D, b: Vec2D): void {
  a.x1 += b.x1;
  a.x2 += b.x2;
}

export function vset(a: Vec2D, b: Vec2D): void {
  a.x1 = b.x1;
  a.x2 = b.x2;
}

export function vcopy(a: Vec2D): Vec2D {
  return {...a};
}

export function vsub(a: Vec2D, b: Vec2D): Vec2D {
  return {x1: a.x1 - b.x1, x2: a.x2 - b.x2};
}

export function vdot(a: Vec2D, b: Vec2D): number {
  return a.x1 * b.x1 + a.x2 * b.x2;
}

export function vlen2(a: Vec2D): number {
  return vdot(a, a);
}

export function vnorm(a: Vec2D): Vec2D {
  const L = vlen2(a)
  if (L === 0) return vcopy(a);
  return vinvscale(a, L);
}

export function vlen(a: Vec2D): number {
  return Math.sqrt(vlen2(a));
}

export function vapply(f: (x: number) => number, v: Vec2D): Vec2D {
  return {x1: f(v.x1), x2: f(v.x2)};
}

export function vabs(v: Vec2D): Vec2D {
  return vapply(Math.abs, v);
}

export function vdiff(a: Vec2D, b: Vec2D): Vec2D {
  return vabs(vsub(a, b));
}

export function vmul(a: Vec2D, b: Vec2D): Vec2D {
  return {x1: a.x1 * b.x1, x2: a.x2 * b.x2};
}

export function vdiv(a: Vec2D, b: Vec2D): Vec2D {
  return {x1: a.x1 / b.x1, x2: a.x2 / b.x2};
}

export function vscale(v: Vec2D, s: number): Vec2D {
  return {x1: v.x1 * s, x2: v.x2 * s};
}

export function vinvscale(v: Vec2D, s: number): Vec2D {
  return {x1: v.x1 / s, x2: v.x2 / s};
}

export function vscaleby(v: Vec2D, s: number): void {
  v.x1 *= s;
  v.x2 *= s;
}

export function vdist2(a: Vec2D, b: Vec2D): number {
  return vlen2(vsub(a, b));
}

export function vdist(a: Vec2D, b: Vec2D): number {
  return vlen(vsub(a, b));
}

export function vsqrt(a: Vec2D): Vec2D {
  return {x1: Math.sqrt(a.x1), x2: Math.sqrt(a.x2)};
}