import { equal_sets } from "$lib";
import { impl, not, or, type CNF, type Literal, type LogicExpr, type NoTermLogicExpr } from "./resolution";

enum NF_Kind {
  CNF = 1,
  DNF = -1,
}

type Clause = Set<number>;

interface NormalForm {
  kind: NF_Kind;
  clauses: Clause[];
}

function clause(...lits: Literal[]): Clause {
  return new Set(lits.map(l => l.value));
}

function nf(kind: NF_Kind, clauses: Clause[]): NormalForm {
  return { kind, clauses };
}

function invert_clause(clause: Clause): Clause {
  return new Set(clause.values().map(v => -v));
}

function not_invert_nf(nf: NormalForm): NormalForm {
  return { kind: -nf.kind, clauses: nf.clauses.map(c => invert_clause(c)) };
}

function convert(kind: NF_Kind, expr: LogicExpr): NormalForm {
  while (expr.kind === "TERM") expr = expr.symbol;
  expr satisfies NoTermLogicExpr;

  switch (expr.kind) {
    case "LITERAL":
      return nf(kind, [clause(expr)]);
    case "NOT":
      return not_invert_nf(convert(-kind, expr.symbol));
    case "AND":
      return ands_conv(kind, expr.symbols.map((e) => convert(kind, e)));
    case "BICOND":
      let first = convert(kind, impl(expr.left, expr.right));
      let second = convert(kind, impl(expr.left, expr.right));
      return ands_conv(kind, [first, second]);
    case "IMPL":
      expr = or(expr.right, not(expr.left));
    case "OR":
      return ors_conv(kind, expr.symbols.map((e) => convert(kind, e)));
  }
}

function ands_conv(kind: NF_Kind, nfs: NormalForm[]): NormalForm {
  switch (kind) {
    case NF_Kind.CNF: return merge(kind, nfs);
    case NF_Kind.DNF: return distribute(kind, nfs);
  }
}

function ors_conv(kind: NF_Kind, nfs: NormalForm[]): NormalForm {
  switch (kind) {
    case NF_Kind.CNF: return distribute(kind, nfs);
    case NF_Kind.DNF: return merge(kind, nfs);
  }
}

function has_clause(clauses: Clause[], cl: Clause): boolean {
  return clauses.findIndex((c) => equal_sets(c, cl)) >= 0
}

function merge_one(kind: NF_Kind, a: NormalForm, b: NormalForm): NormalForm {
  const accepted_clauses: Set<number>[] = [...a.clauses];
  for (const cl of b.clauses) {
    if (has_clause(accepted_clauses, cl)) continue;
    accepted_clauses.push(cl);
  }

  return {kind, clauses: accepted_clauses};
}

function merge(kind: NF_Kind, nfs: NormalForm[]): NormalForm {
  return nfs.reduce((nf, f) => merge_one(kind, nf, f), nf_id(kind));
}

function distribute_one(kind: NF_Kind, a: NormalForm, b: NormalForm): NormalForm {
  let accepted_clauses: Set<number>[] = [];

  for (const ca of a.clauses) {
    for (const cb of b.clauses) {
      const one_clause = simplify_vars(...ca, ...cb);
      if (one_clause === "drop") continue;
      if (has_clause(accepted_clauses, one_clause)) continue;
      accepted_clauses.push(one_clause);
    }
  }

  return { kind, clauses: accepted_clauses }
}

function distribute(kind: NF_Kind, nfs: NormalForm[]) {
	let [nf, ...tail] = nfs;
	for (const other of tail) {
		nf = distribute_one(kind, nf, other);
	}
	return nf;
}

function simplify_vars(...symbols: number[]): Set<number> | "drop" {
  let outs: Set<number> = new Set();

  for (const v of symbols) {
    if (outs.has(-v)) return "drop";
    outs.add(v);
  }

  return outs;
}

function nf_id(kind: NF_Kind) {
  return nf(kind, []);
}

export function to_cnf(expr: LogicExpr): CNF {
  const nf = convert(NF_Kind.CNF, expr);
  if (nf.kind !== NF_Kind.CNF) throw `Produced DNF when converting to CNF... somehow.`;
  return { kind: "CNF", clauses: nf.clauses };
}