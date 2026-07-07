import { id_cfg, type CFG_Node } from "./minilang-cfg";
import { MiniKind, type MiniStmt } from "./minilang-parser";
import { EMPTY_DEF } from "./pds-parser";
import type { PDS_Def, StackSequence, StackSymbol } from "./pds.svelte";

const RETURN_STATE = "R";

export function cfg_to_pds(cfg: Record<string, CFG_Node>): PDS_Def {
	const def: PDS_Def = EMPTY_DEF();
	// [string, StackSymbol, string, StackSequence]

	function new_rule(from: string, popped: StackSymbol, to: string, pushed: StackSequence) {
		def.rules.push([from, popped, to, pushed]);
	}

  const visited: Set<string> = new Set();
  const returns: Set<string> = new Set();
	const call_locs = new Map<string, string[]>();
  let entry: CFG_Node | undefined = undefined;

	for (const name in cfg) {
		const func_node = cfg[name];
		if (!call_locs.has(name)) {
			call_locs.set(name, []);
		}
		call_locs.get(name)!.push(func_node.loc);
    if (name === "main") entry = func_node;

    traverse(func_node);
	}

	function traverse(stmt: CFG_Node) {
    const stmt_id = id_cfg(stmt);
    if (visited.has(stmt_id)) return;
    visited.add(stmt_id);

    for (const [label, next] of stmt.to) {
      const suffix = next.type === MiniKind.Return ? [] : [next]; // "next" position
      const prefix = stmt.type === MiniKind.Call && stmt.ident in cfg ? [cfg[stmt.ident]] : []; // prepend call
      
      if (stmt.type === MiniKind.Call && next.type !== MiniKind.Return && !returns.has(next.loc)) {
        returns.add(stmt.loc);
        new_rule(RETURN_STATE, next.loc, id_cfg(next), [next.loc]);
      }

      const pushed = [...prefix, ...suffix];
      const goto = pushed[0] ? id_cfg(pushed[0]) : RETURN_STATE;
      new_rule(id_cfg(stmt), stmt.loc, goto, pushed.map(p => p.loc));
      traverse(next);
    }
	}

  if (entry) def.initial_configs.push({loc: id_cfg(entry), w: [entry.loc]});
  else {
    for (const func of Object.values(cfg)) {
      def.initial_configs.push({loc: id_cfg(func), w: [func.loc]})
    }
  }

	return def;
}