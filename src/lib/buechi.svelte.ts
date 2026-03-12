import { randint } from "$lib";
import { SvelteMap, SvelteSet } from "svelte/reactivity";
import type { HuiGraphDefinition } from "./hui-graphs/hui-core";

export enum BuechiState {
  UNDECIDED = "UNDECIDED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
};

export type BuechiActions = SvelteMap<string, SvelteSet<string>>;

export class BuechiAutomaton {
  def: SvelteMap<string, BuechiActions>;
  rules: [string, string, string][];
  current_state: SvelteSet<string>;
  current_word: string;
  init_state: string;
  accept_states: SvelteSet<string>;

  state: BuechiState = $state(BuechiState.UNDECIDED);

  constructor(
    init_state: string,
    accept_states: string[],
    ...rules: [string, string, string][]
  ) {
    this.rules = rules;
    this.current_word = $state("");
    this.current_state = new SvelteSet([init_state]);
    this.init_state = $state(init_state);
    this.accept_states = new SvelteSet(accept_states);

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

    if (!this.def.has(init_state)) this.def.set(init_state, new SvelteMap());
  }

  eat_char(char: string): boolean {
    let at_least_one_actions = false;
    const check_states = [...this.current_state.values()];
    this.current_state.clear();

    for (const state of check_states) {
      const at_node = this.def.get(state);
      console.log(at_node);
      if (at_node === undefined || !at_node.has(char)) {
        continue;
      }
      const to_nodes = at_node.get(char);
      console.log(to_nodes);
      if (!to_nodes) {
        continue;
      }
      for (const to_node of to_nodes){
        console.log(to_node);
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
    const collected_chars = new Set<string>();
    for (const state of this.current_state) {
      const at_node = this.def.get(state);
      if (at_node === undefined) return "";
      for (const k of at_node!.keys())
        collected_chars.add(k);
    }

    const i = randint(0, collected_chars.size);
    const char = [...collected_chars][i];
    if (this.eat_char(char)) return char;
    return "";
  }

  reset() {
    this.current_state.clear();
    this.current_state.add(this.init_state);
    this.state = BuechiState.UNDECIDED;
    this.current_word = "";
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
        label: "S<sub>" + node + "</sub>",
        labelClasses: ["hui", "node", "rounded"]
      });

      for (const [trigger, to_nodes] of action.entries()) {
        for (const to_node of to_nodes) {
          graph.edges.push({
            id: "" + edge_id++,
            fromId: node,
            toId: to_node,
            label: trigger
          })
        }
      }
    }

    

    return graph;
  }
}