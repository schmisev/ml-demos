import { dpll_resolution } from './dpll.svelte';
import { to_cnf } from './fast-cnf-2';
import { type LogicExpr, and, not, type CNF } from './prop-logic';

export function resolution(KB: LogicExpr, alpha: LogicExpr, mode: "DPLL" | "resolution") {
  const cnf = to_cnf(and(KB, not(alpha)));

  switch (mode) {
    case 'DPLL':
      return dpll_resolution(cnf);
    case 'resolution':
      return CNF_resolution(cnf);
  }
}

export function CNF_resolution(cnf: CNF): { result: boolean; cnf: CNF; } {
  let current_clauses = [...cnf.clauses];
  let old_clauses: Set<number>[] = [...current_clauses]; // we have to compare all clauses to each other at the start
  let new_clauses: Set<number>[] = [];

  for (let t = 0; t < 3; t++) {
    old_clauses.sort((a, b) => a.size - b.size);
    current_clauses.sort((a, b) => a.size - b.size);

    let found_new_clause = false;
    for (let i = 0; i < old_clauses.length; i++) {
      for (let j = 0; j < current_clauses.length; j++) {
        const Ci = old_clauses[i];
        const Cj = current_clauses[j];

        const resolvents = single_resolve(Ci, Cj);

        for (const res of resolvents) {
          // we resolved to empty set
          if (res.size === 0) {
            current_clauses.push(res);
            return { result: true, cnf: { kind: 'CNF', clauses: current_clauses } };
          }

          // the resolvent has not been here before
          if (!clause_is_in_list(old_clauses, res) && !clause_is_in_list(current_clauses, res)) {
            found_new_clause = true;
            new_clauses.push(res);
          }
        }
      }
    }

    if (new_clauses.length === 0) {
      // we have found no more new clauses
      return { result: false, cnf: { kind: 'CNF', clauses: current_clauses } };
    }

    console.log("t:", t, "old:", old_clauses.length, "current:", current_clauses.length, "new:", new_clauses.length);

    // buffer swap
    old_clauses = current_clauses;
    current_clauses = new_clauses;
    new_clauses = [];
  }

  return { result: false, cnf: { kind: 'CNF', clauses: current_clauses } };
}

function single_resolve(Ci: Set<number>, Cj: Set<number>) {
	const all_resolvents: Set<number>[] = [];

	for (let Si of Ci) {
		if (Cj.has(-Si)) {
			const resolvent = Ci.difference(new Set([Si])).union(Cj.difference(new Set([-Si])));
			if (!is_tautology(resolvent)) {
				all_resolvents.push(resolvent);
			}
      return all_resolvents; // if we COULD resolve multiple times, we would also automatically generate tautologies
		}
	}

	return all_resolvents;
}

function is_tautology(clause: Set<number>) {
	for (let Si of clause) {
		if (clause.has(-Si)) return true;
	}
	return false;
}

function equal_clause(cl1: Set<number>, cl2: Set<number>) {
	return cl1.size !== cl2.size && cl1.isSubsetOf(cl2);
}

function clause_is_in_list(list: Set<number>[], clause: Set<number>) {
	for (const cl of list) {
		if (equal_clause(cl, clause)) return true;
	}
	return false;
}
