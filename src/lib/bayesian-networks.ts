import {is_empty} from "$lib";

export enum BN {
	TRUE = 0,
	FALSE = 1
}

export type BN_LinkedQuery = Record<string, {node: BN_Node, value: number}>;
export type BN_StrippedQuery = Record<string, number>;
export type BN_QuerySettings = { node: BN_Node; name: string; values: number[]; }[];

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
    return this.format_value(this._last_drawn);
  }

	format_variable(include_values = false): string {
		return include_values ? `${this.name}=${this.format_value(this._last_drawn)}` : this.name;
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
				c.map((v, i) => this.deps[i].format_value(v)).join('\t| ') +
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
      out += `<th class="h2">` + this.name + "=" + this.format_value(v) + "</th>";
    }

    out += "</tr>"

    for (const c of combs) {
      out += "<tr>"

      let active_comb = true;
      for (const [i, v] of c.entries()) {
        const d = this.deps[i];
        if (d._last_drawn !== v) active_comb = false;
        out += `<td class="h3">` + d.format_value(v) + "</td>";
      }

      const probs = full_index(c, this.prob_matrix);
      for (let v = 0; v < this.domain_size; v++) {
        out += `<td class="${active_comb && v === this._last_drawn ? 'picked' : ''} ${active_comb ? 'active' : ''}">` + (probs[v] !== undefined ? probs[v] : 1 - probs.reduce((a, b) => a+b)).toFixed(3) + "</td>";
      }
      out += "</tr>"
    }
    

    out += "</table>"

		return out;
	}

	format_value(value: number) {
    if (value < 0) return "?"
		if (value >= this.domain_labels.length) return '' + value;
		return this.domain_labels[value];
	}

  set_value(v: number, p: number) {
    this._last_drawn = v;
    this._last_cond_prob = p;
  }

  get_cond_prob_for_value(v: number) {
    const prev = this.deps.map((d) => d._last_drawn);
    const probs = full_index(prev, this.prob_matrix);
    const p = (v >= probs.length) ? 1 - probs.reduce((a, b) => a+b) : probs[v];
    return p;
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
				this.set_value(v, p);
				return v;
			}
		}
    this.set_value(probs.length, 1 - probs.reduce((a, b) => a + b));
		return probs.length; // NOT case!
	}

	random_draw_and_format(): string {
		return this.name + ' = ' + this.format_value(this.random_draw());
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

	query(query: BN_StrippedQuery, evidence: BN_StrippedQuery, early_out: boolean): { fulfilled: boolean, weight: number } {
		let w = 1; // weight variable
    let mismatch = false;
    let evidence_exhausted = false;
    let query_exhausted = false;

    for (const node of this.topo) {
      // check evidence
      let v;
      if (node.name in evidence && evidence[node.name] >= 0 /*shouldn't be needed anymore*/) {
        v = evidence[node.name]; // we use the value from the evidence & multiply by the cond. prob.
        delete evidence[node.name]; // can be removed from query
        const p = node.get_cond_prob_for_value(v)
        w *= p;
        node.set_value(v, p);

        evidence_exhausted = is_empty(evidence);
      } else {
        v = node.random_draw();
      }

      // check the query
			if (node.name in query && query[node.name] >= 0 /*shouldn't be needed anymore*/) {
				if (v !== query[node.name]) mismatch = true; // we drew a wrong value
        delete query[node.name]; // can be removed from query, since it's only visited once

        query_exhausted = is_empty(query);
			} else {
				// console.warn("Malformed query:", query);
				// return false; // query is malformed and thus impossible
			}

      if (early_out && evidence_exhausted) {
        if (mismatch) return { fulfilled: false, weight: w };
        if (query_exhausted) return { fulfilled: true, weight: w };
      }
		}

    if (mismatch) return { fulfilled: false, weight: w };
		return { fulfilled: true, weight: w };
	}

  get_linked_query(): BN_LinkedQuery {
    const query: Record<string, {node: BN_Node, value: number}> = {};
    for (const node of this.topo) {
      query[node.name] = {
        node, value: node._last_drawn
      }
    }
    return query;
  }

  get_query_settings(): BN_QuerySettings {
    return this.topo.map((v) => {
			return { node: v, name: v.name, values: v.materialize_domain() };
		})
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

export function strip_linked_query(query: BN_LinkedQuery): BN_StrippedQuery {
  let stripped_query: BN_StrippedQuery = {};
  for (const name in query) {
    if (query[name].value < 0) continue;
    stripped_query[name] = query[name].value;
  }
  return stripped_query;
}

export function format_linked_query_variables(query: BN_LinkedQuery): string {
  return `${Object.values(query).filter(v => v.value >= 0).map(v => {
    const formatted_value = v.node.format_value(v.value);

    switch (formatted_value) {
      case "T": return v.node.name.toLocaleLowerCase();
      case "F": return "¬" + v.node.name.toLocaleLowerCase();
    }

    return formatted_value;
  })}`
}

export function format_linked_query(query: BN_LinkedQuery, evidence: BN_LinkedQuery) {
  const evidence_str = format_linked_query_variables(evidence);
  const query_str = format_linked_query_variables(query);
  return `P( ${query_str || "\\cdot"}${evidence_str && " | "}${evidence_str} )`
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
  const p_Toothache = new BN_Node("T", 2, [p_Cavity], [[1-0.108-0.012], [0.016+0.064]], BOOL_DOMAIN, "Toothache");
  const p_Catch = new BN_Node("D", 2, [p_Cavity], [[1-0.108-0.072], [0.016+0.144]], BOOL_DOMAIN, "Diagnosis");

  const graph = new BN_Graph([p_Toothache, p_Catch, p_Weather]);
  return graph;
}