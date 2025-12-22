import { to_cnf as new_to_cnf } from './fast-cnf';
import { to_cnf } from './fast-cnf-2';

export type NoTermLogicExpr = Literal | NotExpr | AndExpr | OrExpr | ImplExpr | BiCondExpr;
export type LogicExpr = NoTermLogicExpr | Term;

// term just wraps an expression without modification
export interface Term {
	kind: 'TERM';
	symbol: LogicExpr;
}

export interface Literal {
	kind: 'LITERAL';
	value: number;
}

export interface NotExpr {
	kind: 'NOT';
	symbol: LogicExpr;
}

export interface AndExpr {
	kind: 'AND';
	symbols: LogicExpr[];
}

export interface OrExpr {
	kind: 'OR';
	symbols: LogicExpr[];
}

export interface ImplExpr {
	kind: 'IMPL';
	left: LogicExpr;
	right: LogicExpr;
}

export interface BiCondExpr {
	kind: 'BICOND';
	left: LogicExpr;
	right: LogicExpr;
}

export class LogicContext {
	lookup: string[] = ['*'];

	constructor() {}

	// declare or recreate new symbol
	lit(name: string, negate: boolean = false): Literal {
		const id = this.lookup.indexOf(name);
		if (id > 0) return { kind: 'LITERAL', value: negate ? -id : id };
		this.lookup.push(name);
		const new_id = this.lookup.length - 1;
		return { kind: 'LITERAL', value: negate ? -new_id : new_id };
	}

	not(name: string): Literal {
		return this.lit(name, true);
	}

	resolve_name(signed_id: number) {
		return (signed_id < 0 ? '¬' : '') + this.lookup[Math.abs(signed_id)];
	}

	format(expr: LogicExpr | CNF, sep = ', '): string {
		switch (expr.kind) {
			case 'TERM':
				return `${this.format(expr.symbol)}`;
			case 'LITERAL':
				return `${this.resolve_name(expr.value)}`;
			case 'NOT':
				return `¬ ${this.format(expr.symbol)}`;
			case 'AND':
				if (expr.symbols.length === 1) return this.format(expr.symbols[0]);
				return `(${expr.symbols.map((s) => this.format(s)).join(' ∧ ')})`;
			case 'OR':
				if (expr.symbols.length === 1) return this.format(expr.symbols[0]);
				return `(${expr.symbols.map((s) => this.format(s)).join(' ∨ ')})`;
			case 'IMPL':
				return `(${this.format(expr.left)} ⇒ ${this.format(expr.right)})`;
			case 'BICOND':
				return `(${this.format(expr.left)} ⇔ ${this.format(expr.right)})`;
			case 'CNF':
				return `${expr.clauses.map((s) => '(' + [...s].map((v) => this.resolve_name(v)).join('∨') + ')').join(sep)}`;
		}
	}

	format_each_expr(expr: Set<LogicExpr> | Array<LogicExpr>, sep = ', ') {
		return [...expr].map((s) => this.format(s)).join(sep);
	}
}

export function resolution(KB: LogicExpr, alpha: LogicExpr) {
	const cnf = to_cnf(and(KB, not(alpha)));
	return CNF_resolution(cnf);
}

export function CNF_resolution(cnf: CNF): { result: boolean; cnf: CNF } {
	const clauses = [...cnf.clauses];
	let new_clauses: Set<number>[] = [];

	while (true) {
		let found_new_clause = false;
		for (let i = 0; i < clauses.length; i++) {
			for (let j = i + 1; j < clauses.length; j++) {
				const Ci = clauses[i];
				const Cj = clauses[j];

				const resolvents = single_resolve(Ci, Cj);

				for (const res of resolvents) {
					// the resolvent has not been here before
					if (!clause_is_in_list(clauses, res)) {
						found_new_clause = true;
						new_clauses.push(res);
					}

					// we resolved to empty set
					if (res.size === 0) {
						clauses.push(res);
						return { result: true, cnf: { kind: 'CNF', clauses } };
					}
				}
			}
		}

		if (new_clauses.length === 0) {
			// we have found no more new clauses
			return { result: false, cnf: { kind: 'CNF', clauses } };
		}

		clauses.push(...new_clauses);
		new_clauses = [];
	}
}

export function convert_to_CNF(expr: LogicExpr): CNF {
	const cnf = to_cnf(expr);
	return cnf;
}

export function convert_CNF_to_AND(cnf: CNF): AndExpr {
	const expr: AndExpr = {
		kind: 'AND',
		symbols: []
	};

	for (const c of cnf.clauses) {
		const or_expr: OrExpr = { kind: 'OR', symbols: [] };
		for (const v of c.values()) {
			or_expr.symbols.push({ kind: 'LITERAL', value: v });
		}
		expr.symbols.push(or_expr);
	}

	return expr;
}

//
export function lit(value: number): Literal {
	return { kind: 'LITERAL', value };
}

export function inv_lit(l: Literal): Literal {
	return lit(-l.value);
}

export function not(expr: LogicExpr): NotExpr {
	return { kind: 'NOT', symbol: expr };
}

export function and(...exprs: LogicExpr[]): AndExpr {
	// if (exprs.length === 0) throw Error('has no operands');
	return { kind: 'AND', symbols: exprs };
}

export function or(...exprs: LogicExpr[]): OrExpr {
	// if (exprs.length === 0) throw Error('has no operands');
	return { kind: 'OR', symbols: exprs };
}

export function impl(left: LogicExpr, right: LogicExpr): ImplExpr {
	return { kind: 'IMPL', left, right };
}

export function bicond(left: LogicExpr, right: LogicExpr): BiCondExpr {
	return { kind: 'BICOND', left, right };
}

export function term(expr: LogicExpr): Term {
	return { kind: 'TERM', symbol: expr };
}

// CNF
export interface CNF {
	kind: 'CNF';
	clauses: Set<number>[];
}

export function clause(...lits: number[]) {
	return new Set<number>(lits);
}

function get_sym_id(sym: Literal) {
	return Math.abs(sym.value);
}

function are_complements(sym_1: LogicExpr, sym_2: LogicExpr) {
	return sym_1.kind === 'LITERAL' && sym_2.kind === 'LITERAL' && sym_1.value === -sym_2.value;
}

function are_equal(at_a: Literal, at_b: Literal) {
	return at_a.value === at_b.value;
}

function single_resolve(Ci: Set<number>, Cj: Set<number>) {
	const all_resolvents: Set<number>[] = [];

	for (let Si of Ci) {
		if (Cj.has(-Si)) {
			const resolvent = Ci.difference(new Set([Si])).union(Cj.difference(new Set([-Si])));
			if (!is_tautology(resolvent)) {
				all_resolvents.push(resolvent);
			}
		}
	}

	return all_resolvents;
}

export function is_tautology(clause: Set<number>) {
	for (let Si of clause) {
		for (let Sj of clause) {
			if (Si === -Sj) return true;
		}
	}
	return false;
}

export function equal_clause(cl1: Set<number>, cl2: Set<number>) {
	if (cl1.size !== cl2.size) return false;
	for (const s of cl1) {
		if (!cl2.has(s)) return false;
	}
	return true;
}

export function clause_is_in_list(list: Set<number>[], clause: Set<number>) {
	for (const cl of list) {
		if (equal_clause(cl, clause)) return true;
	}
	return false;
}
