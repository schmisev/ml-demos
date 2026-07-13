import type { HuiGraphDefinition, HuiNodeDefinition } from "$lib/hui-graphs/hui-core";
import { MiniKind, type MiniProgram, type MiniSequence, type MiniStmt } from "./minilang-parser";
import type { RegularConfiguration } from "./pds.svelte";

export type CFG_Node = CFG_Call | CFG_Return | CFG_Structure;

export interface CFG_Meta {
  loc: string;
  in_function: string;
  scope: number;
  to: [string, CFG_Node][];
  label: string;
  config?: RegularConfiguration;
}

export interface CFG_Call extends CFG_Meta {
  type: MiniKind.Call;
  ident: string;
}

export interface CFG_Return extends CFG_Meta {
  type: MiniKind.Return;
}

export interface CFG_Structure extends CFG_Meta {
  type: Exclude<MiniKind, MiniKind.Call | MiniKind.Return>;
}

export interface CFG_Port {
  node: CFG_Node;
  out_label: string;
}

export interface LooseEnds {
  runover: CFG_Port[];
  returns: CFG_Port[];
  continues: CFG_Port[];
  breaks: CFG_Port[];
}

export function format_stmt(stmt: MiniStmt) {
  switch(stmt.kind) {
    case MiniKind.Sequence: return "...";
    case MiniKind.IfElse: return "if(?)";
    case MiniKind.While: return stmt.truthiness ? "while(!)" : "while(?)"
    case MiniKind.Call: return stmt.ident + "()";
    case MiniKind.FuncDef: return stmt.ident + "() {...}";
    case MiniKind.Program: return "program";
    default:
      return stmt.kind;
  }
}

export function unique<T>(arr: T[]) {
    return arr.filter((v, i, a) => a.indexOf(v) == i);
}

function node_from_stmt(in_function: string, node: MiniStmt, scope: number): CFG_Node {
  switch (node.kind) {
    case MiniKind.Call:
      return {
        in_function,
        label: format_stmt(node),
        type: node.kind,
        loc: node.loc,
        scope,
        to: [],
        ident: node.ident,
        config: node.config
      }
    default:
      return {
        in_function,
        label: format_stmt(node),
        type: node.kind,
        loc: node.loc,
        scope,
        to: [],
        config: node.config
      }
  }  
}

function port_from_node(node: CFG_Node, out_label: string): CFG_Port {
  return { node, out_label };
}

function connect_forward(first: CFG_Port, follow: CFG_Node, out_label: string): CFG_Port {
  first.node.to.push([first.out_label, follow]);
  return { node: follow, out_label };
}

function connect_all(from: CFG_Port[], to: CFG_Node, out_label: string) {
  for (const port of from) {
    connect_forward(port, to, out_label);
  }
}

function start_ends(node: CFG_Node, out_label: string): LooseEnds {
  return {
    runover: [port_from_node(node, out_label)],
    breaks: [],
    continues: [],
    returns: []
  }
}

function tie_ends_seq(first: LooseEnds, follow: LooseEnds): LooseEnds {
  return {
    returns: unique([...first.returns, ...follow.returns]),
    breaks: unique([...first.breaks, ...follow.breaks]),
    continues: unique([...first.continues, ...follow.continues]),
    runover: unique([...follow.runover])
  }
}

function tie_ends_par(first: LooseEnds, follow: LooseEnds): LooseEnds {
  return {
    returns: unique([...first.returns, ...follow.returns]),
    breaks: unique([...first.breaks, ...follow.breaks]),
    continues: unique([...first.continues, ...follow.continues]),
    runover: unique([...first.runover, ...follow.runover])
  }
}

function tie_node_to_ends(ends: LooseEnds, node: CFG_Node, out_label: string): LooseEnds {
  connect_all(ends.runover, node, out_label);
  const follow = port_from_node(node, out_label);
  switch (node.type) {
    case MiniKind.Break:
      return {...ends, breaks: ends.breaks.concat(follow), runover: []};
    case MiniKind.Continue:
      return {...ends, continues: ends.continues.concat(follow), runover: []};
    case MiniKind.Return:
      return {...ends, returns: ends.returns.concat(follow), runover: []};
    default:
      return { ...ends, runover: [follow] }
  }
}

export function partition<T>(arr: T[], condition: (v: T) => boolean): [T[], T[]] {
    const trueArr: T[] = [];
    const falseArr: T[] = [];
    for (const v of arr) {
        if (condition(v)) {
            trueArr.push(v);
        } else {
            falseArr.push(v);
        }
    }
    return [trueArr, falseArr];
}

function tie_up_loop(ends: LooseEnds, loop_ctrl: CFG_Node): LooseEnds {
  const [continue_tie, continue_through] = partition(ends.continues, (v) => v.node.scope >= loop_ctrl.scope);
  connect_all(unique([...ends.runover, ...continue_tie]), loop_ctrl, "continue");
  return {
    returns: ends.returns,
    continues: continue_through,
    runover: ends.breaks,
    breaks: []
  }
}

export function generate_cfg(def: MiniProgram): Record<string, CFG_Node> {

  function traverse(in_function: string, stmt: MiniStmt, ends: LooseEnds): LooseEnds {
    switch (stmt.kind) {
      case MiniKind.Sequence: {
        for (const s of stmt.stmts) {
          ends = traverse(in_function, s, ends);
        }
        return ends;
      }
      case MiniKind.IfElse: {
        const ctrl =  node_from_stmt(in_function, stmt, scope);
        const ends_ctrl = tie_node_to_ends(ends, ctrl, "if true");
        const ends_if_true = traverse(in_function, stmt.if, ends_ctrl);
        if (stmt.else) {
          ends_ctrl.runover[0].out_label = "else";
          const ends_else = traverse(in_function, stmt.else, ends_ctrl);
          return tie_ends_par(ends_if_true, ends_else);
        } else {
          const else_port = port_from_node(ctrl, "else");
          ends_if_true.runover.push(else_port);
          return ends_if_true;
        }
      }
      case MiniKind.While: {
        scope++;
        const ctrl = node_from_stmt(in_function, stmt, scope);
        ends = tie_node_to_ends(ends, ctrl, "while true");
        ends = traverse(in_function, stmt.stmt, ends);
        if (!stmt.truthiness) {
          ends.breaks = [...ends.breaks, port_from_node(ctrl, "else")];
        }
        scope--;
        return tie_up_loop(ends, ctrl);
      }
      case MiniKind.Call: {
        const node = node_from_stmt(in_function, stmt, scope);
        return tie_node_to_ends(ends, node, "call <b>" + stmt.ident + "</b>");
      }
      case MiniKind.Crash: {
        const node = node_from_stmt(in_function, stmt, scope);
        ends = tie_node_to_ends(ends, node, stmt.kind);
        return tie_up_loop(ends, node);
      }
      case MiniKind.Work:
      case MiniKind.Error:
      case MiniKind.Return:
      case MiniKind.Break:
      case MiniKind.Continue: {
        const node = node_from_stmt(in_function, stmt, scope);
        return tie_node_to_ends(ends, node, stmt.kind);
      }
      case MiniKind.FuncDef:
      case MiniKind.Program:
        throw `Unexpected statement: ${stmt}`;
      
    }
  }

  let scope = 0;
  const cfg: Record<string, CFG_Node> = {};

  for (const func of def.func_defs) {
    const start_node = node_from_stmt(func.ident, func, 0);
    const beginn_ends = start_ends(start_node, "start");
    const final_ends = traverse(func.ident, func.seq, beginn_ends);
    tie_node_to_ends(final_ends, {in_function: func.ident, loc: "R", to: [], scope: 0, type: MiniKind.Return, label: "return"}, "return");
    cfg[func.ident] = start_node;
  }
  return cfg;

}

export function id_cfg(node: CFG_Node) {
  if (!node.in_function) console.log(node);
  return `${node.in_function}[${node.loc}]`;
}

export function format_cfg(node: CFG_Node) {
  return `<b>${node.loc}</b> : <code>${node.label}</code>`;
}

export async function graph_cfg(def: Record<string, CFG_Node>): Promise<HuiGraphDefinition> {
  const graph: HuiGraphDefinition = {
    edges: [],
    nodes: []
  }

  const visited: Set<string> = new Set();

  function traverse(node: CFG_Node) {
    const ident_str = id_cfg(node);

    if (visited.has(ident_str)) return;
    visited.add(ident_str);

    let new_node: HuiNodeDefinition;
    
    switch (node.type) {
      case MiniKind.Return:
        new_node = {
          id: ident_str,
          label: "",
          labelClasses: ["p-2", "border-2", "rounded-xl", "bg-black"]
        }
        break;
      default:
        new_node = {
          id: ident_str,
          label: format_cfg(node),
          labelClasses: ["p-2", "border-2", "rounded-xl"]
        }
        break;
    }

    graph.nodes.push(new_node);
    
    for (const [label, p] of node.to) {
      graph.edges.push({
        fromId: ident_str,
        toId: id_cfg(p),
        label,
      })
      traverse(p);
    }
  }

  for (const [name, d] of Object.entries(def)) {
    traverse(d);
  }

  return graph;
}
