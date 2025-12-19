import { mod } from '$lib';
import * as fmt from "$lib/fmt";

export type MatrixKind = 'scalar' | 'col-vec' | 'row-vec' | 'matrix';

export type MatrixMeta = {
  name?: string;
}

export class MatrixND {
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

	get_index(i: number, j: number): number {
		return mod(i, this.rows) * this.cols + mod(j, this.cols);
	}

	copy(): MatrixND {
		return new MatrixND(this.rows, this.cols, this.values);
	}

	// get value at (i, j)
	ij(i: number, j: number) {
		const idx = this.get_index(i, j);
		return this.values[idx];
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
		const idx = this.get_index(i, j);
		const old_v = this.values[idx];
		this.values[idx] = v;
		return old_v;
	}

	// scale value at (i, j), return old value
	scale_ij(i: number, j: number, s: number): number {
		const idx = this.get_index(i, j);
		const old_v = this.values[idx];
		this.values[idx] = s * old_v;
		return old_v;
	}

	mul(other: MatrixND): MatrixND {
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

		return new MatrixND(this.rows, other.cols, new_values);
	}

	hadamard(other: MatrixND): MatrixND {
		if (!this.equals_shape(other))
			throw `Dimension mismatch: (${this.shape()}) o (${other.shape()})`;
		const new_values: number[] = [];

		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				new_values.push(this.ij(i, j) * other.ij(i, j));
			}
		}

		return new MatrixND(this.cols, other.rows, new_values);
	}

	add(other: MatrixND): MatrixND {
		if (!this.equals_shape(other))
			throw `Dimension mismatch: (${this.shape()}) + (${other.shape()})`;
		const new_values: number[] = [];

		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				new_values.push(this.ij(i, j) + this.ij(i, j));
			}
		}

		return new MatrixND(this.cols, other.rows, new_values);
	}

	sub(other: MatrixND): MatrixND {
		if (!this.equals_shape(other))
			throw `Dimension mismatch: (${this.shape()}) - (${other.shape()})`;
		const new_values: number[] = [];

		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				new_values.push(this.ij(i, j) - this.ij(i, j));
			}
		}

		return new MatrixND(this.cols, other.rows, new_values);
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
		for (let i = 0; i < this.rows; i++) {
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

  len1() {
    let accum = 0;
    for (const v of this.values) {
      accum += v;
    }
    return accum;
  }

	// currently only works for vectors
	norm1() {
		switch (this.kind) {
			case 'scalar':
				return scalar(1);
			case 'col-vec':
			case 'row-vec':
				const L = this.len1();
				const new_values = this.values.map((a) => (L > 0 ? (a / L) : 0));
				return this.kind === 'col-vec' ? col_vec(new_values) : row_vec(new_values);
			case 'matrix':
				return this.copy();
		}
	}

  len2() {
    let accum = 0;
    for (const v of this.values) {
      accum += v**2;
    }
    return Math.sqrt(accum);
  }

  // currently only works for vectors
  norm2() {
		switch (this.kind) {
			case 'scalar':
				return scalar(1);
			case 'col-vec':
			case 'row-vec':
				const L = this.len2();
				const new_values = this.values.map((a) => (L > 0 ? (a / L) : 0));
				return this.kind === 'col-vec' ? col_vec(new_values) : row_vec(new_values);
			case 'matrix':
				return this.copy();
		}
	}

  comp_val(comp: (a: number, b: number) => boolean): { value: number, index: number, ij: [number, number] } {
    let chosen_index = 0;
    let max_value = this.values[0];
    let chosen_i = 0;
    let chosen_j = 0;

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const index = this.get_index(i, j);
        let value = this.values[index];
        if (comp(value,max_value)) {
          max_value = value;
          chosen_index = index
          chosen_i = i;
          chosen_j = j;
        }
      }
    }

    return {
      ij: [chosen_i, chosen_j],
      index: chosen_index,
      value: max_value,
    }
  }

  max_val() {
    return this.comp_val((a, b) => a > b);
  }

  min_val() {
    return this.comp_val((a, b) => a < b);
  }

  // transpose of matrix
  transpose(): MatrixND {
    const new_values: number[] = [];

    for (let j = 0; j < this.cols; j++) {
      for (let i = 0; i < this.rows; i++) {
        new_values.push(this.ij(i, j));
      }
    }

    return new MatrixND(this.cols, this.rows, new_values);
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
	equals_shape(other: MatrixND): boolean {
		return this.rows == other.rows && this.cols == other.cols;
	}

	// checks if matrices can be multiplied
	can_multiply(other: MatrixND): boolean {
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

  // to html table
  format_as_html_table(): string {
    let out = "<table>";
    for (let i = 0; i < this.rows; i++) {
      out += "<tr>"
      for (let j = 0; j < this.cols; j++) {
        let value = this.ij(i, j);
        out += `<td>${fmt.num(value)}</td>`
      }
      out += "</tr>"
    } 
    out += "</table>";

    return out;
  }
}

export function matrix(rows: number, cols: number, values: number[]): MatrixND {
	return new MatrixND(rows, cols, values);
}

export function flat_matrix(values: number[][]): MatrixND {
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

	return new MatrixND(rows, cols, new_values);
}

export function row_vec(values: number[]): MatrixND {
	return new MatrixND(1, values.length, values);
}

export function col_vec(values: number[]): MatrixND {
	return new MatrixND(values.length, 1, values);
}

export function scalar(value: number): MatrixND {
	return new MatrixND(1, 1, [value]);
}

export function diag(values: number[]): MatrixND {
	const new_values: number[] = [];

	for (let i = 0; i < values.length; i++) {
		for (let j = 0; j < values.length; j++) {
			new_values.push(i === j ? values[i] : 0);
		}
	}

	return new MatrixND(values.length, values.length, new_values);
}

export function eye(size: number): MatrixND {
	const new_values: number[] = [];

	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			new_values.push(i === j ? 1 : 0);
		}
	}

	return new MatrixND(size, size, new_values);
}

export function ones_like(M: MatrixND): MatrixND {
  const N = M.cols * M.rows;
  const new_values = new Array(N).fill(1);
  return new MatrixND(M.rows, M.cols, new_values);
}