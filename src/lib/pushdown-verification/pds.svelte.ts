import type {
	HuiEdgeDefinition,
	HuiGraphDefinition,
	HuiNode,
	HuiNodeDefinition
} from '$lib/hui-graphs/hui-core';
import { tex } from '$lib/mathjax';
import { find_pdfl, make_pdfl_automaton, make_pdfl_data } from '$lib/regex/glushkov';
import { cat, format_regex, re_alias, type RegexNode } from '$lib/regex/regex';
import { LOC_COLOR_CODE } from './configs';
import type { LTL_Expr, LTL_LabelingFunction } from './pds-ltl';

export const EMPTY: EmptySymbol = 0;
export type ControlLocation = string;
export type EmptySymbol = 0;
export type StackSymbol = string | EmptySymbol;
export type StackSequence = StackSymbol[];
export type Transition = [ControlLocation, StackSymbol, ControlLocation, StackSequence];
export interface RegularConfiguration {
	loc: ControlLocation;
	w: RegexNode;
}
export interface Configuration {
	loc: ControlLocation;
	w: StackSequence;
}
export interface ConfigDiff {
	loc: ControlLocation;
	stack_push: StackSequence;
}
interface HistoryTransition {
	to: Configuration;
	popped: StackSymbol;
	pushed: StackSymbol[];
}
interface HistoryStep {
	time: number;
	from: Configuration | null;
	transitions: HistoryTransition[];
}

function equal_config(a: Configuration, b: Configuration) {
	if (a.loc !== b.loc) return false;
	if (a.w.length !== b.w.length) return false;
	for (let [i, g] of a.w.entries()) {
		if (g !== b.w[i]) return false;
	}
	return true;
}

export interface PDS_Def {
	rules: Transition[];
	initial_configs: Configuration[];
	target_configs: RegularConfiguration[];
	lambda: LTL_LabelingFunction; // LTL labeling function
	phi: LTL_Expr; // LTL statement
}

// pushdown system
export class PDS {
	readonly rules: Transition[];
	readonly initial_configs: Configuration[];

	// "dynamic" part
	configs: Configuration[];
	locs: Set<ControlLocation>;
	alphabet: Set<StackSymbol>;
	def: Map<ControlLocation, Map<StackSymbol, ConfigDiff[]>>;
	history: HistoryStep[][];
	time: number = $state(0);
	until_time: number = $state(0);

	constructor(initial_configs: Configuration[], rules: Transition[]) {
		this.initial_configs = initial_configs;
		this.rules = rules;
		this.configs = $state([...initial_configs]);

		this.def = new Map();
		this.locs = new Set();
		this.alphabet = new Set();
		for (const [from, trigger, to, stack_push] of rules) {
			this.alphabet.add(trigger);
			for (const a of stack_push) this.alphabet.add(a);
			this.locs.add(from);
			this.locs.add(to);

			if (!this.def.has(from)) {
				this.def.set(from, new Map());
			}

			const trigger_map = this.def.get(from)!;
			if (!trigger_map.has(trigger)) {
				trigger_map.set(trigger, []);
			}

			const config_diffs = trigger_map.get(trigger)!;
			config_diffs.push({ loc: to, stack_push });
		}

		this.history = $state([]);
		this.reset();
	}

	reset() {
		this.configs = [...this.initial_configs];
		this.history = [
			[
				{
					time: (this.time = this.until_time = 0),
					from: null,
					transitions: this.initial_configs.map((c) => {
						return { to: c, popped: 0, pushed: [] };
					})
				}
			]
		];
	}

	loc_set() {
		return new Set(this.configs.map((c) => c.loc));
	}

	step() {
		this.time++;
		this.until_time++;
		const new_configs: Configuration[] = [];
		const history_enty: HistoryStep[] = [];

		for (const config of this.configs) {
			const transitions: HistoryTransition[] = [];

			const trigger_map = this.def.get(config.loc);
			if (!trigger_map) continue;

			const work_stack = [...config.w];

			const top_symbol = work_stack.pop();
			const config_diffs: ConfigDiff[] = [];
			if (top_symbol) config_diffs.push(...(trigger_map.get(top_symbol) || []));

			for (const diff of config_diffs) {
				// we reverse, in order to simulate pushing one element after another
				const add_config: Configuration = {
					loc: diff.loc,
					w: [...work_stack, ...diff.stack_push.toReversed()]
				};
				// if (equal_config(add_config, config)) continue; // we do not add the same config again!
				transitions.push({ to: add_config, popped: top_symbol || 0, pushed: [...diff.stack_push] });
			}

			const empty_diffs = trigger_map.get(EMPTY) || []; // we can always take such transitions without having to look at the stack first
			for (const diff of empty_diffs) {
				// we reverse, in order to simulate pushing one element after another
				const add_config: Configuration = {
					loc: diff.loc,
					w: [...work_stack, ...diff.stack_push.toReversed()]
				};
				if (equal_config(add_config, config)) continue; // we do not add the same config again!
				transitions.push({ to: add_config, popped: 0, pushed: [...diff.stack_push] });
			}

			if (config_diffs.length === 0 && empty_diffs.length === 0) {
				// we could not leave the current config
				new_configs.push(config);
			}

			const to_configs: Configuration[] = transitions.map((v) => v.to);

			// tracking changes
			new_configs.push(...to_configs);
			history_enty.push({ time: this.time, from: config, transitions });
		}

		this.configs = new_configs;
		this.history.push(history_enty);
	}

	graph_history(tex_mode: boolean): HuiGraphDefinition {
		const graph: HuiGraphDefinition = {
			edges: [],
			nodes: []
		};

		const node_set: Map<string, HuiNodeDefinition> = new Map();
		const edge_set: Set<string> = new Set();

		for (const [t, history_slice] of this.history.entries()) {
			for (const history_step of history_slice) {
				const final_slice = history_step.time === this.until_time;
				const from_str = format_config(history_step.from);

				for (const transition of history_step.transitions) {
					const to_str = format_config(transition.to);

					if (!node_set.has(to_str)) {
						const node: HuiNodeDefinition = {
							id: to_str,
							label: tex_mode ? tex(tex_config(transition.to)) : render_config_table(transition.to),
							labelClasses: [
								tex_mode ? 'p-2' : 'p-0',
								'border-2',
								tex_mode ? 'rounded-xl' : 'rounded-sm',
                ...color_loc(transition.to.loc, final_slice)
							],
							hidden: history_step.time > this.until_time
						};
						node_set.set(to_str, node);
						graph.nodes.push(node);
					}

          if (final_slice) {
            node_set.get(to_str)!.labelClasses!.push(...color_loc(transition.to.loc, final_slice));
          }

					if (!history_step.from) continue;
					const edge_str = from_str + ' -> ' + to_str;
					if (edge_set.has(edge_str)) continue;
					edge_set.add(edge_str);
					graph.edges.push({
						fromId: from_str,
						toId: to_str,
						label: tex(tex_stack_swap(transition.popped, transition.pushed)),
						hidden: history_step.time > this.until_time
					});
				}
			}
		}
		return graph;
	}

	graph(): HuiGraphDefinition {
		const graph: HuiGraphDefinition = {
			edges: [],
			nodes: []
		};

		const node_set: Set<string> = new Set();
		const edge_map = new Map<string, HuiEdgeDefinition>();
		const loc_set: Set<string> = this.loc_set();

		for (const [from, popped, to, pushed] of this.rules) {
			if (!node_set.has(from)) {
				node_set.add(from);
				graph.nodes.push({
					id: from,
					label: tex(tex_loc(from)),
					labelClasses: [
						'hui',
						'border-2',
						'p-2',
						'rounded-xl',
            ...color_loc(from, loc_set.has(from))
					]
				});
			}

			if (!node_set.has(to)) {
				node_set.add(to);
				graph.nodes.push({
					id: to,
					label: tex(tex_loc(to)),
					labelClasses: [
						'hui',
						'border-2',
						'p-2',
						'rounded-xl',
						...color_loc(to, loc_set.has(to))
					]
				});
			}

			const edge_id = from + `\\` + to;
			let edge = edge_map.get(edge_id);
			const label = tex(tex_stack_swap(popped, pushed));

			if (!edge) {
				edge = {
					fromId: from,
					toId: to,
					label
				};
				edge_map.set(edge_id, edge);
				graph.edges.push(edge);
			} else {
				edge.label += '' + label;
			}
		}

		return graph;
	}
}

type MA_State = string;
interface MA_Transition {
	from: MA_State;
	trigger: StackSymbol;
	to: MA_State;
	created_at_index: number;
}
// type MA_Transition = [MA_State, StackSymbol, MA_State];

function equal_transition(a: MA_Transition, b: MA_Transition) {
	return a.from === b.from && a.trigger === b.trigger && a.to === b.to;
}

function transition_id(a: MA_Transition) {
	return `(${a.from}, ${a.trigger}, ${a.to})`;
}

export class MA {
	pds: PDS;
	targets: RegularConfiguration[];

	def: MA_Transition[] = $state([]);
	state_to_loc: Map<MA_State, ControlLocation> = new Map();
	state_to_name: Map<MA_State, string> = new Map();
	loc_to_state: Map<ControlLocation, MA_State> = new Map();
	states: Set<MA_State> = new Set();
	initial_states: Set<MA_State> = new Set();
	accepting_states: Set<MA_State> = new Set();
	active_states: Set<MA_State> = new Set();
	registered_transitions: Set<string> = new Set();

	id = 0;
	name = 1;
	index = $state(0);
	until_index = $state(0);

	constructor(targets: RegularConfiguration[], pds: PDS) {
		this.pds = pds;
		this.targets = targets;

		this.setup();
	}

	next_id(): string {
		return '' + this.id++;
	}

	next_name(): string {
		return '' + this.name++;
	}

	new_state(accepting: boolean, initial: boolean, loc?: ControlLocation) {
		let s = loc ? this.loc_to_state.get(loc) || this.next_id() : this.next_id();
		return this.register_state(s, accepting, initial, loc);
	}

	register_name(s: string) {
		if (!this.state_to_name.has(s)) {
			const name = this.next_name();
			console.log('naming', s, '=', name);
			this.state_to_name.set(s, name);
		}
	}

	register_state(s: string, accepting: boolean, initial: boolean, loc?: ControlLocation) {
		if (accepting) this.accepting_states.add(s);
		if (initial) this.initial_states.add(s);
		this.states.add(s);
		if (loc) {
			this.state_to_loc.set(s, loc);
			this.loc_to_state.set(loc, s);
		}

		if (!this.state_to_loc.get(s)) {
			this.register_name(s);
		}
		return s;
	}

	new_transition(from: MA_State, trigger: StackSymbol, to: MA_State) {
		const t: MA_Transition = { from, trigger, to, created_at_index: this.index };
		const name = transition_id(t);
		if (this.registered_transitions.has(name)) return t;
		this.registered_transitions.add(name);
		this.def.push(t);
		return t;
	}

	setup() {
		this.index = this.until_index = 0;
		this.states.clear();
		this.accepting_states.clear();
		this.initial_states.clear();
		// name rgistering
		this.loc_to_state.clear();
		this.state_to_loc.clear();
		this.state_to_name.clear();
		this.registered_transitions.clear();

		this.def = [];
		this.id = 0;
    this.name = 1;

		let charset_id = 0;
		// adding states for target configs
		for (const t of this.targets) {
			const [w, M, tr, new_id] = re_alias(t.w, charset_id + 1);
			charset_id = new_id + 1;
			console.log('charset', charset_id);
			const pdfl = find_pdfl(w);
			const s = '_' + t.loc;
			const auto = make_pdfl_automaton(M, pdfl, s).collapse_equal_nodes();

			if (auto.init_states.size !== 1) throw 'Something went wrong!';
			const init = [...auto.init_states][0];
			const rules = auto.rules;
			const accepted = auto.accept_states;

			this.register_state(init, false, true, t.loc);
			for (const [from, trigger, to] of rules) {
				this.new_transition(
					this.register_state(from, false, false),
					trigger,
					this.register_state(to, false, false)
				);
			}

			for (const a of accepted) this.register_state(a, true, false);
		}

		this.id = charset_id + 1;

		// adding all states of pds
		for (const l of this.pds.locs) {
			const s = this.new_state(false, true, l);
		}
	}

	start() {
		this.active_states = new Set(this.initial_states);
	}

	consume(trigger: StackSymbol) {
		const next_states: Set<MA_State> = new Set();
		for (const { from, trigger: tr, to } of this.def) {
			if (this.active_states.has(from) && trigger === tr) {
				next_states.add(to);
			}
		}

		this.active_states = next_states;
	}

	check_config(config: Configuration): boolean {
		this.start();
		const init_state = this.loc_to_state.get(config.loc);
		if (!init_state) return false;
		this.active_states = new Set([init_state]);
		for (const sym of config.w.toReversed()) {
			this.consume(sym);
			if (this.active_states.size === 0) return false;
		}
		for (const state of this.active_states) {
			if (this.accepting_states.has(state)) return true;
		}
		return false;
	}

	match_rule([from, popped, to, pushed]: Transition): MA_Transition[] {
		this.start(); // reset active states
		this.active_states = new Set([this.loc_to_state.get(to)!]);
		for (const trigger of pushed) {
			this.consume(trigger);
			if (this.rejected()) return [];
		}

		// we didnt reject!
		const new_transitions: MA_Transition[] = [];
		for (const q of this.active_states) {
			const s = this.loc_to_state.get(from);
			if (!s) continue;
			new_transitions.push({ from: s, trigger: popped, to: q, created_at_index: this.index });
		}
		return new_transitions;
	}

	extend() {
		this.index++;
		this.until_index++;
		let new_transitions: MA_Transition[] = [];
		for (const rule of this.pds.rules) {
			new_transitions.push(...this.match_rule(rule));
		}
		for (const new_tr of new_transitions)
			this.new_transition(new_tr.from, new_tr.trigger, new_tr.to);
	}

	rejected(): boolean {
		return this.active_states.size === 0;
	}

	reset() {
		this.setup();
	}

	graph(): HuiGraphDefinition {
		const graph: HuiGraphDefinition = {
			nodes: [],
			edges: []
		};

		let inivisi_id = 0;

		for (const s of this.states) {
			const loc = this.state_to_loc.get(s);
			const name = this.state_to_name.get(s);

      inivisi_id++;

			if (this.initial_states.has(s)) {
				graph.nodes.push({
					id: 'i' + inivisi_id,
					label: '',
          labelClasses: ["bg-black"],
				});

				graph.edges.push({
					fromId: 'i' + inivisi_id,
					toId: s,
					label: loc ? tex(tex_loc(loc)) : undefined
				});
			}

			graph.nodes.push({
				id: s,
				label: loc
					? tex(tex_proxy_loc(loc))
					: name
						? tex(tex_automaton_state(name))
						: tex(tex_automaton_state(s)),
				labelClasses: [
					'hui',
					'border-2',
					'p-2',
					'rounded-xl',
					...color_loc(loc, true),
					...(this.accepting_states.has(s) ? ['outline-2', '-outline-offset-5'] : [])
				]
			});
		}

		const edge_map = new Map<string, HuiEdgeDefinition>();
		for (const { from, trigger, to, created_at_index } of this.def) {
			const edge_id = from + `\\` + to;
			let edge = edge_map.get(edge_id);
			const label = render_stack_symbol(trigger);

			if (!edge) {
				edge = {
					hidden: created_at_index > this.until_index,
					fromId: from,
					toId: to,
					label,
					labelStyle: { 'font-family': 'Cambria', 'font-style': 'italic' }
				};
				edge_map.set(edge_id, edge);
				graph.edges.push(edge);
			} else if (created_at_index <= this.until_index) {
				edge.label += ',' + label;
			}
		}

		return graph;
	}
}

export function tex_stack_regex(node: RegexNode): string {
	switch (node.kind) {
		case 'STAR':
		case 'PLUS': {
			const op = node.kind === 'PLUS' ? '+' : '*';
			const in_paren = node.value.kind !== 'CHAR' && node.value.kind !== 'EMPTY';
			if (in_paren) return '(' + tex_stack_regex(node.value) + ')^' + op;
			return tex_stack_regex(node.value) + '^' + op;
		}
		case 'CHOICE': {
			const non_empty_nodes: RegexNode[] = [];
			let has_empty = false;
			for (const n of node.nodes) {
				if (n.kind === 'EMPTY') {
					has_empty = true;
				} else non_empty_nodes.push(n);
			}
			const question = has_empty ? '?' : '';
			const in_paren = non_empty_nodes.length > 1 || non_empty_nodes[0].kind === 'CONCAT';
			if (!in_paren) return tex_stack_regex(non_empty_nodes[0]) + question;
			return '(' + non_empty_nodes.map((n) => tex_stack_regex(n)).join('|') + ')' + question;
		}
		case 'CONCAT':
			return tex_stack_regex(node.left) + tex_stack_regex(node.right);
		case 'EMPTY':
			return `\\epsilon`;
		case 'CHAR':
			if (isNaN(parseInt(node.trigger))) {
				return node.trigger;
			}
			return `\\gamma_{${node.trigger}}`;
		// if (node.trigger === "\\.") return ".";
		// return node.trigger;
	}
}

export function tex_stack_symbol(sym: StackSymbol): string {
	if (sym === 0) return `\\varepsilon`;
	if (isNaN(parseInt(sym))) return sym;
	return `\\gamma_{${sym}}`;
}

export function render_stack_symbol(sym: StackSymbol): string {
	if (sym === 0) return `&epsilon;`;
	if (isNaN(parseInt(sym))) return sym;
	return `&gamma;<sub>${sym}</sub>`;
}

export function tex_stack_sequence(seq: StackSequence): string {
	return seq.map((s) => tex_stack_symbol(s)).join('\\,') || tex_stack_symbol(0);
}

export function tex_loc(state: ControlLocation): string {
	const index = parseInt(state);
	if (isNaN(index)) return `\\text{${state}}`;
	return `p^{${index}}`;
}

export function render_loc(state: ControlLocation): string {
	const index = parseInt(state);
	if (isNaN(index)) return `${state}`;
	return `p<sup>${index}</sup>`;
}

export function tex_config(sym: Configuration): string {
	return `\\langle ${tex_loc(sym.loc)}, ${tex_stack_sequence(sym.w.toReversed())} \\rangle`;
}

export function tex_reg_config(sym: RegularConfiguration): string {
	return `\\langle ${tex_loc(sym.loc)}, ${tex_stack_regex(sym.w)} \\rangle`;
}

// helper functions
function format_config(config: Configuration | null) {
	if (!config) return '*';
	return `<${config.loc}|${config.w.join(',')}>`;
}

function format_reg_config(config: RegularConfiguration | null) {
	if (!config) return '*';
	return `<${config.loc}|${format_regex(config.w)}>`;
}

function tex_stack_swap(popped: StackSymbol, pushed: StackSequence) {
	return `${tex_stack_symbol(popped)} / ${tex_stack_sequence(pushed)}`;
}

function tex_proxy_loc(loc: ControlLocation) {
	const index = parseInt(loc);
	if (isNaN(index)) {
		return `\\text{${loc}} '`;
	}
	return `s^{${index}}`;
}

function tex_automaton_state(loc: ControlLocation) {
	return `q_{${loc}}`;
}

function render_config_table(config: Configuration | null) {
	if (!config) return '';
	return `<div class="flex flex-col">
  <div class="border-b-2 p-2 font-bold">${render_loc(config.loc)}</div>
  ${
		config.w
			.toReversed()
			.map(
				(g, i) =>
					`<div class="${i % 2 === 1 ? 'bg-gray-200' : 'bg-white'}">${render_stack_symbol(g)}</div>`
			)
			.join('') || '<div>&epsilon;</div>'
	}
  </div>`;
}

function color_loc(loc: string | undefined, active: boolean) {
  return loc ? ['bg-' + (LOC_COLOR_CODE[loc] + (active ? "-400" : "-100") || 'white')] : [];
}