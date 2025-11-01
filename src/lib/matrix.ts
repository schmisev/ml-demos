export interface Matrix {
  r: number,
  c: number,
  $: number[][]
}

export function m_vec(vec: number[]): Matrix {
  return {
    r: vec.length,
    c: 1,
    $: vec.map((v) => [v])
  }
}

export function m_mat(mat: number[][]): Matrix {
  const c = mat[0].length;
  const r = mat.length;

  for (const row of mat) {
    if (row.length !== c) throw `Dimension mismatch ${c} != ${row.length} (true length)`;
  }

  return {
    r, c,
    $: mat
  }
}

export function m_zeros(r: number, c: number): Matrix {
  return {
    r, c,
    $: [...new Array(r)].map(() => (new Array(c)).fill(0))
  }
}

export function m_id(r: number, c: number): Matrix {
  return {
    r, c,
    $: [...new Array(r)].map((v, i) => [...new Array(c)].map((v2, j) => i === j ? 1 : 0))
  }
}

export function T(m: Matrix): Matrix {
  const M = m_zeros(m.c, m.r);

  for (const [i, r] of m.$.entries()) {
    for (const [j, v] of r.entries()) {
      M.$[j][i] = v;
    }
  }

  return M;
}

export function *m_vals(M: Matrix): Generator<number, void, unknown> {
  for (let i = 0; i < M.r; i++) {
    for (let j = 0; j < M.c; j++) {
      yield M.$[i][j];
    }
  }
}

export function m_pos_min(M: Matrix): number {
  return Math.min(...m_vals(M).filter(v => v > 0));
}

export function m_diag(M: Matrix): Matrix {
  const n = Math.min(M.r, M.c);
  const D: Matrix = m_zeros(n, 1);

  for (let i = 0; i < n; i++) {
    D.$[i][0] = M.$[i][i];
  }

  return D;
}

export function mmult(m1: Matrix, m2: Matrix): Matrix {
  if (m1.c !== m2.r) throw `Invalid dimensions (${m1.r}x${m1.c}) * (${m2.r}x${m2.c})`;
  const M = m_zeros(m1.r, m2.c);

  for (let i = 0; i < m1.r; i++) {
    for (let j = 0; j < m2.c; j++) {
      let v = 0;
      for (let k = 0; k < m1.c; k++) {
        v += m1.$[i][k] * m2.$[k][j];
      }
      M.$[i][j] = v;
    } 
  }

  return M;
}

export function mscale(m: Matrix, s: number): Matrix {
  const M = m_zeros(m.r, m.c);

  for (const [i, r] of m.$.entries()) {
    for (const [j, v] of r.entries()) {
      M.$[i][j] = v * s;
    }
  }

  return M;
}

export function mprint(m: Matrix) {

    console.log(m.$.map(r => r.join("\t")).join("\n"));

  return m;
}