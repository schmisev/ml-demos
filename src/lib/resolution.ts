export type LogicExpr = AtomicProp | NotExpr | AndExpr | OrExpr | ImplExpr | BiCondExpr;

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

function format_expr(expr: LogicExpr): string {
	switch (expr.kind) {
		case 'ATOMIC':
			return `${expr.value ? '' : '¬'}${expr.name}`;
		case 'NOT':
			return `NOT ${format_expr(expr.symbol)}`;
		case 'AND':
			return `(${expr.symbols.map((s) => format_expr(s)).join(' ∧ ')})`;
		case 'OR':
			return `(${expr.symbols.map((s) => format_expr(s)).join(' ∨ ')})`;
		case 'IMPL':
			return `(${format_expr(expr.left)} ⇒ ${format_expr(expr.right)})`;
		case 'BICOND':
			return `(${format_expr(expr.left)} ⇔ ${format_expr(expr.right)})`;
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

function expand_dependend_exprs(expr: LogicExpr | Term) {
	switch (expr.kind) {
		case 'ATOMIC':
			// cannot be simplified
			break;
		case 'AND':
		case 'OR':
			for (let i = 0; i < expr.symbols.length; i++) {
				expand_dependend_exprs(expr.symbols[i]);
				const ret = expand_expr(expr.symbols[i]);
        expr.symbols[i] = ret.expr;
        if (ret.changed) expand_dependend_exprs(expr);
			}
			break;
		case 'IMPL':
		case 'BICOND':
			expand_dependend_exprs(expr.left);
			expand_dependend_exprs(expr.right);
      
      const ret_left = expand_expr(expr.left);
      const ret_right = expand_expr(expr.right);
			
      if (ret_left.changed || ret_right.changed) expand_dependend_exprs(expr);
			break;
		case 'NOT':
		case 'TERM':
			expand_dependend_exprs(expr.symbol);
			const ret = expand_expr(expr.symbol);
      expr.symbol = ret.expr;
      if (ret.changed) expand_dependend_exprs(expr);
			break;
	}
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

const test_expr: Term = {
	kind: 'TERM',
	symbol: {
		kind: 'BICOND',
		left: B11,
		right: {
			kind: 'OR',
			symbols: [P12, P21]
		}
	}
};

console.log(format_expr(test_expr.symbol));
expand_dependend_exprs(test_expr);
console.log(format_expr(test_expr.symbol));
