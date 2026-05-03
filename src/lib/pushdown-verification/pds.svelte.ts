import type { HuiGraphDefinition } from "$lib/hui-graphs/hui-core";
import { find_pdfl, make_pdfl_automaton, make_pdfl_data } from "$lib/regex/glushkov";
import { cat, format_regex, re_alias, type RegexNode } from "$lib/regex/regex";

const EMPTY: EmptySymbol = 0;
export type ControlLocation = string;
export type EmptySymbol = 0;
export type StackSymbol = string | EmptySymbol;
export type StackSequence = StackSymbol[];
export type Transition = [ControlLocation, StackSymbol, ControlLocation, StackSequence];
export interface RegularConfiguration {
  loc: ControlLocation,
  w: RegexNode,
}
export interface Configuration {
  loc: ControlLocation,
  w: StackSequence,
}
export interface ConfigDiff {
  loc: ControlLocation,
  stack_push: StackSequence
}
interface HistoryTransition {
  to: Configuration;
  popped: StackSymbol;
  pushed: StackSymbol[];
}
interface HistoryStep {
  from: Configuration | null,
  transitions: HistoryTransition[]
}

// helper functions
function format_config(config: Configuration | null) {
  if (!config) return "*";
  return `${config.loc}|${config.w.join(",")}>`;
}

function format_reg_config(config: RegularConfiguration | null) {
  if (!config) return "*";
  return `${config.loc}|${format_regex(config.w)}>`;
}

function render_stack_symbol(symbol: StackSymbol) {
  if (symbol === 0) return `&epsilon;`
  else return `&gamma;<sub>${symbol}</sub>`
}

function render_stack_sequence(symbols: StackSequence) {
  return symbols.map(v => render_stack_symbol(v)).join("") || render_stack_symbol(0);
}

function render_stack_swap(popped: StackSymbol, pushed: StackSequence) {
  return `${render_stack_symbol(popped)} / ${render_stack_sequence(pushed)}`;
}

function render_control_location(loc: ControlLocation) {
  return `p<sup>${loc}</sup>`;
}

function render_proxy_location(loc: ControlLocation) {
  return `s<sup>${loc}</sup>`;
}

function render_automaton_state(loc: ControlLocation) {
  return `q<sub>${loc}</sub>`;
}

function render_config(config: Configuration | null) {
  if (!config) return "<table><tbody><tr><td>*</td></tr></tbody></table>";
  return `<table><tbody>
  <tr><th>${render_control_location(config.loc)}</th></tr>
  ${config.w.toReversed().map(g => `<tr><td>${render_stack_symbol(g)}</td></tr>`).join("")}
  </tbody></table>`
}

function equal_config(a: Configuration, b: Configuration) {
  if (a.loc !== b.loc) return false;
  if (a.w.length !== b.w.length) return false;
  for (let [i, g] of a.w.entries()) {
    if (g !== b.w[i]) return false;
  } 
  return true;
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
  
  constructor(
    initial_configs: Configuration[],
    rules: Transition[]
  ) {
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
      config_diffs.push({loc: to, stack_push});
    }

    this.history = $state([]);
    this.reset();
  }

  reset() {
    this.configs = [...this.initial_configs];
    this.history = [[{from: null, transitions: this.initial_configs.map(c => {return {to: c, popped: 0, pushed: []}})}]];
  }

  step() {
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
        const add_config: Configuration = {loc: diff.loc, w: [...work_stack, ...diff.stack_push.toReversed()]};
        if (equal_config(add_config, config)) continue; // we do not add the same config again!
        transitions.push({to: add_config, popped: top_symbol || 0, pushed: [...diff.stack_push]});
      }

      const empty_diffs = trigger_map.get(EMPTY) || []; // we can always take such transitions without having to look at the stack first
      for (const diff of empty_diffs) {
        // we reverse, in order to simulate pushing one element after another
        const add_config: Configuration = {loc: diff.loc, w: [...work_stack, ...diff.stack_push.toReversed()]};
        if (equal_config(add_config, config)) continue; // we do not add the same config again!
        transitions.push({ to: add_config, popped: 0, pushed: [...diff.stack_push]});
      }

      if (config_diffs.length === 0 && empty_diffs.length === 0) {
        // we could not leave the current config
        new_configs.push(config);
      }

      const to_configs: Configuration[] = transitions.map(v => v.to);

      // tracking changes
      new_configs.push(...to_configs);
      history_enty.push({from: config, transitions})
    }

    this.configs = new_configs;
    this.history.push(history_enty);
  }

  graph_history(): HuiGraphDefinition {
    const graph: HuiGraphDefinition = {
      edges: [],
      nodes: []
    }

    const node_set: Set<string> = new Set();

    for (const history_slice of this.history) {
      for (const history_step of history_slice) {
        const from_str = format_config(history_step.from);

        for (const transition of history_step.transitions) {
          const to_str = format_config(transition.to);

          if (!node_set.has(to_str)) {
            node_set.add(to_str);
            graph.nodes.push({
              id: to_str,
              label: render_config(transition.to),
              labelClasses: []
            })
          }

          if (!history_step.from) continue;
          graph.edges.push({
            fromId: from_str,
            toId: to_str,
            label: render_stack_swap(transition.popped, transition.pushed)
          })
        }
      }
    }
    return graph;
  }

  graph(): HuiGraphDefinition {
    const graph: HuiGraphDefinition = {
      edges: [],
      nodes: []
    }

    const node_set: Set<string> = new Set();
    for (const [from, popped, to, pushed] of this.rules) {
      if (!node_set.has(from)) {
        node_set.add(from);
        graph.nodes.push({
          id: from,
          label: render_control_location(from),
          labelClasses: ["hui", "node", "rounded"]
        })
      }

      if (!node_set.has(to)) {
        node_set.add(to);
        graph.nodes.push({
          id: to,
          label: render_control_location(to),
          labelClasses: ["hui", "node", "rounded"]
        })
      }

      graph.edges.push({
        fromId: from,
        toId: to,
        label: render_stack_swap(popped, pushed)
      });
    }

    return graph;
  }

}


type MA_State = string;
type MA_Transition = [MA_State, StackSymbol, MA_State];

function equal_transition(a: MA_Transition, b: MA_Transition) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

function transition_id(a: MA_Transition) {
  return `(${a.join(",")})`;
}

export class MA {
  pds: PDS;
  targets: RegularConfiguration[];

  def: MA_Transition[] = $state([]);
  state_to_loc: Map<MA_State, ControlLocation> = new Map();
  loc_to_state: Map<ControlLocation, MA_State> = new Map();
  states: Set<MA_State> = new Set();
  initial_states: Set<MA_State> = new Set();
  accepting_states: Set<MA_State> = new Set();
  active_states: Set<MA_State> = new Set();
  registered_transitions: Set<string> = new Set();

  id = 0;
  index = $state(0);

  constructor(
    targets: RegularConfiguration[],
    pds: PDS,
  ) {
    this.pds = pds;
    this.targets = targets;

    this.setup();
  }

  next_id(): string {
    return "" + this.id++;
  }

  new_state(accepting: boolean, initial: boolean, loc?: ControlLocation) {
    let s = loc ? this.loc_to_state.get(loc) || this.next_id() : this.next_id();
    return this.register_state(s, accepting, initial, loc);
  }

  register_state(s: string, accepting: boolean, initial: boolean, loc?: ControlLocation) {
    if (accepting) this.accepting_states.add(s);
    if (initial) this.initial_states.add(s);
    this.states.add(s);
    if (loc) {
      this.state_to_loc.set(s, loc);
      this.loc_to_state.set(loc, s);
    }
    return s;
  }

  new_transition(from: MA_State, trigger: StackSymbol, to: MA_State) {
    const t: MA_Transition = [from, trigger, to];
    const name = transition_id(t);
    if (this.registered_transitions.has(name)) return t;
    this.registered_transitions.add(name);
    this.def.push(t);
    return t;
  }

  setup() {
    this.index = 0;
    this.states.clear();
    this.accepting_states.clear();
    this.initial_states.clear();
    // name rgistering
    this.loc_to_state.clear();
    this.state_to_loc.clear();
    this.registered_transitions.clear();

    this.def = [];
    this.id = 0;

    let charset_id = 0;
    // adding states for target configs
    for (const t of this.targets) {
      const [w, M, tr, new_id] = re_alias(t.w, ++charset_id);
      charset_id = new_id;
      const pdfl = find_pdfl(w);
      const s = "x" + t.loc;
      const auto = make_pdfl_automaton(M, pdfl, s).collapse_equal_nodes();

      if (auto.init_states.size !== 1) throw "Something went wrong!";
      const init = [...auto.init_states][0];
      const rules = auto.rules;
      const accepted = auto.accept_states;
      
      this.register_state(init, false, true, t.loc);
      for (const [from, trigger, to] of rules) {
        this.new_transition(
          this.register_state(from, false, false),
          trigger,
          this.register_state(to, false, false)
        )
      }

      for (const a of accepted) this.register_state(a, true, false);
    }

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
    for (const [from, tr, to] of this.def) {
      if (this.active_states.has(from) && (trigger === tr)) {
        next_states.add(to);
      }
    }

    this.active_states = next_states;
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
      new_transitions.push([s, popped , q]);
    }
    return new_transitions;
  }

  extend() {
    let new_transitions: MA_Transition[] = [];
    for (const rule of this.pds.rules) {
      new_transitions.push(...this.match_rule(rule));
    }
    
    for (const new_tr of new_transitions) this.new_transition(...new_tr);
    this.index++;
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
    }

    let inivisi_id = 0;

    for (const s of this.states) {
      const loc = this.state_to_loc.get(s);

      if (this.initial_states.has(s)) {
        graph.nodes.push({
          id: "i" + inivisi_id++,
          label: ""
        })

        graph.edges.push({
          fromId: "i" + inivisi_id,
          toId: s,
        })
      }

      graph.nodes.push({
        id: s,
        label: (loc ? render_proxy_location(loc) : render_automaton_state(s)),
        labelClasses: ["hui", "node", this.accepting_states.has(s) ? "double" : "rounded"]
      })
    }

    for (const [from, trigger, to] of this.def) {
      graph.edges.push({
        fromId: from,
        toId: to,
        label: render_stack_symbol(trigger)
      });
    }

    return graph;
  }
}

export function tex_stack_regex(node: RegexNode): string {
  switch (node.kind) {
    case 'STAR':
    case 'PLUS': {
      const op = (node.kind === "PLUS" ? "+" : "*");
      const in_paren = (node.value.kind === "CONCAT");
      if (in_paren) return "(" + tex_stack_regex(node.value) + ")" + op;
      return tex_stack_regex(node.value) + op;
    }
    case 'CHOICE': {
      const non_empty_nodes: RegexNode[] = [];
      let has_empty = false;
      for (const n of node.nodes) {
        if (n.kind === "EMPTY") {
          has_empty = true;
        } else non_empty_nodes.push(n);
      }
      const question = (has_empty ? "?" : "");
      const in_paren = non_empty_nodes.length > 1 || non_empty_nodes[0].kind === "CONCAT";
      if (!in_paren) return tex_stack_regex(non_empty_nodes[0]) + question;
      return "(" + non_empty_nodes.map(n => tex_stack_regex(n)).join("|") + ")" + question;
    }
    case 'CONCAT':
      return tex_stack_regex(node.left) + tex_stack_regex(node.right);
    case 'EMPTY':
      return `\\e`;
    case 'CHAR':
      return `\\gamma_{${node.trigger}}`;
      // if (node.trigger === "\\.") return ".";
      // return node.trigger;
  }
}