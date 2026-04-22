import type { HuiEdgeDefinition, HuiGraphDefinition } from "$lib/hui-graphs/hui-core";
import { assign_map, assign_set, init_map } from "$lib/utils";
import { SvelteMap } from "svelte/reactivity";

type Empty = undefined;
type State = string;
type StackSymbol = string | Empty;
type InputSymbol = string;
type NextState = [State, StackSymbol[]];

const EMPTY: Empty = undefined;

export class NPDA {
  status: "ACCEPTED" | "REJECTED" | "UNDECIDED" = $state("UNDECIDED");
  initial_state: Set<State> = new Set();
  initial_stack_symbol: StackSymbol;
  all_states: Set<State> = new Set();
  accepting_states: Set<State> = new Set();

  state: SvelteMap<State, StackSymbol[][]> = new SvelteMap();
  
  def: Map<State, Map<InputSymbol, Map<StackSymbol, NextState[]>>> = new Map();

  /**
   * Class implementing a non-deterministic PDA
   * Note: an empty transition should not modify the underlying stack,
   * otherwise the stack might instantly infinitely expand
   * @param Z initial stack symbols
   * @param delta transition relation
   */
  constructor(
    q_0: State[],
    Z: StackSymbol, 
    delta: [State, InputSymbol, StackSymbol, State, StackSymbol[]][],
    F: State[],
  ) {
    // initialization
    assign_set(this.accepting_states, F);
    assign_set(this.initial_state, q_0);
    this.initial_stack_symbol = Z;
    
    // transition
    for (const [from, input, top_of_stack, to, replace_in_stack] of delta) {
      // adding states to all states
      this.all_states.add(from);
      this.all_states.add(to);

      // setup transitions
      const transitions = this.def.get(from);
      if (transitions) {
        const symbols = transitions.get(input);
        if (symbols) {
          const targets = symbols.get(top_of_stack);
          if (targets) {
            targets.push([to, replace_in_stack]);
          } else {
            symbols.set(top_of_stack, [[to, replace_in_stack]]);
          }
        } else {
          transitions.set(input, init_map(top_of_stack, [[to, replace_in_stack]]));
        }
      } else {
        this.def.set(from, init_map(input, init_map(top_of_stack, [[to, replace_in_stack]])));
      }
    }

    // reset the first time
    this.reset();
    this.consumeAnySymbol("");
  }

  reset() {
    // reset stacks
    assign_map(this.state, [...this.initial_state.values()], [[[this.initial_stack_symbol]]]);
  }

  consumeAnySymbol(input: InputSymbol) {
    const is_empty_transition = (input === "");
    let added_new_state = false;
    const new_state: Map<State, StackSymbol[][]> = new Map();

    for (const [in_state, on_stacks] of this.state.entries()) {
      const symbols = this.def.get(in_state);
      if (!symbols) continue; // definition not available
      const targets = symbols.get(input);
      if (!targets) continue; // no transition for given input

      for (const stack_option of on_stacks) {
        const top_of_stack = stack_option.at(-1) || EMPTY;
        const next_states = targets.get(top_of_stack);
        if (!next_states) continue; // no transition for given stack symbol (on top of stack)
        
        const partial_stack = [...stack_option]; // remove top of stack
        partial_stack.pop();
        for (const [s, repl] of next_states) {
          const new_stacks = new_state.get(s);
          if (new_stacks) new_stacks.push([...partial_stack, ...repl]);
          else new_state.set(s, [[...partial_stack, ...repl]]);
        
          if (!added_new_state && !this.state.has(s)) added_new_state = true;
        }
      }
    }

    if (!is_empty_transition) this.state.clear(); // in old state on an empty transition
    for (const [s, stack] of new_state.entries()) {
      this.state.set(s, stack);
    }

    if (added_new_state || !is_empty_transition) this.consumeAnySymbol("");
  }

  comsumeSymbol(input: InputSymbol) {
    this.consumeAnySymbol(input);
    this.updateStatus();
  }

  updateStatus() {
    if (this.state.size === 0) {
      this.status = "REJECTED";
      return;
    }

    for (const [s, _] of this.state) {
      if (this.accepting_states.has(s)) {
        this.status = "ACCEPTED";
        return;
      }
    }

    this.status = "UNDECIDED";
    return;
  }

  graph(): HuiGraphDefinition {
    const graph: HuiGraphDefinition = {
      edges: [],
      nodes: []
    }

    for (const state of this.all_states) {
      graph.nodes.push({
        id: state,
        label: state,
        labelClasses: ["hui", "node", this.accepting_states.has(state) ? "double-ellipse" : "ellipse", this.state.has(state) ? "positive" : "normal"]
      })
    }

    const edge_map = new Map<string, HuiEdgeDefinition>();

    for (const [from, transitions] of this.def.entries()) {
      for (const [input, new_state] of transitions.entries()) {
        for (const [symbol, next_states] of new_state.entries()) {
          for (const [to, repl] of next_states) {
            const edge_id = from + "-" + to;

            let edge = edge_map.get(edge_id);
            const label = `<code><b>${input || "ε"}</b></code>; ${symbol}⟋${repl.join("") || "ε"}`;
            if (!edge) {
              edge = {
                fromId: from,
                toId: to,
                label,
              };
              edge_map.set(edge_id, edge);
              graph.edges.push(edge);
            } else {
              edge.label += "<br>" + label;
            }


            graph.edges.push(edge);
          }
        }
      }
    }

    return graph;
  }
}