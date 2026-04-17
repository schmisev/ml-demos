import { randint } from "$lib";
import { SvelteMap, SvelteSet } from "svelte/reactivity";
import type { HuiGraphDefinition } from "./hui-graphs/hui-core";
import { ALPHABET, ANY_CHAR } from "./regex/regex";
import { char_alias } from "./regex/character-alias";

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
  init_state: string[];
  accept_states: Set<string>;

  state: BuechiState = $state(BuechiState.UNDECIDED);

  constructor(
    init_state: string[],
    accept_states: string[],
    ...rules: [string, string, string][]
  ) {
    this.rules = rules;
    this.current_word = $state("");
    this.current_state = new SvelteSet(init_state);
    this.init_state = $state(init_state);
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
      let via_char = at_node.get(char);
      let via_any = at_node.get(ANY_CHAR);
      
      let to_nodes = new Set<string>();
      
      if (!via_char && !via_any) {
        continue;
      }

      if (via_any) to_nodes = to_nodes.union(via_any);
      if (via_char) to_nodes = to_nodes.union(via_char);

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
    for (const ini of this.init_state)
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
        label: "S<sub>" + node + "</sub> " + (this.accept_states.has(node) ? "✓" : ""),
        labelClasses: ["hui", "node", "rounded"]
      });

      for (const [trigger, to_nodes] of action.entries()) {
        for (const to_node of to_nodes) {
          graph.edges.push({
            id: "" + edge_id++,
            fromId: node,
            toId: to_node,
            label: char_alias(trigger)
          })
        }
      }
    }

    return graph;
  }
}