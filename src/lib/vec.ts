
interface Vec {
  x: number;
  y: number;
}

export function vec_add(a: Vec, b: Vec): Vec {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  }
}


export function vec_neg(a: Vec): Vec {
  return {
    x: -a.x,
    y: -a.y
  }
}

export function vec_to(a: Vec, b: Vec) {
  return vec_add(vec_neg(b), a);
}

export function vec_norm2(a: Vec): number {
  return a.x*a.x + a.y*a.y
}

export function vec_norm(a: Vec): number {
  return Math.sqrt(vec_norm2(a));
}

export function vec_dist(a: Vec, b: Vec): number {
  return vec_norm(vec_to(a, b));
}

export function vec_scale(a: Vec, f: number): Vec {
  return {x: a.x * f, y: a.y * f}
}

export function vec_div(a: Vec, f: number): Vec {
  return {x: a.x / f, y: a.y / f}
}

export function vec_normalize2(a: Vec): Vec {
  const n = vec_norm2(a);
  if (n === 0) return a;
  return vec_div(a, n);
}

export function vec_filter(l: Vec[], radius: number): Vec[] {
  if (l.length <= 1) return l;

  const new_l: Vec[] = [];
  new_l.push(l[0]);
  for (let i = 0; i < l.length; i++) {
    const p0 = new_l.pop()!;
    if (!p0) break;
    const p1 = l[i];

    if (vec_dist(p0, p1) < radius) {
      if (i == l.length-1) new_l.push(p1);
      else if (new_l.length === 0) {
        new_l.push(p0);
      } else {
        new_l.push(vec_scale(vec_add(p0, p1), 0.5));
      }
    } else {
      new_l.push(p0);
      new_l.push(p1);
    }
  }
  return new_l;
}