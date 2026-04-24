export function assign_set<A>(s: Set<A>, elements: A[] | Set<A>) {
  s.clear();
  append_to_set(s, elements);
}

export function append_to_set<A>(s: Set<A>, elements: A[] | Set<A>) {
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

export function break_into_lines(str: string, width: number, nl = "\n", sep = "↲", cont = "…") {
  let new_text = "";

  for (let i = 0; i < str.length; i++) {
    if (i % width === 0 && i > 0) new_text += sep + nl + cont;
    new_text += str[i];
  }

  return new_text;
}