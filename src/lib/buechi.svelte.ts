import { randint } from "$lib";
import { SvelteMap, SvelteSet } from "svelte/reactivity";
import type { HuiGraphDefinition } from "./hui-graphs/hui-core";
import { ALPHABET } from "./regex/regex";
import { char_alias } from "./regex/character-alias";
import { ANY_CHAR, check_class_match } from "./regex/character-classes";
import { append_to_set, break_into_lines } from "./utils";

export enum BuechiState {
  UNDECIDED = "UNDECIDED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
};

export type BuechiActions = Map<string, Set<string>>;

export class BuechiAutomaton {
  def: Map<string, BuechiActions>;
  rules: [string, string, string][];
  current_state: SvelteSet<string>;
  current_word: string;
  init_states: Set<string>;
  accept_states: Set<string>;

  state: BuechiState = $state(BuechiState.UNDECIDED);

  constructor(
    init_state: string[] | Set<string>,
    accept_states: string[] | Set<string>,
    rules: [string, string, string][]
  ) {
    this.rules = rules;
    this.current_word = $state("");
    this.current_state = new SvelteSet(init_state);
    this.init_states = new Set(init_state);
    this.accept_states = new Set(accept_states);

    this.def = new SvelteMap();

    for (const [node, trigger, to_node] of rules) {

      if (!this.def.has(node)) this.def.set(node, new SvelteMap());
      const current_node = this.def.get(node)!;

      if (!current_node.has(trigger)) current_node.set(trigger, new SvelteSet([to_node]));
      else current_node.get(trigger)!.add(to_node);
      if (!this.def.has(to_node)) this.def.set(to_node, new SvelteMap());
    }

    for (const state of accept_states) {
      if (!this.def.has(state)) this.def.set(state, new SvelteMap());
    }

    for (const ini of init_state)
      if (!this.def.has(ini)) this.def.set(ini, new SvelteMap());

    this.reset();
  }

  eat_char(char: string): boolean {
    let at_least_one_actions = false;
    const check_states = [...this.current_state.values()];
    this.current_state.clear();

    for (const state of check_states) {
      const at_node = this.def.get(state);
      if (at_node === undefined) {
        continue;
      }

      let to_nodes = check_class_match(at_node, char);
      if (to_nodes.size === 0) continue;

      for (const to_node of to_nodes){
        this.current_state.add(to_node);}
      at_least_one_actions = true;
    }

    if (!at_least_one_actions) {
      this.state = BuechiState.REJECTED;
      return false;
    }

    this.current_word += char;

    if (this.current_state.intersection(this.accept_states).size > 0) {
      this. state = BuechiState.ACCEPTED;
      return true;
    }
    
    this.state = BuechiState.UNDECIDED;
    return true;
  }

  gen_char(): string {
    let collected_chars = new Set<string>();
    for (const state of this.current_state) {
      const at_node = this.def.get(state);
      if (at_node === undefined) return "";
      for (const k of at_node!.keys()) {
        if (k === ANY_CHAR) {
          // TODO: make this more general
          collected_chars = collected_chars.union(ALPHABET);
        } else collected_chars.add(k);
      }  
    }

    const i = randint(0, collected_chars.size);
    const char = [...collected_chars][i];
    if (this.eat_char(char)) return char;
    return "";
  }

  reset() {
    this.current_state.clear();
    for (const ini of this.init_states)
      this.current_state.add(ini);
    this.state = BuechiState.UNDECIDED;
    this.current_word = "";

    if (this.accepted()) {
      this.state = BuechiState.ACCEPTED;
    }
  }

  accepted() {
    for (const state of this.current_state) {
      if (this.accept_states.has(state)) return true;
    }
    return false;
  }

  graph(): HuiGraphDefinition {
    const graph: HuiGraphDefinition = {
      edges: [],
      nodes: []
    }

    let edge_id = 0;

    for (const [node, action] of this.def.entries()) {
      graph.nodes.push({
        id: node,
        label: `<code>` + break_into_lines(node, 8, "<br>", `<span style="opacity: 40%">↲</span>`, `<span style="opacity: 40%">…</span>`) + "</code> ",
        labelClasses: ["hui", "node", this.accept_states.has(node) ? "double" : "rounded", this.current_state.has(node) ? "positive" : "neutral"]
      });

      for (const [trigger, to_nodes] of action.entries()) {
        const isClass = trigger[0] === "\\";

        for (const to_node of to_nodes) {
          graph.edges.push({
            id: "" + edge_id++,
            fromId: node,
            toId: to_node,
            label: char_alias(trigger),
            labelClasses: isClass ? ["rounded", "bg-blue-200", "pl-1", "pr-1", "font-bold"] : [],
            cornerRadius: 4,
          })
        }
      }
    }

    return graph;
  }

  to_DFA(): BuechiAutomaton {
    let accept_states: Set<string> = new Set();
    let rules: [string, string, string][] = [];
    let init_states = [format_state_union(this.init_states)];
    let collected_states: Set<string> = new Set(init_states);
    let to_be_expanded: Set<string>[] = [];

    to_be_expanded.push(new Set(this.init_states));

    while (to_be_expanded.length > 0) {
      const all_states = to_be_expanded.shift()!;
      const action_map: Map<string, Set<string>> = new Map();

      // check if accpeted state
      const from_str = format_state_union(all_states);

      let is_accepted = false;
      for (const sub_state of all_states) {
        if (!is_accepted && this.accept_states.has(sub_state)) accept_states.add(from_str);

        const actions = this.def.get(sub_state);
        if (!actions) continue;
        
        for (const [input, action] of actions) {
          const local_action = action_map.get(input);
          if (local_action) append_to_set(local_action, action);
          else action_map.set(input, new Set(action));
        }
      }

      for (const [input, next_state] of action_map.entries()) {
        const state_str = format_state_union(next_state);
        rules.push([format_state_union(all_states), input, state_str]);
        
        if (collected_states.has(state_str)) continue; // already collected
        collected_states.add(state_str);
        to_be_expanded.push(next_state);
      }
    }

    return new BuechiAutomaton(
      init_states,
      [...accept_states.values()],
      rules
    )
  }

  collapse_equal_nodes(): BuechiAutomaton {
    const {reduced_def, rename_map} = reduce_definition(this.def, this.accept_states);
    const init_state = rename_set(this.init_states, rename_map);
    const accept_states = rename_set(this.accept_states, rename_map);

    return new BuechiAutomaton(
      init_state,
      accept_states,
      list_transitions(reduced_def),
    )
  }
}

function format_state_union(states: string[] | Set<string>): string {
  const sorted_states = [...(new Set(states)).values()].toSorted();
  return `{${sorted_states.join(",")}}`;
}

function format_action(input: string, next_state: Set<string>, is_accepted: boolean) {
  return `${is_accepted ? "A" : ""}(${input}:${format_state_union(next_state)})`;
}

function format_action_map(action_map: BuechiActions, is_accepted: boolean) {
  const inputs = [...action_map.keys()].toSorted();
  return `${inputs.map((i) => format_action(i, action_map.get(i)!, is_accepted)).join(";")}`;
}

function reduce_definition(def: Map<string, BuechiActions>, accept_states: Set<string>): {
  reduced_def: Map<string, BuechiActions>, 
  rename_map: Map<string, string>
} {
  let reduced_def: Map<string, BuechiActions> = new Map();
  const equality_map: Map<string, string> = new Map();
  const rename_map: Map<string, string> = new Map();

  let changed = true;
  while (changed) {
    reduced_def = new Map();
    equality_map.clear();

    changed = false;
    for (const [from_state, action_map] of def.entries()) {
      const sig = format_action_map(action_map, accept_states.has(from_state));
      const equal_state = equality_map.get(sig);
      if (equal_state) {
        // this state needs to be renamed
        rename_map.set(from_state, equal_state);
        changed = true;
      } else {
        // this state will continue to exist
        equality_map.set(sig, from_state);
      }
    }

    for (const [_, insert_state] of equality_map.entries()) {
      const action_map = def.get(insert_state)!; // iserts states MUST exist in def
      const renamed_actions: BuechiActions = new Map();
      for (const [i, s] of action_map) {
        const renamed_set = rename_set(s, rename_map);
        renamed_actions.set(i, renamed_set);
      }
      reduced_def.set(insert_state, renamed_actions);
    }

    def = reduced_def;
  }

  return {
    reduced_def,
    rename_map
  }
}

function rename_set<A>(s: Set<A>, rename_map: Map<A, A>) {
  const new_set: Set<A> = new Set();

  for (const v of s) {
    const r = rename_map.get(v);
    if (r) new_set.add(r);
    else new_set.add(v);
  }

  return new_set;
}

function list_transitions(actions_map: Map<string, BuechiActions>): [string, string, string][] {
  const list: [string, string, string][] = [];

  for (const [from, action] of actions_map) {
    for (const [input, all_to] of action) {
      for (const to of all_to) {
        list.push([from, input, to]);
      }
    }
  }

  return list;
}