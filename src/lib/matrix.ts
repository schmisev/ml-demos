import { rand, rand_gauss } from '$lib';

export interface Matrix {
	r: number;
	c: number;
	$: number[][];
}

export function m_vec(vec: number[]): Matrix {
	return {
		r: vec.length,
		c: 1,
		$: vec.map((v) => [v])
	};
}

export function m_to_vec(M: Matrix): number[] {
  return M.$.map((row) => row[0]);
}

export function m_mat(mat: number[][]): Matrix {
	const c = mat[0].length;
	const r = mat.length;

	for (const row of mat) {
		if (row.length !== c) throw `Dimension mismatch ${c} != ${row.length} (true length)`;
	}

	return {
		r,
		c,
		$: mat
	};
}

export function m_zeros(r: number, c: number): Matrix {
	return {
		r,
		c,
		$: [...new Array(r)].map(() => new Array(c).fill(0))
	};
}

export function m_uniform(r: number, c: number, mean: number, variance: number): Matrix {
	return {
		r,
		c,
		$: [...new Array(r)].map(() =>
			[...new Array(c)].map((v2, j) => rand(mean - variance, mean + variance))
		)
	};
}

export function m_gauss(r: number, c: number, mean: number, variance: number): Matrix {
	return {
		r,
		c,
		$: [...new Array(r)].map(() =>
			[...new Array(c)].map((v2, j) => rand_gauss(mean, variance))
		)
	};
}

export function m_id(r: number, c: number): Matrix {
	return {
		r,
		c,
		$: [...new Array(r)].map((v, i) => [...new Array(c)].map((v2, j) => (i === j ? 1 : 0)))
	};
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

export function* m_vals(M: Matrix): Generator<number, void, unknown> {
	for (let i = 0; i < M.r; i++) {
		for (let j = 0; j < M.c; j++) {
			yield M.$[i][j];
		}
	}
}

export function m_pos_min(M: Matrix): number {
	return Math.min(...m_vals(M).filter((v) => v > 0));
}

export function m_diag(M: Matrix): Matrix {
	const n = Math.min(M.r, M.c);
	const D: Matrix = m_zeros(n, 1);

	for (let i = 0; i < n; i++) {
		D.$[i][0] = M.$[i][i];
	}

	return D;
}

export function m_mult(m1: Matrix, m2: Matrix): Matrix {
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

export function m_add(m1: Matrix, m2: Matrix): Matrix {
  if (m1.c !== m2.c || m1.r !== m2.r) throw `Invalid dimensions!`;
  const M = m_zeros(m1.r, m1.c);

  for (let i = 0; i < m1.r; i++) {
		for (let j = 0; j < m2.c; j++) {
			M.$[i][j] = m1.$[i][j] + m2.$[i][j];
		}
	}

  return M;
}

export function m_sub(m1: Matrix, m2: Matrix): Matrix {
  if (m1.c !== m2.c || m1.r !== m2.r) throw `Invalid dimensions!`;
  const M = m_zeros(m1.c, m1.r);

  for (let i = 0; i < m1.r; i++) {
		for (let j = 0; j < m2.c; j++) {
			M.$[i][j] = m1.$[i][j] - m2.$[i][j];
		}
	}

  return M;
}

export function m_dot(m1: Matrix, m2: Matrix): number {
  if (m1.c !== m2.c || m1.r !== m2.r) throw `Invalid dimensions!`;
  let accum = 0;

  for (let i = 0; i < m1.r; i++) {
		for (let j = 0; j < m2.c; j++) {
			accum += m1.$[i][j] * m2.$[i][j];
		}
	}

  return accum;
}

export function m_scale(m: Matrix, s: number): Matrix {
	const M = m_zeros(m.r, m.c);

	for (const [i, r] of m.$.entries()) {
		for (const [j, v] of r.entries()) {
			M.$[i][j] = v * s;
		}
	}

	return M;
}

export function m_print(m: Matrix) {
	console.log(m.$.map((r) => r.join('\t')).join('\n'));

	return m;
}

export function m_cholesky(M: Matrix) {
	let n = M.c;

	// to store the lower triangular matrix
	let lower = Array.from({ length: n }, () => Array(n).fill(0));

	// Decomposing a matrix into Lower Triangular
	for (let i = 0; i < n; i++) {
		for (let j = 0; j <= i; j++) {
			let sum = 0;

			// summation for diagonals
			if (j === i) {
				for (let k = 0; k < j; k++) sum += Math.pow(lower[j][k], 2);
				lower[j][j] = Math.sqrt(M.$[j][j] - sum) || 0;
			} else {
				// Evaluating L(i, j) using L(j, j)
				for (let k = 0; k < j; k++) sum += lower[i][k] * lower[j][k];
				lower[i][j] = ((M.$[i][j] - sum) / lower[j][j]) || 0;
			}
		}
	}

	return m_mat(lower);
}
