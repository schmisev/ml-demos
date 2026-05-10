import type { HuiGraphDefinition } from "$lib/hui-graphs/hui-core";

export type Grammar = GrammarRule[];
export type GrammarNode = GrammarNonTerminal | GrammarTerminal;
export type GrammarWord = GrammarNode[];

export interface GrammarRule {
  kind: "rule";
  from: GrammarNonTerminal;
  to: GrammarWord;
}

export interface GrammarNonTerminal {
  kind: "non-terminal";
  ident: string;
}

export interface GrammarTerminal {
  kind: "terminal";
  ident: string;
}

export function N(ident: string): GrammarNonTerminal {
  return {ident, kind: "non-terminal"};
}

export function T(ident: string): GrammarTerminal {
  return {ident, kind: "terminal"};
}

export function word(...nodes: GrammarNode[]): GrammarWord {
  return nodes;
}

export function rule(
  from: GrammarNonTerminal, to: GrammarWord
): GrammarRule {
  return {kind: "rule", from, to};
}

export function R(from: string, ...to: string[][]): GrammarRule[] {
  return to.map(t => { return {
    kind: "rule",
    from: N(from),
    to: W(...t)
  }});
}

export function W(...nodes: string[]): GrammarWord {
  return nodes.map(n => (n === "" || n[0].toLowerCase() === n[0]) 
  ? T(n) : N(n))
}

export const EXAMPLE_GRAMMAR = [
  ...R("S", ["a", "B", "B"], ["b", "D"]),
  ...R("A", ["B", "c"]),
  ...R("B", ["S", "d"], ["C"]),
  ...R("C", ["a"]),
  ...R("D", ["B", "D"]),
]

export function graph_grammar(grammar: Grammar, 
  {no_terminals}: {no_terminals: boolean}): HuiGraphDefinition {
  const graph: HuiGraphDefinition = {
    edges: [],
    nodes: [],
  }

  const found_nodes: Map<string, number> = new Map();
  const found_edges: Set<string> = new Set();
  let running = 0; 

  function add_node(ident: string, prefix: string, add: number): [string, boolean] {
    const nt = `${prefix}(${ident})`;
    if (!found_nodes.has(ident)) {
      found_nodes.set(ident, 0);
      return [nt, true];
    } else {
      found_nodes.set(ident, found_nodes.get(ident)! + add);
      return [nt, false];
    }
  }

  function add_edge(from: string, to: string, color: string) {
    const id = "(" + from + ")->(" + to + ")";
    if (found_edges.has(id)) return;
    found_edges.add(id);
    graph.edges.push({fromId: from, toId: to, arrowStroke: color});
  }

  for (const [i, {from, to}] of grammar.entries()) {
    const [nt, add_nt] = add_node(from.ident, "N", 1);
    if (add_nt) graph.nodes.push({
      id: nt,
      label: from.ident,
      labelClasses: ["hui", "node", "ellipse", "special-3"]
    })

    const [r, add_r] = add_node(from.ident + found_nodes.get(from.ident)!, "R", 0);
    graph.nodes.push({
      id: r,
      label: `${from.ident} | ${found_nodes.get(from.ident)!}`,
      labelClasses: ["hui", "node", "rect", "positive"]
    })
    add_edge(r, nt, "green");

    for (const t of to) {
      switch (t.kind) {
        case "non-terminal":
          const [nt2, add_nt2] = add_node(t.ident, "N", 0);
          if (add_nt2) graph.nodes.push({
            id: nt2,
            label: t.ident,
            labelClasses: ["hui", "node", "ellipse", "special-3"]
          })
          add_edge(nt2, r, "orange");
          break;
        case "terminal":
          if (no_terminals) break;
          let [x, add_x] = add_node(t.ident, "T", 0);
          if (add_x) graph.nodes.push({
            id: x,
            label: `"${t.ident}"`,
            labelClasses: ["hui", "node", "rect", "special"]
          })
          add_edge(x, r, "lightblue");
          break;
      }
    }
  }

  return graph;
}


export function dep_graph_grammar(grammar: Grammar): HuiGraphDefinition {
  const graph: HuiGraphDefinition = {
    edges: [],
    nodes: [],
  }

  const found_nodes: Map<string, number> = new Map();
  const found_edges: Set<string> = new Set();
  let running = 0; 

  function add_node(ident: string, prefix: string, add: number): [string, boolean] {
    const nt = `${prefix}(${ident})`;
    if (!found_nodes.has(ident)) {
      found_nodes.set(ident, 0);
      return [nt, true];
    } else {
      found_nodes.set(ident, found_nodes.get(ident)! + add);
      return [nt, false];
    }
  }

  function add_edge(from: string, to: string, color: string) {
    const id = "(" + from + ")->(" + to + ")";
    if (found_edges.has(id)) return;
    found_edges.add(id);
    graph.edges.push({fromId: from, toId: to, arrowStroke: color});
  }

  for (const [i, {from, to}] of grammar.entries()) {
    const [nt, add_nt] = add_node(from.ident, "N", 1);
    if (add_nt) graph.nodes.push({
      id: nt,
      label: from.ident,
      labelClasses: ["hui", "node", "ellipse", "special-3"]
    })

    for (const t of to) {
      switch (t.kind) {
        case "non-terminal":
          const [nt2, add_nt2] = add_node(t.ident, "N", 0);
          if (add_nt2) graph.nodes.push({
            id: nt2,
            label: t.ident,
            labelClasses: ["hui", "node", "ellipse", "special-3"]
          })
          add_edge(nt2, nt, "red");
          break;
        case "terminal":
          break; // no terminals
      }
    }
  }

  return graph;
}