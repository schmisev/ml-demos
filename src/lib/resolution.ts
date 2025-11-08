export type LogicExpr = AtomicProp | NotExpr | AndExpr | OrExpr | ImplExpr | BiCondExpr | Clause | CNF;

export interface Term {
	kind: 'TERM';
	symbol: LogicExpr;
}

export interface AtomicProp {
	kind: 'ATOMIC';
	name: string;
	value: boolean; // false --> ¬name
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


// CNF
export interface Clause {
  kind: "CLAUSE";
  symbols: Set<AtomicProp>;
}

export interface CNF {
  kind: "CNF",
  symbols: Set<Clause>;
}

function format_each_expr(expr: Set<LogicExpr> | Array<LogicExpr>) {
	return [...expr].map((s) => format_expr(s)).join(', ');
}

function format_expr(expr: LogicExpr | Term): string {
	switch (expr.kind) {
		case 'TERM':
			return format_expr(expr.symbol);
		case 'ATOMIC':
			return `${expr.value ? '' : '¬'}${expr.name}`;
		case 'NOT':
			return `¬ ${format_expr(expr.symbol)}`;
		case 'AND':
			return `(${expr.symbols.map((s) => format_expr(s)).join(' ∧ ')})`;
		case 'OR':
			return `(${expr.symbols.map((s) => format_expr(s)).join(' ∨ ')})`;
		case 'IMPL':
			return `(${format_expr(expr.left)} ⇒ ${format_expr(expr.right)})`;
		case 'BICOND':
			return `(${format_expr(expr.left)} ⇔ ${format_expr(expr.right)})`;
    case "CLAUSE":
      return `(${[...expr.symbols].map((s) => format_expr(s)).join(' ∨ ')})`;
    case "CNF":
      return `(${[...expr.symbols].map((s) => format_expr(s)).join(' ∧ ')})`;
	}
}

function expand_expr(expr: LogicExpr): { changed: boolean; expr: LogicExpr } {
	switch (expr.kind) {
		case 'ATOMIC':
			// can't be simplified
			return { changed: false, expr };
		case 'NOT': {
			const S = expr.symbol;
			switch (S.kind) {
				case 'ATOMIC':
					// replace with single atomic
					return { changed: true, expr: { kind: 'ATOMIC', name: S.name, value: !S.value } };
				case 'NOT':
					// directly return doubly NOTed symbol
					return { changed: true, expr: S.symbol };
        case "CLAUSE":
        case "CNF":
				case 'AND':
				case 'OR':
					const new_symbols: LogicExpr[] = [];
					for (const child_expr of S.symbols) {
						new_symbols.push({ kind: 'NOT', symbol: child_expr });
					}
					return {
						changed: true,
						expr: {
							kind: S.kind === 'AND' ? 'OR' : 'AND',
							symbols: new_symbols
						}
					};
				case 'IMPL':
				case 'BICOND':
					return { changed: false, expr }; // do nothing
        
			}
		}
    case 'CLAUSE':
    case "CNF":
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
	}
}

function expand_again(changed: boolean, expr: LogicExpr | Term, depth: number) {
	if (changed) {
		console.log('__'.repeat(depth), format_expr(expr));
		expand_dependend_exprs(expr, depth + 1);
	}
}

function expand_dependend_exprs(expr: LogicExpr | Term, depth: number) {
	switch (expr.kind) {
		case 'ATOMIC':
			// cannot be simplified
			break;
		case 'AND':
		case 'OR':
			for (let i = 0; i < expr.symbols.length; i++) {
				expand_dependend_exprs(expr.symbols[i], depth + 1);
				const ret = expand_expr(expr.symbols[i]);
				expr.symbols[i] = ret.expr;
				expand_again(ret.changed, expr, depth);
			}
			break;
		case 'IMPL':
		case 'BICOND':
			expand_dependend_exprs(expr.left, depth + 1);
			expand_dependend_exprs(expr.right, depth + 1);

			const ret_left = expand_expr(expr.left);
			const ret_right = expand_expr(expr.right);

			expand_again(ret_left.changed || ret_right.changed, expr, depth);
			break;
		case 'NOT':
		case 'TERM':
			expand_dependend_exprs(expr.symbol, depth + 1);
			const ret = expand_expr(expr.symbol);
			expr.symbol = ret.expr;
			expand_again(ret.changed, expr, depth);
			break;
	}
}

function is_clause(expr: LogicExpr): expr is Clause {
	if (expr.kind !== 'OR') return false;
	for (const child_expr of expr.symbols) {
		if (child_expr.kind !== 'ATOMIC') return false;
	}
	return true;
}

function convert_to_CNF(expr: LogicExpr): CNF {
	const new_symbols = new Set<Clause>;
	if (expr.kind !== 'AND') throw `Couldn't convert ${format_expr(expr)} to CNF!`;

	for (const symbol of expr.symbols) {
		if (symbol.kind === "ATOMIC") {
      new_symbols.add({kind: "CLAUSE", symbols: new Set([symbol])});
    } else if (is_clause(symbol)) {
      new_symbols.add({kind: "CLAUSE", symbols: new Set(symbol.symbols)});
    }
	}

	return {
		kind: 'CNF',
		symbols: new_symbols
	};
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
	return (
		sym_1.kind === 'ATOMIC' &&
		sym_2.kind === 'ATOMIC' &&
		sym_1.name === sym_2.name &&
		sym_1.value !== sym_2.value
	);
}

// testing
const B11: AtomicProp = {
	kind: 'ATOMIC',
	name: 'B11',
	value: true
};

const P12: AtomicProp = {
	kind: 'ATOMIC',
	name: 'P12',
	value: true
};

const P21: AtomicProp = {
	kind: 'ATOMIC',
	name: 'B21',
	value: true
};

const _B11: AtomicProp = {
	kind: 'ATOMIC',
	name: 'P11',
	value: false
};

const KB: BiCondExpr = {
	kind: 'BICOND',
	left: B11,
	right: {
		kind: 'OR',
		symbols: [P12, P21]
	}
};

function make_term(expr: LogicExpr): Term {
	return {
		kind: 'TERM',
		symbol: expr
	};
}

function concat_to_term(term: Term, ...rest: LogicExpr[]): Term {
	return {
		kind: 'TERM',
		symbol: {
			kind: 'AND',
			symbols: [term.symbol, ...rest]
		}
	};
}

const kb_expr: Term = {
	kind: 'TERM',
	symbol: KB
};

const test_expr = concat_to_term(kb_expr, P12, _B11);

console.log(format_expr(kb_expr));
expand_dependend_exprs(kb_expr, 0);
const cnf = convert_to_CNF(kb_expr.symbol);
console.log('CNF:', format_expr(kb_expr));
let r = cnf;