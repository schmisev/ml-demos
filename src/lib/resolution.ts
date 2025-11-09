export type LogicExpr = Literal | NotExpr | AndExpr | OrExpr | ImplExpr | BiCondExpr | Term;

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

	convert_to_CNF(expr: LogicExpr): CNF {
		if (expr.kind === 'TERM') return this.convert_to_CNF(expr.symbol);

		const new_clauses: Set<number>[] = [];
		if (expr.kind !== 'AND') throw `Couldn't convert ${this.format_expr(expr)} to CNF!`;

		for (const symbol of expr.symbols) {
			let add_clause: Set<number>;
			switch (symbol.kind) {
				case 'LITERAL':
					add_clause = new Set([symbol.value]);
					break;
				case 'OR':
					add_clause = new Set(
						symbol.symbols.map((v) => {
							if (v.kind !== 'LITERAL') throw `Disallowed!`;
							return v.value;
						})
					);
					break;
				case 'NOT':
				case 'AND':
				case 'IMPL':
				case 'BICOND':
        case "TERM":
					throw `${symbol.kind} disallowed when creating CNF!`;
			}

      if (clause_is_in_list(new_clauses, add_clause)) continue;
			new_clauses.push(add_clause);
		}

		return {
			kind: 'CNF',
			clauses: new_clauses
		};
	}

	convert_to_AND(cnf: CNF): AndExpr {
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

	PL_resolution(KB: LogicExpr, alpha: LogicExpr): { result: boolean; cnf: CNF } {
		const cnf = this.convert_to_CNF(this.expand_dependend_exprs(term(and(KB, not(alpha)))));

		const clauses = [...cnf.clauses];
		let new_clauses: Set<number>[] = [];

		while (true) {
			let found_new_clause = false;
			for (let i = 0; i < clauses.length; i++) {
				for (let j = i + 1; j < clauses.length; j++) {
					const Ci = clauses[i];
					const Cj = clauses[j];

					const resolvents = PL_resolve(Ci, Cj);

					for (const res of resolvents) {
						// the resolvent has not been here before
						if (!clause_is_in_list(clauses, res)) {
							found_new_clause = true;
							new_clauses.push(res);
						}

						// we resolved to empty set
						if (res.size === 0) {
							clauses.push;
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

	format_expr(expr: LogicExpr | CNF): string {
		switch (expr.kind) {
			case 'TERM':
				return `${this.format_expr(expr.symbol)}`;
			case 'LITERAL':
				return `${this.resolve_name(expr.value)}`;
			case 'NOT':
				return `¬ ${this.format_expr(expr.symbol)}`;
			case 'AND':
        if (expr.symbols.length === 1) return this.format_expr(expr.symbols[0]);
				return `(${expr.symbols.map((s) => this.format_expr(s)).join(' ∧ ')})`;
			case 'OR':
        if (expr.symbols.length === 1) return this.format_expr(expr.symbols[0]);
				return `(${expr.symbols.map((s) => this.format_expr(s)).join(' ∨ ')})`;
			case 'IMPL':
				return `(${this.format_expr(expr.left)} ⇒ ${this.format_expr(expr.right)})`;
			case 'BICOND':
				return `(${this.format_expr(expr.left)} ⇔ ${this.format_expr(expr.right)})`;
			case 'CNF':
				return `[${expr.clauses.map((s) => '[' + [...s].map((v) => this.resolve_name(v)).join(' ∨ ') + ']').join(', ')}]`;
		}
	}

	format_each_expr(expr: Set<LogicExpr> | Array<LogicExpr>) {
		return [...expr].map((s) => this.format_expr(s)).join(', ');
	}

	expand_again(changed: boolean, expr: LogicExpr | Term, depth: number) {
		if (changed) {
			console.log('..'.repeat(depth) + this.format_expr(expr));
			this.expand_dependend_exprs(expr, depth + 1);
		}
	}

	expand_to_CNF(expr: LogicExpr): LogicExpr {
		return this.expand_dependend_exprs(term(copy_expr(expr)));
	}

	expand_to_AND(expr: LogicExpr): AndExpr {
		return this.convert_to_AND(this.convert_to_CNF(this.expand_to_CNF(expr)));
	}

	expand_dependend_exprs(expr: LogicExpr, depth: number = 0) {
		switch (expr.kind) {
			case 'LITERAL':
				// cannot be simplified
				break;
			case 'AND':
			case 'OR':
				for (let i = 0; i < expr.symbols.length; i++) {
					this.expand_dependend_exprs(expr.symbols[i], depth + 1);
					const ret = expand_expr(expr.symbols[i]);
					expr.symbols[i] = ret.expr;
					this.expand_again(ret.changed, expr, depth);
				}
				break;
			case 'IMPL':
			case 'BICOND':
				this.expand_dependend_exprs(expr.left, depth + 1);
				this.expand_dependend_exprs(expr.right, depth + 1);

				const ret_left = expand_expr(expr.left);
				const ret_right = expand_expr(expr.right);

				this.expand_again(ret_left.changed || ret_right.changed, expr, depth);
				break;
			case 'NOT':
			case 'TERM':
				this.expand_dependend_exprs(expr.symbol, depth + 1);
				const ret = expand_expr(expr.symbol);
				expr.symbol = ret.expr;
				this.expand_again(ret.changed, expr, depth);
				break;
		}

		return expr;
	}
}

export function not(expr: LogicExpr): NotExpr {
	return { kind: 'NOT', symbol: expr };
}

export function and(...exprs: LogicExpr[]): AndExpr {
	return { kind: 'AND', symbols: exprs };
}

export function or(...exprs: LogicExpr[]): OrExpr {
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

function get_sym_id(sym: Literal) {
	return Math.abs(sym.value);
}

function expand_expr(expr: LogicExpr): { changed: boolean; expr: LogicExpr } {
	switch (expr.kind) {
		case 'LITERAL':
			// can't be simplified
			return { changed: false, expr };
		case 'NOT': {
			const symbol = expr.symbol;
			switch (symbol.kind) {
				case 'LITERAL':
					// replace with single atomic
					return {
						changed: true,
						expr: { kind: 'LITERAL', value: -symbol.value }
					};
				case 'NOT':
					// directly return doubly NOTed symbol
					return { changed: true, expr: symbol.symbol };
				case 'AND':
				case 'OR':
					const new_symbols: LogicExpr[] = [];
					for (const child_expr of symbol.symbols) {
						new_symbols.push({ kind: 'NOT', symbol: child_expr });
					}
					return {
						changed: true,
						expr: {
							kind: symbol.kind === 'AND' ? 'OR' : 'AND',
							symbols: new_symbols
						}
					};
				case 'IMPL':
				case 'BICOND':
					return { changed: false, expr }; // do nothing
				case 'TERM':
					// unpack term
					expr.symbol = symbol.symbol;
					return { changed: true, expr };
			}
		}
		case 'AND':
		case 'OR': {
			// TODO: distributive property
			// combine with included ORs
			let changed = false;
			const new_symbols: LogicExpr[] = [];
			for (const child_expr of expr.symbols) {
				if (child_expr.kind === expr.kind) {
					changed = true;
					new_symbols.push(...child_expr.symbols);
				} else {
					new_symbols.push(child_expr);
				}
			}
			expr.symbols = new_symbols;

			if (!changed && expr.kind === 'OR') {
				const repl = distribute_OR_over_AND(expr);
				return { changed: false, expr: repl };
			}

			return { changed, expr };
		}
		case 'IMPL': {
			const L = expr.left;
			const R = expr.right;

			const repl: OrExpr = {
				kind: 'OR',
				symbols: [{ kind: 'NOT', symbol: L }, R]
			};

			return { changed: true, expr: repl };
		}
		case 'BICOND': {
			// expand
			const L = expr.left;
			const R = expr.right;

			const exp_L: ImplExpr = { kind: 'IMPL', left: L, right: R };
			const exp_R: ImplExpr = { kind: 'IMPL', left: R, right: L };

			const repl: AndExpr = {
				kind: 'AND',
				symbols: [exp_L, exp_R]
			};

			return { changed: true, expr: repl };
		}
		case 'TERM': {
			// unpack term
			return { changed: false, expr: expr.symbol };
		}
	}
}

function is_clause(expr: LogicExpr): boolean {
	if (expr.kind !== 'OR') return false;
	for (const child_expr of expr.symbols) {
		if (child_expr.kind !== 'LITERAL') return false;
	}
	return true;
}

function distribute_OR_over_AND(expr: OrExpr) {
	if (is_clause(expr)) return expr;

	let left = wrap_in_AND(expr.symbols[0]);
	for (let i = 1; i < expr.symbols.length; i++) {
		const raw = expr.symbols[i];
		const right = wrap_in_AND(raw);

		const new_conj: AndExpr = {
			kind: 'AND',
			symbols: []
		};

		for (const l_symbol of left.symbols) {
			for (const r_symbol of right.symbols) {
				new_conj.symbols.push({
					kind: 'OR',
					symbols: [l_symbol, r_symbol]
				});
			}
		}

		left = new_conj;
	}

	let ret: LogicExpr;
	if (left.symbols.length === 1) {
		ret = left.symbols[0];
	} else {
		ret = left;
	}
	return ret;
}

function wrap_in_AND(expr: LogicExpr): AndExpr {
	if (expr.kind === 'AND') return expr;
	return { kind: 'AND', symbols: [expr] };
}

function are_complements(sym_1: LogicExpr, sym_2: LogicExpr) {
	return sym_1.kind === 'LITERAL' && sym_2.kind === 'LITERAL' && sym_1.value === -sym_2.value;
}

function are_equal(at_a: Literal, at_b: Literal) {
	return at_a.value === at_b.value;
}

function PL_resolve(Ci: Set<number>, Cj: Set<number>) {
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

export function copy_expr<E extends LogicExpr>(expr: E): E {
	return JSON.parse(JSON.stringify(expr)) as E;
}
