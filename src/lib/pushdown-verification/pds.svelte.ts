import type { HuiGraphDefinition } from "$lib/hui-graphs/hui-core";

const EMPTY: EmptySymbol = 0;
type ControlLocation = string;
type EmptySymbol = 0;
type StackSymbol = string | EmptySymbol;
type StackSequence = StackSymbol[];
type Transition = [ControlLocation, StackSymbol, ControlLocation, StackSequence];
interface Configuration {
  loc: ControlLocation,
  stack: StackSequence,
}
interface ConfigDiff {
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
  return `${config.loc}|${config.stack.join(",")}>`;
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
  ${config.stack.toReversed().map(s => `<tr><td>${render_stack_symbol(s)}</td></tr>`).join("")}
  </tbody></table>`
}

function equal_config(a: Configuration, b: Configuration) {
  if (a.loc !== b.loc) return false;
  if (a.stack.length !== b.stack.length) return false;
  for (let i = 0; i < a.stack.length; i++) {
    if (a.stack[i] !== b.stack[i]) return false;
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
    for (const [from, trigger, to, stack_push] of rules) {
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

      const work_stack = [...config.stack];

      const top_symbol = work_stack.pop();
      const config_diffs: ConfigDiff[] = [];
      if (top_symbol) config_diffs.push(...(trigger_map.get(top_symbol) || []));

      for (const diff of config_diffs) {
        // we reverse, in order to simulate pushing one element after another
        const add_config = {loc: diff.loc, stack: [...work_stack, ...diff.stack_push.toReversed()]};
        if (equal_config(add_config, config)) continue; // we do not add the same config again!
        transitions.push({to: add_config, popped: top_symbol || 0, pushed: [...diff.stack_push]});
      }

      const empty_diffs = trigger_map.get(EMPTY) || []; // we can always take such transitions without having to look at the stack first
      for (const diff of empty_diffs) {
        // we reverse, in order to simulate pushing one element after another
        const add_config = {loc: diff.loc, stack: [...work_stack, ...diff.stack_push.toReversed()]};
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

          console.log(from_str, to_str);
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
  targets: Configuration[];

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
    targets: Configuration[],
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

    // adding states for target configs
    for (const t of this.targets) {
      const s = this.new_state(false, true, t.loc);
      let last_s = s;
      for (const [i, gamma] of t.stack.entries()) {
        const q = this.new_state(i === t.stack.length-1, false); // last state is accepted
        const tr = this.new_transition(last_s, gamma, q);
        last_s = q;
      }
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
      if (this.active_states.has(from) && trigger === tr) {
        next_states.add(to);
      }
    }

    this.active_states = next_states;
  }

  match_rule([from, popped, to, pushed]: Transition): MA_Transition[] {
    this.start(); // reset active states
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

    for (const s of this.states) {
      const loc = this.state_to_loc.get(s);
      graph.nodes.push({
        id: s,
        label: (loc ? render_proxy_location(loc) : render_automaton_state(s)) + (this.initial_states.has(s) ? "*" : ""),
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