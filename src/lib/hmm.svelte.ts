import { hex } from '$lib';
import * as fmt from '$lib/fmt';
import { col_vec, diag, matrix, MatrixND, ones_like, row_vec } from './matrix2';

export type HMM_GraphDir = "TD" | "LR" | "RL";
export type HMM_Mode = 'predict' | 'filter' | 'init' | 'backward';

export type HMM_Value = number | string | boolean;
export type HMM_ValueTuple = HMM_Value[];

export interface HMM_Variable {
	name: string;
	domain: HMM_Value[];
}

export interface HMM_ValuedVariable extends HMM_Variable {
	value: HMM_Value;
}

export interface HMM_BinaryVariable {
	encodes: HMM_Value[];
	name: string;
}

export interface HMM_ValuedBinaryVariable extends HMM_BinaryVariable {
  prob: number;
  mode: HMM_Mode;
}

export interface HMM_LabeledDistro {
  distro: MatrixND,
  smoothed?: MatrixND,
  mode: HMM_Mode,
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

export function evidence_to_1_hot(evidence_templates: HMM_ValuedVariable[]): { one_hot: number[], index: number } {
  // product of all domains
  const N = evidence_templates.map(t => t.domain.length).reduce((a, b) => a*b, 1);
  const one_hot = new Array(N).fill(0);

  // finding the fitting input
  let base = N;
  let index = 0;
  for (const template of evidence_templates) {
    base /= template.domain.length;
    const pos = template.domain.findIndex((v) => v === template.value);
    index += pos * base;
  }

  one_hot[index] = 1;
  return {
    index,
    one_hot
  };
}

export function build_hmm(
	hidden_vars: HMM_Variable[],
	init_variables: number[],
	transition_model: number[],
	evidence_vars: HMM_Variable[],
	sensor_model: number[],
  graph_dir: HMM_GraphDir = "LR",
): { model: HiddenMarkovModel; evidence_templates: HMM_ValuedVariable[]; } {
	const hidden_labels = create_binary_variables(hidden_vars);
	const h = hidden_labels.length;
	if (init_variables.length !== h) throw `Initial state p is not fully defined!`;
	if (transition_model.length !== h ** 2) throw `Transition matrix T is not fully defined! Expected (${h},${h}) matrix, i.e. ${h*h} values.`;
	const T = new MatrixND(h, h, transition_model);

	// checking sums
	for (let i = 0; i < T.cols; i++) {
		let sum = T.col_at(i).reduce((a, b) => a + b);
		if (Math.abs(sum - 1) > 0.001)
			throw `Columns of transition matrix T do not sum up to 1 @ (${i})`;
	}

	const sensor_labels = create_binary_variables(evidence_vars);
	const e = sensor_labels.length;
	if (sensor_model.length !== h * e) throw `Sensor matrix H is not fully defined! Expected (${e},${h}) matrix, i.e. ${e*h} values.`;
	const H = new MatrixND(e, h, sensor_model);

	// checking sums
	for (let i = 0; i < H.cols; i++) {
    let col = H.col_at(i);
		let sum = col.reduce((a, b) => a + b);
		if (Math.abs(sum - 1) > 0.001)
			throw `Columns of sensor matrix H do not sum up to 1, (${i}, ${sum.toFixed(10)}, [${col}])`;
	}

	const model = new HiddenMarkovModel(col_vec(init_variables), hidden_labels, T, H, sensor_labels, graph_dir);

	const evidence_templates: HMM_ValuedVariable[] = evidence_vars.map((v) => {
		return { value: v.domain[0], ...v };
	});

	return {
		model,
		evidence_templates
	};
}

export class HiddenMarkovModel {
	var_count: number;
	sensor_count: number;
  graph_dir: HMM_GraphDir;

	p0: MatrixND;
	// p: MatrixNxM = $state(new MatrixNxM(1, 1, []));
	f: MatrixND = $state(new MatrixND(1, 1, []));
	p_labels: HMM_BinaryVariable[];

	e: MatrixND = $state(new MatrixND(1, 1, []));
	e_labels: HMM_BinaryVariable[];

  b: MatrixND = $state(new MatrixND(1, 1, []));
  s: MatrixND = $state(new MatrixND(1, 1, []));

	// p_trace: MatrixNxM[] = [];
	f_trace: HMM_LabeledDistro[] = $state([]);
	e_trace: HMM_LabeledDistro[] = $state([]);

  t = $derived(this.f_trace.length);
  s_pos = $state(0);
  s_end = $state(0);

  b_rev_trace: MatrixND[] = $state([]);
  // s_rev_trace: HMM_LabeledDistro[] = $state([]);

	T: MatrixND;
	H: MatrixND;

	constructor(
		init_state: MatrixND,
		state_labels: HMM_BinaryVariable[],
		transition_model: MatrixND,
		sensor_model: MatrixND,
		sensor_labels: HMM_BinaryVariable[],
    graph_dir: HMM_GraphDir = "LR",
	) {
    this.graph_dir = graph_dir;

		// state
		this.var_count = init_state.rows;
		if (init_state.cols != 1) throw `State has to be 1D vector`;
		this.p0 = init_state.copy();
		// this.p = init_state.copy();
		this.f = init_state.copy();

		// this.p_trace.push(this.p);
		this.f_trace.push({ distro: this.f, mode: "init" });

		if (state_labels.length !== this.f.rows) throw `Every variable has to be labeled!`;
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

    // initialize b
    this.b = ones_like(this.f);

    // set "time step"
    this.t = this.f_trace.length;
	}

	clear(): void {
		this.f = this.p0;
		this.f_trace = [{ distro: this.p0, mode: 'init'} ];
		this.e_trace = [];
    this.b_rev_trace = [];
    // this.s_rev_trace = [];
    this.s_end = 0;
    this.s_pos = 0;
	}

	predict(): { p: MatrixND; e: MatrixND } {
		this.f = this.T.mul(this.f);
		this.f_trace.push({distro: this.f, mode: "predict"});
		this.e = this.H.mul(this.f);
		this.e_trace.push({ distro: this.e, mode: "predict" });
		return {
			p: this.f,
			e: this.e
		};
	}

	filter(obs: number[]): { e: MatrixND; f: MatrixND } {
		if (obs.length !== this.sensor_count)
			throw `Observation mismatch (${obs.length},1) vs. (${this.H.rows},1)!`;

		const obs_vec = row_vec(obs); // Sx1
		const O = obs_vec.mul(this.H).diag(); // 1xN => NxN
		this.f = O.mul(this.T).mul(this.f).norm1();
		this.f_trace.push({distro: this.f, mode: "filter"});
		this.e = col_vec(obs);
		this.e_trace.push({ distro: this.e, mode: "filter" });
		return {
			e: this.e,
			f: this.f
		};
	}
  
  backward(): { b: MatrixND; s: MatrixND } {
    const t = this.f_trace.length;

    if (t !== this.s_end || this.s_end < this.s_pos) {
      // this.s_rev_trace = []; // clear last smoothing
      // restart
      this.s_end = t;
      this.s_pos = t-1;

      this.b = ones_like(this.f); // set to ones-vector
    }

    // run out of evidence
    if (this.s_pos-1 < 0) return { b: this.b, s: this.s };

    const prev_e = this.e_trace[this.s_pos-1].distro.transpose();

    const O = prev_e.mul(this.H).diag(); // Nx1 => NxN

    const prev_f = this.f_trace[this.s_pos].distro;

    this.s = prev_f.hadamard(this.b).norm1();

    this.b = this.T.transpose().mul(O).mul(this.b);

    this.b_rev_trace.push(this.b);

    this.f_trace[this.s_pos].smoothed = this.s;

    this.s_pos--;
    
    return {
      b: this.b,
      s: this.s,
    }
  }

  // most likely values
  *most_likely_f(): Generator<HMM_ValuedBinaryVariable, void, unknown> {
    for (const f of this.f_trace) {
      const { index, value } = f.distro.max_val();
      const variable = this.p_labels[index];
      const out: HMM_ValuedBinaryVariable = {
        ...variable,
        prob: value,
        mode: f.mode
      }
      yield out;
    } 
  }

  *most_likely_e(): Generator<HMM_ValuedBinaryVariable | undefined, void, unknown> {
    yield undefined; // first value will always be empty
    for (const e of this.e_trace) {
      const { index, value } = e.distro.max_val();
      const variable = this.e_labels[index];
      const out: HMM_ValuedBinaryVariable = {
        ...variable,
        prob: value,
        mode: e.mode
      }
      yield out;
    } 
  }

  *most_likely_s(): Generator<HMM_ValuedBinaryVariable | undefined, void, unknown> {
    for (const f of this.f_trace) {
      if (!f.smoothed) {
        yield undefined;
        continue;
      }
      const { index, value } = f.smoothed.max_val();
      const variable = this.p_labels[index];
      const out: HMM_ValuedBinaryVariable = {
        ...variable,
        prob: value,
        mode: f.mode
      }
      yield out;
    } 
  }

	// printing stuff
	format_prob(kind: 'P(x)' | 'P(e)' | 'P(x|e)') {
		let out = '';
		for (let i = 0; i < this.p_labels.length; i++) {
			const label = this.p_labels[i].name;
			let val;
			switch (kind) {
				case 'P(x)':
					val = this.f;
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

	format_graph_for_mermaid(mode: HMM_Mode, show_evidence: boolean): string {
		const premable = `flowchart ${this.graph_dir}`;
		const nodes: string[] = [];
		const conns: string[] = [];
		const styles: string[] = [];

		const N = this.p_labels.length;
		for (let i = 0; i < N; i++) {
			let value_label = '';
			switch (mode) {
				case 'predict':
				case 'filter':
        case 'init':
        case 'backward':
          value_label = `<b>p<sub>${i}</sub></b> = ${fmt.num(this.f.v(i))}`;
					break;
				default:
					const NEVER: never = mode;
			}

      const label = this.p_labels[i];
			const node_name = `h${i}(["<b>x<sub>${i}</sub></b> ≙  (${label.name}) \n${value_label}"])`;
			nodes.push(node_name);
			// nodes.push(`d${i}((x<sub>${i}</sub>))`);
			styles.push(`style h${i} fill:white;`);

			for (const [j, p] of this.T.col_at(i).entries()) {
				if (p === 0) continue;
				conns.push(`h${i} -->|${p}| h${j}`);
			}
		}

    let E = this.e_labels.length;
    if (show_evidence) {
      for (let j = 0; j < E; j++) {
        let value_label = '';
        switch (mode) {
          case 'predict':
          case 'filter':
          case 'init':
          case 'backward':
            value_label = `<b>p<sub>${j}</sub></b> = ${fmt.num(this.e.v(j))}`;
            break;
          default:
            const NEVER: never = mode;
        }

        nodes.push(`e${j}{{"<b>e<sub>${j}</sub></b> ≙  (${this.e_labels[j].name}) \n${value_label}"}}`)

        for (const [i, p] of this.H.row_at(j).entries()) {
          if (p === 0) continue;
          conns.push(`h${i} -.->|${p}| e${j}`);
        }
      }
    }

		const out = [premable, ...nodes, ...conns, ...styles].join('\n');

		return out;
	}
}

export function FALLBACK_HMM() {
  return build_hmm(
    [
      {name: "Error", domain: [true, false]}
    ],
    [0.5, 0.5],
    [
      0.5, 0.5,
      0.5, 0.5,
    ],
    [
      {name: "Blue Screen", domain: [true, false]}
    ],
    [
      0.8, 0,
      0.2, 1
    ]
  )
}

export function RAIN_TEMP_UMBRELLA_TSHIRT_HMM() {
  return build_hmm(
    [
      { name: 'Rain', domain: [true, false] },
      { name: 'T', domain: ['cold', 'hot'] }
    ],
    [0.25, 0.25, 0.25, 0.25],
    [
  //  R c  R h -R c -R h --> TO
      0.4, 0.6, 0.7, 0.1, // R c 
      0.1, 0.3, 0.1, 0.1, // R h
      0.4, 0.0, 0.1, 0.1, // -R c
      0.1, 0.1, 0.1, 0.7  // -R h
    ],
    [
      { name: 'Umbrella', domain: [true, false] },
      { name: 'T-Shirt', domain: [true, false] }
    ],
    [
  //  R c  R h -R c -R h
      0.1, 0.7, 0.05, 0.3, // umbrella, t-shirt
      0.6, 0.2, 0.3, 0.05, // umbrella, -t-shirt
      0.1, 0.05, 0.5, 0.4, // -umbrella, t-shirt
      0.2, 0.05, 0.15, 0.25  // -umbrella, -t-shirt
    ]
  )
}

export function SLEEPY_STUDENTS_HMM() {
  return build_hmm(
    [
      {name: 'Enough sleep', domain: [true, false]}
    ],
    [0.7, 0.3],
    [
      0.8, 0.3,
      0.2, 0.7,
    ],
    [
      { name: "red eyes", domain: [true, false] },
      { name: "sleeping", domain: [true, false] }
    ],
    [
      0.02, 0.21,
      0.18, 0.49,
      0.08, 0.09,
      0.72, 0.21
    ]
  )
}

export function RAIN_UMBRELLA_HMM() {
  return build_hmm(
    [
      {name: 'Rain', domain: [true, false]}
    ],
    [0.5, 0.5],
    [
      0.7, 0.3,
      0.3, 0.7,
    ],
    [
      { name: "Umbrella", domain: [true, false] },
    ],
    [
      0.9, 0.2,
      0.1, 0.8,
    ]
  )
}

export function TRIP_PLANNING_HMM() {
  try {
  const hmm = build_hmm(
    [
      {name: 'Purpose', domain: ["Home", "Work", "Leasure"]},
      {name: 'By', domain: ["Car", "Bike"]},
    ],
    [0.5, 0.5, 0, 0, 0, 0],
    [
    //HC   HB   WC   WB   LC   LB
      0.0, 0.0, 0.5, 0.0, 0.8, 0.0, // HC
      0.0, 0.0, 0.0, 0.4, 0.0, 0.6, // HB
      0.5, 0.5, 0.0, 0.0, 0.2, 0.0, // WC
      0.3, 0.3, 0.0, 0.0, 0.0, 0.1, // WB
      0.1, 0.1, 0.5, 0.0, 0.0, 0.0, // LC
      0.1, 0.1, 0.0, 0.6, 0.0, 0.3, // LB
    ],
    [
      { name: "Location", domain: ["Home", "Office", "Gym", "Bar", "Lake"] },
    ],
    [
    //HC   HB   WC   WB   LC   LB
      1.0, 1.0, 0.0, 0.0, 0.0, 0.0, // Home
      0.0, 0.0, 1.0, 1.0, 0.0, 0.0, // Office
      0.0, 0.0, 0.0, 0.0, 0.3, 0.5, // Gym
      0.0, 0.0, 0.0, 0.0, 0.1, 0.4, // Bar
      0.0, 0.0, 0.0, 0.0, 0.6, 0.1, // Lake
    ],
    "TD"
  )
  return hmm;
  } catch(e) {
    console.error(e);
    return FALLBACK_HMM();
  }
}