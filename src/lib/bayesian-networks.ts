export enum BN {
	TRUE = 0,
	FALSE = 1
}

type BN_ProbMatrix = number[] | BN_ProbMatrix[];

function value_combinations(domain_a: number | number[][], domain_b: number) {
	let domain_a_size: number;
	let base_domain: number[][];
	if (typeof domain_a === 'number') {
		domain_a_size = domain_a;
		base_domain = [
			...Array(domain_a_size)
				.keys()
				.map((k) => [k])
		];
	} else {
		domain_a_size = domain_a.length;
		base_domain = domain_a;
	}

	const combs: number[][] = [];

	for (let a = 0; a < domain_a_size; a++) {
		for (let b = 0; b < domain_b; b++) {
			const new_comb = [...base_domain[a], b];
			combs.push(new_comb);
		}
	}

	return combs;
}

function dependency_combinations(deps: BN_Node[]): number[][] {
	if (deps.length <= 0) return [[]];
	let combs: number[][] = [
		...Array(deps[0].domain_size)
			.keys()
			.map((k) => [k])
	];
	for (const d of deps.slice(1)) {
		combs = value_combinations(combs, d.domain_size);
	}
	return combs;
}

function deep_index(index: number[], sub_matrix: BN_ProbMatrix): BN_ProbMatrix {
	let matrix = sub_matrix;

	for (let i of index) {
		const s = matrix[i];
		matrix = s as BN_ProbMatrix;
	}
	return matrix;
}

function full_index(index: number[], sub_matrix: BN_ProbMatrix): number[] {
	const matrix = deep_index(index, sub_matrix);
	if (matrix.length > 0 && typeof matrix[0] === 'number') return matrix as number[];
	throw 'Full index failed!';
}

export const BOOL_DOMAIN = ['T', 'F'];

export class BN_Node {
	name: string;
	domain_size: number;
	prob_matrix: BN_ProbMatrix;
	deps: BN_Node[];
	domain_labels: string[];
  description: string | undefined;

	_last_drawn: number = -1;
	_last_cond_prob: number = 0;

	constructor(
		name: string,
		domain_size: number,
		deps: BN_Node[],
		prob_matrix: BN_ProbMatrix,
		domain_labels: string[] = [],
    description?: string
	) {
		this.prob_matrix = prob_matrix;
		this.deps = deps;
		this.name = name;
		this.domain_size = domain_size;
		this.domain_labels = domain_labels;
    this.description = description;
	}

	format_expr(include_values = false): string {
		return (
			`P(${this.format_variable(include_values)}${this.deps.length > 0 ? `|${this.deps.map((d) => d.format_variable(include_values))}` : ""})` +
			(include_values ? ` = ${this.format_cond_prob()}` : '')
		);
	}

  format_last(): string {
    return this.format_label(this._last_drawn);
  }

	format_variable(include_values = false): string {
		return include_values ? `${this.name}=${this.format_label(this._last_drawn)}` : this.name;
	}

	format_cond_prob(): string {
		return this._last_cond_prob.toFixed(3);
	}

	format_table(): string {
		const combs = dependency_combinations(this.deps);

		let out: string = '';

		out += this.deps.map((v) => v.name).join('\t| ') + '\t| ' + this.format_expr() + '\n';
		for (const c of combs) {
			out +=
				c.map((v, i) => this.deps[i].format_label(v)).join('\t| ') +
				'\t| ' +
				deep_index(c, this.prob_matrix).join(' ') +
				'\n';
		}

		return out;
	}

  format_html_table(): string {
		const combs = dependency_combinations(this.deps);

    let out = `<table style="border-collapse: collapse; width: 100%">`;

    out += "<tr>" + (this.deps.length > 0 ? `<th class="bare" colspan="${this.deps.length}">` : "") + `<th class="h1" colspan="${this.domain_size}">` + this.format_expr() + "</th></tr>"

    out += "<tr>"
    for (const dep of this.deps) {
      out += `<th class="h2">` + dep.name + "</th>";
    }

    for (let v = 0; v < this.domain_size; v++) {
      out += `<th class="h2">` + this.name + "=" + this.format_label(v) + "</th>";
    }

    out += "</tr>"

    for (const c of combs) {
      out += "<tr>"
      for (const [i, v] of c.entries()) {
        const d = this.deps[i];
        out += `<td class="h3">` + d.format_label(v) + "</td>";
      }

      const probs = full_index(c, this.prob_matrix);
      for (let v = 0; v < this.domain_size; v++) {
        out += "<td>" + (probs[v] !== undefined ? probs[v] : 1 - probs.reduce((a, b) => a+b)).toFixed(2) + "</td>";
      }
      out += "</tr>"
    }
    

    out += "</table>"

		return out;
	}

	format_label(value: number) {
    if (value < 0) return "?"
		if (value >= this.domain_labels.length) return '' + value;
		return this.domain_labels[value];
	}

	random_draw(): number {
		// draw a random __value__
		const prev = this.deps.map((d) => d._last_drawn);
		const probs = full_index(prev, this.prob_matrix);
		const pi = Math.random();
		let accum = 0;
		for (const [v, p] of probs.entries()) {
			accum += p;
			if (pi < accum) {
				this._last_cond_prob = p;
				this._last_drawn = v;
				return v;
			}
		}
		this._last_cond_prob = 1 - probs.reduce((a, b) => a + b);
		this._last_drawn = probs.length;
		return probs.length; // NOT case!
	}

	random_draw_and_format(): string {
		return this.name + ' = ' + this.format_label(this.random_draw());
	}

  materialize_domain(): number[] {
    return [-1, ...Array(this.domain_size).keys()];
  }
}

export class BN_Graph {
	terminals: BN_Node[];
	topo: BN_Node[];

	constructor(terminals: BN_Node[]) {
		this.terminals = terminals;
		this.topo = topological_ordering(terminals);
	}

	draw() {
		for (const node of this.topo) {
			node.random_draw();
		}

		return this.terminals.map(t => t._last_drawn);
	}

  clear() {
    for (const node of this.topo) {
      node._last_drawn = -1;
    }
  }

	query(query: Record<string, number>, early_out = true): boolean {
		let mismatch = false;
    for (const node of this.topo) {
			const v = node.random_draw();
			if (node.name in query) {
				if (query[node.name] >= 0 && v !== query[node.name]) mismatch = true; // we drew a wrong value
        if (early_out && mismatch) return false;
			} else {
				// console.warn("Malformed query:", query);
				// return false; // query is malformed and thus impossible
			}
		}

    if (mismatch) return false;
		return true;
	}

  /**
   * Formats Graph for use in Mermaid diagrams
   */
  format_graph_for_mermaid(step?: number): string {
    let preamble = "graph LR";
    let conns: string[] = [];
    let nodes: string[] = [];

    for (const node of this.topo) {
      nodes.push(`${node.name}("<div><div><b>${node.name}</b>${node.description ? " : " + node.description : ""}</div><hr>${node.name}<sub>${step !== undefined ? step : "last"}</sub> = ${node.format_last()} ${node.format_html_table()}</div>")`);
      for (const dep of node.deps) {
        conns.push(`${dep.name} --> ${node.name}`)
      }
    }

    return preamble + "\n" + nodes.join("\n") + "\n" + conns.join("\n") + "\n";
  }
}

function topological_ordering(from: BN_Node[]) {
	const visited = new Set<BN_Node>();
	const topo: BN_Node[] = [];

	function rec_topo(from: BN_Node) {
		if (!visited.has(from)) {
			visited.add(from);
			for (const child of from.deps) {
				rec_topo(child);
			}
			topo.push(from);
		}
	}

  for (const from_node of from) rec_topo(from_node);

	return topo;
}

export function CLOUDY_BN_GRAPH(): BN_Graph {
  const p_Cloudy = new BN_Node('C', 2, [], [0.5], BOOL_DOMAIN, "Cloudy");
  const p_Sprinkler = new BN_Node('S', 2, [p_Cloudy], [[0.1], [0.5]], BOOL_DOMAIN, "Sprinkler");
  const p_Rain = new BN_Node('R', 2, [p_Cloudy], [[0.8], [0.2]], BOOL_DOMAIN, "Rain");
  const p_Wet = new BN_Node(
    'W',
    3,
    [p_Sprinkler, p_Rain],
    [
      [
        [0.5, 0.4],
        [0.8, 0.1]
      ], // sprinkler = TRUE
      [
        [0.8, 0.1],
        [0.1, 0.05]
      ] // sprinkler = FALSE
    ],
    ['wet', 'damp', 'dry'],
    "Wet grass"
  );
  const p_Lawn = new BN_Node(
    'L',
    2,
    [p_Sprinkler, p_Wet],
    [
      [
        [0.0], // wet
        [0.05], // damp
        [0.1], // dry
      ], // sprinkler = TRUE
      [
        [0.1], // wet
        [0.3], // damp
        [0.5], // dry
      ] // sprinkler = FALSE
    ],
    BOOL_DOMAIN,
    "Lawnmowing"
  )

  const graph = new BN_Graph([p_Wet, p_Lawn]);
  return graph;
}


export function BURGLAR_BN_GRAPH(): BN_Graph {
  const p_Burglar = new BN_Node("B", 2, [], [0.001], BOOL_DOMAIN, "Burglar");
  const p_Earthquake = new BN_Node("E", 2, [], [0.001], BOOL_DOMAIN, "Earthquake");
  const p_Alarm = new BN_Node("A", 2, [p_Burglar, p_Earthquake], [[[.95], [.97]], [[.29], [.001]]], BOOL_DOMAIN, "Alarm");
  const p_JohnCalls = new BN_Node("J", 2, [p_Alarm], [[0.90], [0.05]], BOOL_DOMAIN, "John calls");
  const p_MaryCalls = new BN_Node("M", 2, [p_Alarm], [[0.70], [0.01]], BOOL_DOMAIN, "Mary calls");

  const graph = new BN_Graph([p_JohnCalls, p_MaryCalls]);
  return graph;
}

export function TOOTHACHE_BN_GRAPH(): BN_Graph {
  const p_Weather = new BN_Node("W", 3, [], [0.3, 0.6], ["rain", "sunny", "fog"], "Weather");
  const p_Cavity = new BN_Node("C", 2, [], [0.1], BOOL_DOMAIN, "Cavity");
  const p_Toothache = new BN_Node("T", 2, [p_Cavity], [[0.108+0.012], [0.016+0.064]], BOOL_DOMAIN, "Toothache");
  const p_Catch = new BN_Node("D", 2, [p_Cavity], [[0.108+0.072], [0.016+0.144]], BOOL_DOMAIN, "Diagnosis");

  const graph = new BN_Graph([p_Toothache, p_Catch, p_Weather]);
  return graph;
}