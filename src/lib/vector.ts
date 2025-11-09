export type Vector2 = {
  x: number,
  y: number,
}

export function vv(x?: number, y?: number) {
  return {x: x || 0, y: y || x || 0};
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function vclamp(v: Vector2, xmin: number, xmax: number, ymin: number, ymax: number) {
  return {
    x: clamp(v.x, xmin, xmax),
    y: clamp(v.y, ymin, ymax),
  }
}

export function vadd(a: Vector2, b: Vector2): Vector2 {
  return {x: a.x + b.x, y: a.y + b.y};
}

export function vaddto(a: Vector2, b: Vector2): void {
  a.x += b.x;
  a.y += b.y;
}

export function vset(a: Vector2, b: Vector2): void {
  a.x = b.x;
  a.y = b.y;
}


export function vsub(a: Vector2, b: Vector2): Vector2 {
  return {x: a.x - b.x, y: a.y - b.y};
}

export function vdot(a: Vector2, b: Vector2): number {
  return a.x * b.x + a.y * b.y;
}

export function vlen2(a: Vector2): number {
  return vdot(a, a);
}

export function vlen(a: Vector2): number {
  return Math.sqrt(vlen2(a));
}

export function vapply(f: (x: number) => number, v: Vector2) {
  return {x: f(v.x), y: f(v.y)};
}

export function vabs(v: Vector2): Vector2 {
  return vapply(Math.abs, v);
}

export function vdiff(a: Vector2, b: Vector2): Vector2 {
  return vabs(vsub(a, b));
}

export function vmul(a: Vector2, b: Vector2): Vector2 {
  return {x: a.x * b.x, y: a.y + b.y};
}

export function vdiv(a: Vector2, b: Vector2): Vector2 {
  return {x: a.x / b.x, y: a.y / b.y};
}

export function vscale(v: Vector2, s: number): Vector2 {
  return {x: v.x * s, y: v.y * s};
}

export function vscaleby(v: Vector2, s: number): void {
  v.x *= s;
  v.y *= s;
}

export function vlendiff2(a: Vector2, b: Vector2) {
  return vlen2(vsub(a, b));
}

export function vlendiff(a: Vector2, b: Vector2) {
  return vlen(vsub(a, b));
}