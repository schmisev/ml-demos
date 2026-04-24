import { BuechiAutomaton } from "$lib/buechi.svelte";
import { ANY_CHAR, ANY_WORD, CLASS_MATCHERS } from "./character-classes";
import { format_regex, regex_simplify, type RegexNode } from "./regex";


export function brzo_gradient(node: RegexNode, dX: Set<string>): Map<string, RegexNode> {
  const grad: Map<string, RegexNode> = new Map();
  for (const dx of dX) {
    const deriv = brzo_derivative(node, dx);
    if (!deriv) continue;
    grad.set(dx, deriv);
  }
  return grad;
}

export function brzo_derivative(node: RegexNode, dx: string): RegexNode | undefined {
  switch (node.kind) {
    case "STAR": {
      const deriv = brzo_derivative(node.value, dx);
      if (!deriv) return undefined;
      if (deriv.kind === "EMPTY") return { ...node, kind: "STAR" };
      return { kind: "CONCAT", left: deriv, right: node };
    }
    case "PLUS": {
      const deriv = brzo_derivative(node.value, dx);
      if (!deriv) return undefined;
      if (deriv.kind === "EMPTY") return { ...node, kind: "STAR" };
      return { kind: "CONCAT", left: deriv, right: { ...node, kind: "STAR" } }
    }
    case "CHOICE":
      const derivs: RegexNode[] = [];
      let already_has_empty = false;
      for (const n of node.nodes) {
        const deriv = brzo_derivative(n, dx);
        if (deriv) {
          if (deriv.kind === "EMPTY") {
            // TODO: probably not necessary???
            if (already_has_empty) continue;
            already_has_empty = true;
          }
          derivs.push(deriv);
        }
      }
      if (derivs.length === 0) return undefined;
      if (derivs.length === 1) return derivs[0]; // unwrap if only one option
      return { kind: "CHOICE", nodes: derivs}
    case "CONCAT":
      const left_deriv = brzo_derivative(node.left, dx);
      const v = brzo_v(node.left);
      const right_deriv = brzo_derivative(node.right, dx);
      if (left_deriv) {
        if (v && right_deriv) {
          if (left_deriv.kind === "EMPTY") return node.right;
          return {
            kind: "CHOICE", nodes: [
              {kind: "CONCAT", left: left_deriv, right: node.right}, 
              right_deriv
            ]
          };
        }
        if (left_deriv.kind === "EMPTY") return node.right;
        return {kind: "CONCAT", left: left_deriv, right: node.right};
      } else {
        if (v && right_deriv) return right_deriv;
        return undefined;
      }
    case "EMPTY":
      return undefined;
    case "CHAR":
      if (
        node.trigger === dx
        // || (CLASS_MATCHERS[node.trigger] || ((char: string) => false))(dx)
      ) return { kind: "EMPTY" };
      else return undefined;
  }
}

function brzo_v(node: RegexNode): boolean {
  switch (node.kind) {
    case "STAR":
      return true;
    case "PLUS":
      return brzo_v(node.value);
    case "CHOICE":
      for (const n of node.nodes) {
        if (brzo_v(n)) return true;
      }
      return false;
    case "CONCAT":
      return brzo_v(node.left) && brzo_v(node.right);
    case "EMPTY":
      return true;
    case "CHAR":
      return false;
  }
}

export function make_brzo_automaton(regex: RegexNode, triggers: Set<string>): BuechiAutomaton {
  regex = regex_simplify(regex, {zip: false});

  const initial_state = format_regex(regex);
  const accept_states = new Set<string>();
  const to_be_expanded = [regex];
  const rules: [string, string, string][] = [];
  const collected_states: Set<string> = new Set();

  while(to_be_expanded.length > 0) {
    const current = to_be_expanded.shift()!;
    const from_state = format_regex(current);
    if (brzo_v(current)) accept_states.add(from_state);
    const grad = brzo_gradient(current, triggers);
    collected_states.add(from_state);

    for (const [input, next] of grad) {
      const to_state = format_regex(next);
      rules.push([from_state, input, to_state]);
      if (!collected_states.has(to_state)) {
        to_be_expanded.push(next);
        collected_states.add(to_state);
      }
    }
  }

  return new BuechiAutomaton(
    [initial_state],
    accept_states,
    rules
  );
}