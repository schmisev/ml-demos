import { id_cfg, type CFG_Node } from "./minilang-cfg";
import { MiniKind, type MiniStmt } from "./minilang-parser";
import { EMPTY_DEF } from "./pds-parser";
import type { PDS_Def, StackSequence, StackSymbol } from "./pds.svelte";

export function cfg_to_pds(cfg: Record<string, CFG_Node>): PDS_Def {
	const def: PDS_Def = EMPTY_DEF();
	// [string, StackSymbol, string, StackSequence]

	function new_rule(from: string, popped: StackSymbol, to: string, pushed: StackSequence) {
		def.rules.push([from, popped, to, pushed]);
	}

  const visited: Set<string> = new Set();
  const returns: Set<string> = new Set();
  let func_name = "";
	const call_locs = new Map<string, string[]>();
	for (const name in cfg) {
    func_name = name;
		const d = cfg[name];
		if (!call_locs.has(name)) {
			call_locs.set(name, []);
		}
		call_locs.get(name)!.push(d.loc);

    traverse(d);
	}

	// Rule: Function name --> stack symbol
	// Rule: Stmt id --> Control loc

	function traverse(stmt: CFG_Node) {
    const stmt_id = id_cfg(func_name, stmt);
    if (visited.has(stmt_id)) return;
    visited.add(stmt_id);

    for (const [label, next] of stmt.to) {
      const suffix = next.type === MiniKind.Return ? [] : [next.loc]; // "next" position
      const prefix = stmt.type === MiniKind.Call ? stmt.ident in cfg ? [cfg[stmt.ident].loc] : [] : []; // prepend call
      if (next.type !== MiniKind.Return && !returns.has(stmt.loc)) {
        returns.add(stmt.loc);
        new_rule("R", stmt.loc, stmt.loc, [stmt.loc]);
      }

      const pushed = [...prefix, ...suffix];
      const goto = pushed[0] || "R";
      new_rule(stmt.loc, stmt.loc, goto, pushed);
      traverse(next);
    }
	}

	return def;
}
