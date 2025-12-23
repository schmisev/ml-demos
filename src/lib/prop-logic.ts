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

  get_lit(name: string, negate: boolean = false): Literal {
    const id = this.lookup.indexOf(name);
		if (id > 0) return { kind: 'LITERAL', value: negate ? -id : id };
    throw `Literal ${name} does not exist!`;
  }

  get_not(name: string): Literal {
    return this.get_lit(name, true);
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
				return `¬${this.format(expr.symbol)}`;
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

  at_most_one_of(variables: string[]): LogicExpr[] {
    let clauses: LogicExpr[] = [];
    for (const v of variables) {
      let implied: Literal[] = [];
      for (const w of variables) {
        if (v === w) continue;
        implied.push(this.lit(w, true));
      }
      if (implied.length == 0) continue;
      clauses.push(impl(this.lit(v), and(...implied)));
    }
    return clauses;
  }

  one_of(variables: string[]): LogicExpr[] {
    let clauses: LogicExpr[] = this.at_most_one_of(variables);
    clauses.push(or(...variables.map(v => this.lit(v))));
    return clauses;
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