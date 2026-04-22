export function assign_set<A>(s: Set<A>, elements: A[] | Set<A>) {
  s.clear();
  for (const e of elements) s.add(e);
}

export function assign_map<A, B>(m: Map<A, B>, keys: A[], values: B[]) {
  m.clear();
  for (const [i, k] of keys.entries()) {
    m.set(k, values[i % values.length]);
  }
}

export function init_map<A, B>(a: A, b: B) {
  return new Map([[a, b]]);
}
