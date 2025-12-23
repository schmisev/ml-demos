import type { DPLL } from "./dpll.svelte";
import type { LogicContext } from "./prop-logic";

type MermaidDirection = "TD" | "LR" | "RL";
type MermaidGraphType = "flowchart";

export class MermaidConstructor {
  type: MermaidGraphType;
  direction: MermaidDirection;
  nodes: string[] = [];
  conns: string[] = [];
  styles: string[] = [];
  #id = 0;

  constructor(
    type: MermaidGraphType,
    direction: MermaidDirection,
  ) {
    this.type = type;
    this.direction = direction;
  }

  format(): string {
    return [
      `${this.type} ${this.direction}`,
      ...this.nodes,
      ...this.conns,
      ...this.styles,
    ].join("\n");
  }

  node(content: string, bound: [string, string]) {
    const id = this.#id++;
    const [lb, rb] = bound;

    this.nodes.push(`n${id}${lb}"${content}"${rb}`)
    return id;
  }

  conn(a: number, b: number, label?: string) {
    this.conns.push(`n${a} -->${label ? "|" + label + "|" : ""} n${b}`);
  }


}