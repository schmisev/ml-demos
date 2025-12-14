import { mod } from '$lib';

export type MatrixKind = 'scalar' | 'col-vec' | 'row-vec' | 'matrix';

export type MatrixMeta = {
  name?: string;
}

export class MatrixNxM {
	readonly kind: MatrixKind;
	readonly rows: number;
	readonly cols: number;
	readonly major_axis: number;
	values: number[];

	constructor(rows: number, cols: number, values: number[]) {
		this.kind =
			rows === 1 ? (cols === 1 ? 'scalar' : 'row-vec') : cols === 1 ? 'col-vec' : 'matrix';

		this.rows = rows;
		this.cols = cols;
		this.major_axis = Math.max(rows, cols);

		this.values = new Array(rows * cols);
		this.values.fill(0);

		for (let i = 0; i < rows * cols; i++) {
			this.values[i] = values[i] || 0;
		}
	}

	info(): void {
		console.log(`(${this.shape()}) ${this.kind}`);
	}

	log(): void {
		console.table(this.unflatten());
	}

	#get_idx(i: number, j: number): number {
		return mod(i, this.rows) * this.cols + mod(j, this.cols);
	}

	copy(): MatrixNxM {
		return new MatrixNxM(this.rows, this.cols, this.values);
	}

	// get value at (i, j)
	ij(i: number, j: number) {
		const idx = this.#get_idx(i, j);
		return this.values[i * this.cols + j];
	}

	/**
	 * Index into matrix AS IF it was a vector
	 * For col-vecs, gives value at row i
	 * For row-vecs, gives values at col i
	 * For general matrices, gives value along diagonal
	 * @param i
	 * @returns value at i
	 */
	v(i: number) {
		if (this.cols === 1) return this.ij(i, 0);
		if (this.rows === 1) return this.ij(0, i);
		return this.ij(i, i);
	}

	// set value at (i, j), return old value
	put_ij(i: number, j: number, v: number): number {
		const idx = this.#get_idx(i, j);
		const old_v = this.values[idx];
		this.values[idx] = v;
		return old_v;
	}

	// scale value at (i, j), return old value
	scale_ij(i: number, j: number, s: number): number {
		const idx = this.#get_idx(i, j);
		const old_v = this.values[idx];
		this.values[idx] = s * old_v;
		return old_v;
	}

	mul(other: MatrixNxM): MatrixNxM {
		if (!this.can_multiply(other))
			throw `Dimension mismatch: (${this.shape()}) x (${other.shape()})`;
		const new_values: number[] = [];

		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < other.cols; j++) {
				let accum = 0;
				for (let k = 0; k < this.cols; k++) {
					accum += this.ij(i, k) * other.ij(k, j);
				}

				new_values.push(accum);
			}
		}

		return new MatrixNxM(this.rows, other.cols, new_values);
	}

	hadamard(other: MatrixNxM): MatrixNxM {
		if (!this.equals_shape(other))
			throw `Dimension mismatch: (${this.shape()}) o (${other.shape()})`;
		const new_values: number[] = [];

		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				new_values.push(this.ij(i, j) * this.ij(i, j));
			}
		}

		return new MatrixNxM(this.cols, other.rows, new_values);
	}

	add(other: MatrixNxM): MatrixNxM {
		if (!this.equals_shape(other))
			throw `Dimension mismatch: (${this.shape()}) + (${other.shape()})`;
		const new_values: number[] = [];

		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				new_values.push(this.ij(i, j) + this.ij(i, j));
			}
		}

		return new MatrixNxM(this.cols, other.rows, new_values);
	}

	sub(other: MatrixNxM): MatrixNxM {
		if (!this.equals_shape(other))
			throw `Dimension mismatch: (${this.shape()}) - (${other.shape()})`;
		const new_values: number[] = [];

		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				new_values.push(this.ij(i, j) - this.ij(i, j));
			}
		}

		return new MatrixNxM(this.cols, other.rows, new_values);
	}

	// iterators
	row_at(i: number): number[] {
		const row: number[] = [];
		for (let j = 0; j < this.cols; j++) {
			row.push(this.ij(i, j));
		}

		return row;
	}

  col_at(j: number): number[] {
		const col: number[] = [];
		for (let i = 0; i < this.cols; i++) {
			col.push(this.ij(i, j));
		}

		return col;
	}

	// scalar operations
	scale_row(i: number, s: number) {
		for (let j = 0; j < this.cols; j++) {
			this.scale_ij(i, j, s);
		}
	}

	scale_col(j: number, s: number) {
		for (let i = 0; i < this.rows; i++) {
			this.scale_ij(i, j, s);
		}
	}

	scale(s: number) {
		for (let i = 0; i < this.rows; i++) {
			this.scale_row(i, s);
		}
	}

	// transforms
	diag() {
		switch (this.kind) {
			case 'scalar':
				return this.copy();
			case 'col-vec':
			case 'row-vec':
			case 'matrix':
				let vs = [];
				for (let i = 0; i < this.major_axis; i++) {
					vs.push(this.v(i));
				}
				return diag(vs);
		}
	}

	// currently only works for vectors
	norm() {
		switch (this.kind) {
			case 'scalar':
				return scalar(1);
			case 'col-vec':
			case 'row-vec':
				const L = this.values.reduce((a, b) => a + b);
				const new_values = this.values.map((a) => (L > 0 ? a / L : 0));
				return this.kind === 'col-vec' ? col_vec(new_values) : row_vec(new_values);
			case 'matrix':
				return this.copy();
		}
	}

	cholesky() {
		let n = this.cols;

		// to store the lower triangular matrix
		let lower = Array.from({ length: n }, () => Array(n).fill(0));

		// Decomposing a matrix into Lower Triangular
		for (let i = 0; i < n; i++) {
			for (let j = 0; j <= i; j++) {
				let sum = 0;

				// summation for diagonals
				if (j === i) {
					for (let k = 0; k < j; k++) sum += Math.pow(lower[j][k], 2);
					lower[j][j] = Math.sqrt(this.ij(i, j) - sum) || 0;
				} else {
					// Evaluating L(i, j) using L(j, j)
					for (let k = 0; k < j; k++) sum += lower[i][k] * lower[j][k];
					lower[i][j] = (this.ij(i, j) - sum) / lower[j][j] || 0;
				}
			}
		}

		return flat_matrix(lower);
	}

	// check if the untransposed shapes are equal
	equals_shape(other: MatrixNxM): boolean {
		return this.rows == other.rows && this.cols == other.cols;
	}

	// checks if matrices can be multiplied
	can_multiply(other: MatrixNxM): boolean {
		return this.cols == other.rows;
	}

	// checks if matrix is square
	is_square(N?: number) {
		return this.cols === this.rows && (N !== undefined ? this.cols === N : true);
	}

	// returns tuple of shapes
	shape(): [number, number] {
		return [this.rows, this.cols];
	}

	// create nested array of matrix elements
	unflatten(): number[][] {
		const values: number[][] = [];

		for (let i = 0; i < this.rows; i++) {
			values.push([]);
			for (let j = 0; j < this.cols; j++) {
				values[i].push(this.ij(i, j));
			}
		}

		return values;
	}
}

export function matrix(rows: number, cols: number, values: number[]): MatrixNxM {
	return new MatrixNxM(rows, cols, values);
}

export function flat_matrix(values: number[][]): MatrixNxM {
	let rows = values.length;
	if (rows < 1) throw `Row dimension too small!`;
	let cols = values[0].length;
	if (cols < 1) throw `Col dimension too small!`;

	const new_values: number[] = [];
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			const v = values.at(i)?.at(j);
			new_values.push(v || 0);
		}
	}

	return new MatrixNxM(rows, cols, new_values);
}

export function row_vec(values: number[]): MatrixNxM {
	return new MatrixNxM(1, values.length, values);
}

export function col_vec(values: number[]): MatrixNxM {
	return new MatrixNxM(values.length, 1, values);
}

export function scalar(value: number): MatrixNxM {
	return new MatrixNxM(1, 1, [value]);
}

export function diag(values: number[]): MatrixNxM {
	const new_values: number[] = [];

	for (let i = 0; i < values.length; i++) {
		for (let j = 0; j < values.length; j++) {
			new_values.push(i === j ? values[i] : 0);
		}
	}

	return new MatrixNxM(values.length, values.length, new_values);
}

export function eye(size: number): MatrixNxM {
	const new_values: number[] = [];

	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			new_values.push(i === j ? 1 : 0);
		}
	}

	return new MatrixNxM(size, size, new_values);
}
