import { hex } from '$lib';
import * as fmt from '$lib/fmt';
import { col_vec, diag, matrix, MatrixNxM, row_vec } from './matrix2';

export type HMM_Mode = 'predict' | 'filter';

export type HMM_Value = number | string | boolean;
export type HMM_ValueTuple = HMM_Value[];

export interface HMM_Variable {
	name: string;
	domain: HMM_Value[];
}

export interface HMM_BinaryVariable {
	encodes: HMM_Value[];
	name: string;
}

function domain_combinations(
	domain_a: HMM_Value[] | HMM_ValueTuple[],
	domain_b: HMM_Value[] | HMM_ValueTuple[]
): HMM_ValueTuple[] {
	const combs: HMM_ValueTuple[] = [];
	for (const a of domain_a) {
		for (const b of domain_b) {
			// super ugly... there's got to be a better way!
			if (a instanceof Array) {
				if (b instanceof Array) combs.push([...a, ...b]);
				else combs.push([...a, b]);
			} else {
				if (b instanceof Array) combs.push([a, ...b]);
				else combs.push([a, b]);
			}
		}
	}

	return combs;
}

function all_domain_combinations(domains: HMM_Value[][]): HMM_Value[][] {
	if (domains.length === 0) return [];
	let base: HMM_ValueTuple[] = domains.shift()!.map((v) => [v]);

	while (domains.length > 0) {
		const next = domains.shift()!;
		base = domain_combinations(base, next);
	}

	return base;
}

export function create_binary_variables(vars: HMM_Variable[]) {
	const bin_vars: HMM_BinaryVariable[] = [];
	const collected_hidden_domains = vars.map((h) => h.domain);
	const hidden_combs = all_domain_combinations(collected_hidden_domains);

	for (const comb of hidden_combs) {
		const new_var: HMM_BinaryVariable = {
			encodes: comb,
			name: `${comb
				.map((v, i) => {
					const var_name = vars[i].name;
					switch (typeof v) {
						case 'string':
						case 'number':
							return `${var_name}=${v}`;
						case 'boolean':
							return (v ? '' : '¬') + var_name;
						default:
							return `${v}`;
					}
				})
				.join(', ')}`
		};
		bin_vars.push(new_var);
	}

	return bin_vars;
}

export function build_hmm(
	hidden_vars: HMM_Variable[],
	init_variables: number[],
	transition_model: number[],
	evidence_vars: HMM_Variable[],
	sensor_model: number[]
) {
	const hidden_labels = create_binary_variables(hidden_vars);
	const h = hidden_labels.length;
	if (init_variables.length !== h) throw `Initial state p is not fully defined!`;
	if (transition_model.length !== h ** 2) throw `Transition matrix T is not fully defined!`;
	const T = new MatrixNxM(h, h, transition_model);

  // checking sums
  for (let i = 0; i < T.rows; i++) {
    let sum = T.row_at(i).reduce((a, b) => a+b);
    if (Math.abs(sum-1) > 0.001) throw `Rows of transition matrix T do not sum up to 1, (${i})`;
  }

	const sensor_labels = create_binary_variables(evidence_vars);
	const e = sensor_labels.length;
	if (sensor_model.length !== h * e) throw `Sensor matrix H is not fully defined!`;
	const H = new MatrixNxM(e, h, sensor_model);

  // checking sums
  for (let i = 0; i < H.cols; i++) {
    let sum = H.col_at(i).reduce((a, b) => a+b);
    if (Math.abs(sum-1) > 0.001) throw `Columns of transition matrix H do not sum up to 1, (${i})`;
  }

	const model = new HiddenMarkovModel(col_vec(init_variables), hidden_labels, T, H, sensor_labels);
	return model;
}

export class HiddenMarkovModel {
	var_count: number;
	sensor_count: number;

	p0: MatrixNxM;
	p: MatrixNxM;
	f: MatrixNxM;
	p_labels: HMM_BinaryVariable[];

	e: MatrixNxM;
	e_labels: HMM_BinaryVariable[];

	p_trace: MatrixNxM[] = [];
	f_trace: MatrixNxM[] = [];
	e_trace: MatrixNxM[] = [];

	T: MatrixNxM;
	H: MatrixNxM;

	constructor(
		init_state: MatrixNxM,
		state_labels: HMM_BinaryVariable[],
		transition_model: MatrixNxM,
		sensor_model: MatrixNxM,
		sensor_labels: HMM_BinaryVariable[]
	) {
		// state
		this.var_count = init_state.rows;
		if (init_state.cols != 1) throw `State has to be 1D vector`;
		this.p0 = init_state.copy();
		this.p = init_state.copy();
		this.f = init_state.copy();

		this.p_trace.push(this.p);
		this.f_trace.push(this.f);

		if (state_labels.length !== this.p.rows) throw `Every variable has to be labeled!`;
		this.p_labels = state_labels;
		// transition model
		if (!transition_model.is_square(this.var_count))
			throw `T has to be a (${[this.var_count, this.var_count]}) matrix!`;
		this.T = transition_model;
		// sensor model
		this.sensor_count = sensor_model.rows;
		if (sensor_model.cols !== this.var_count)
			throw `H has to be a (${[this.sensor_count, this.var_count]}) matrix!`;
		this.H = sensor_model;
		if (sensor_labels.length !== this.H.rows) throw `Every sensor has to be labeled!`;
		this.e_labels = sensor_labels;
		this.e = matrix(this.sensor_count, 1, []);
	}

	step(): { p: MatrixNxM; e: MatrixNxM } {
		this.p = this.T.mul(this.p);
		this.p_trace.push(this.p);
		this.e = this.H.mul(this.p);
		this.e_trace.push(this.e);
		return {
			p: this.p,
			e: this.e
		};
	}

	filter(obs: number[]): { e: MatrixNxM; f: MatrixNxM } {
		if (obs.length !== this.sensor_count)
			throw `Observation mismatch (${obs.length},1) vs. (${this.H.rows},1)!`;

		const obs_vec = row_vec(obs); // Sx1
		const O = obs_vec.mul(this.H).diag(); // 1xN => NxN
		this.f = O.mul(this.T).mul(this.f).norm();
		this.f_trace.push(this.f);
		this.e = col_vec(obs);
		this.e_trace.push(this.e);
		return {
			e: this.e,
			f: this.f
		};
	}

	// printing stuff
	format_prob(kind: 'P(x)' | 'P(e)' | 'P(x|e)') {
		let out = '';
		for (let i = 0; i < this.p_labels.length; i++) {
			const label = this.p_labels[i].name;
			let val;
			switch (kind) {
				case 'P(x)':
					val = this.p;
					break;
				case 'P(e)':
					val = this.e;
					break;
				case 'P(x|e)':
					val = this.f;
					break;
				default:
					const NEVER: never = kind;
			}

			out += `${label}:  ${val!.v(i).toFixed(3)}\n`;
		}
		return out;
	}

	format_graph_for_mermaid(mode: HMM_Mode): string {
		const premable = `flowchart LR`;
		const nodes: string[] = [];
		const conns: string[] = [];
		const styles: string[] = [];

		for (let i = 0; i < this.p_labels.length; i++) {
			let value_label = '';
			switch (mode) {
				case 'predict':
					value_label = `p<sub>${i}</sub> = ${fmt.num(this.p.v(i))}`;
					break;
				case 'filter':
					value_label = `f<sub>${i}</sub> = ${fmt.num(this.f.v(i))}`;
					break;
				default:
					const NEVER: never = mode;
			}

			const node_name = `h${i}(["x<sub>${i}</sub> ≙  (${this.p_labels[i].name}) \n${value_label}"])`;
			nodes.push(node_name);
			// nodes.push(`d${i}((x<sub>${i}</sub>))`);

			for (const [j, p] of this.T.row_at(i).entries()) {
				if (p === 0) continue;
				conns.push(`h${i} -->|${p}| h${j}`);
			}
		}

		const out = [premable, ...nodes, ...conns, ...styles].join('\n');

		return out;
	}
}
