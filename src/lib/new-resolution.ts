import {
	type AndExpr,
	type Literal,
	type LogicExpr,
	type OrExpr,
	type NoTermLogicExpr,
	not,
	impl,
	lit,
	or,
	inv_lit
} from './resolution';

interface DisjunctiveExpr extends OrExpr {
	symbols: Literal[];
}

interface ConjunctiveExpr extends AndExpr {
	symbols: Literal[];
}

interface CnfExpr extends AndExpr {
	symbols: DisjunctiveExpr[];
}

interface DnfExpr extends OrExpr {
	symbols: ConjunctiveExpr[];
}

function cnf(...symbols: DisjunctiveExpr[]): CnfExpr {
	return { kind: 'AND', symbols };
}

function disj(...symbols: Literal[]): DisjunctiveExpr {
	return { kind: 'OR', symbols };
}

function dnf(...symbols: ConjunctiveExpr[]): DnfExpr {
	return { kind: 'OR', symbols };
}

function conj(...symbols: Literal[]): ConjunctiveExpr {
	return { kind: 'AND', symbols };
}

function convert<Nf, INf>(expr: LogicExpr, operators: CombineOperators<Nf, INf>): Nf {
	const { literal: literal_conv, ands: ands_conv, ors: ors_conv } = operators;

	while (expr.kind === 'TERM') expr = expr.symbol;
	expr satisfies NoTermLogicExpr;
	switch (expr.kind) {
		case 'LITERAL':
			return literal_conv(expr);
		case 'AND':
			return ands_conv(expr.symbols.map((e) => convert(e, operators)));
		case 'BICOND':
			let one_direction = convert(impl(expr.left, expr.right), operators);
			let backstreet_boys = convert(impl(expr.right, expr.left), operators);
			return ands_conv([one_direction, backstreet_boys]);
		case 'IMPL':
			expr = or(expr.right, not(expr.left));
		case 'OR': {
			return ors_conv(expr.symbols.map((e) => convert(e, operators)));
		}
		case 'NOT':
			return operators.not_inverted(convert(expr.symbol, operators.inverted()));
	}
}
export function to_cnf(expr: LogicExpr): CnfExpr {
	return convert(expr, CNF_OPS);
}

interface CombineOperators<Nf, INf> {
	literal: (lit: Literal) => Nf;
	ands: (exprs: Nf[]) => Nf;
	ors: (exprs: Nf[]) => Nf;
	inverted: () => CombineOperators<INf, Nf>;
	not_inverted: (iform: INf) => Nf;
}

const CNF_OPS: CombineOperators<CnfExpr, DnfExpr> = {
	literal: (lit) => cnf(disj(lit)),
	ands: (exprs) => and_cnfs(...exprs),
	ors: (exprs) => distribute(DISTRIBUTE_CNF, ...exprs),
	inverted: () => DNF_OPS,
	not_inverted: (dnf) => not_dnf_to_cnf(dnf)
};

const DNF_OPS: CombineOperators<DnfExpr, CnfExpr> = {
	literal: (lit) => dnf(conj(lit)),
	ands: (exprs) => distribute(DISTRIBUTE_DNF, ...exprs),
	ors: (exprs) => or_dnfs(...exprs),
	inverted: () => CNF_OPS,
	not_inverted: (dnf) => not_cnf_to_dnf(dnf)
};


function and_cnf(a: CnfExpr, b: CnfExpr): CnfExpr {
	return cnf(...a.symbols, ...b.symbols);
}

function and_cnfs(...cnfs: CnfExpr[]): CnfExpr {
	return cnfs.reduce((cnf, c) => and_cnf(cnf, c), cnf_true());
}

function or_dnf(a: DnfExpr, b: DnfExpr): DnfExpr {
	return dnf(...a.symbols, ...b.symbols);
}

function or_dnfs(...dnfs: DnfExpr[]): DnfExpr {
	return dnfs.reduce((dnf, d) => or_dnf(dnf, d), dnf_false());
}

interface DistributeOps<Nf, Term> {
	empty: () => Nf;
	term: (vars: Literal[]) => Term;
	terms: (terms: Term[]) => Nf;
}

const DISTRIBUTE_CNF: DistributeOps<CnfExpr, DisjunctiveExpr> = {
	empty: () => cnf_false(),
	term: (vars) => disj(...vars),
	terms: (terms) => cnf(...terms)
};

const DISTRIBUTE_DNF: DistributeOps<DnfExpr, ConjunctiveExpr> = {
	empty: () => dnf_true(),
	term: (vars) => conj(...vars),
	terms: (terms) => dnf(...terms)
};

function distribute_one<Nf extends { symbols: Term[] }, Term extends { symbols: Literal[] }>(
	ops: DistributeOps<Nf, Term>,
	a: Nf,
	b: Nf
): Nf {
	const { term, terms } = ops;
	let all_terms: Term[] = [];
	let accepted_terms: Set<number>[] = [];

	for (const ca of a.symbols) {
		for (const cb of b.symbols) {
			const one_term = simplify_vars(...ca.symbols, ...cb.symbols);
			if (one_term === 'tautology') continue;
			const has_term =
				accepted_terms.findIndex(
					(term) => term.size == one_term.size && term.isSubsetOf(one_term)
				) !== -1;
			if (has_term) continue;
			accepted_terms.push(one_term);
			const one_literals = Array.from(one_term).map((v) => lit(v));
			all_terms.push(term(one_literals));
		}
	}
	return terms(all_terms);
}

function distribute<Nf extends { symbols: Term[] }, Term extends { symbols: Literal[] }>(
	ops: DistributeOps<Nf, Term>,
	...nfs: Nf[]
): Nf {
	if (nfs.length === 0) return ops.empty();
	let [nf, ...tail] = nfs;
	for (const other of tail) {
		nf = distribute_one(ops, nf, other);
	}
	return nf;
}

function simplify_vars(...variables: Literal[]): Set<number> | 'tautology' {
	let outs: Set<number> = new Set();
	for (const v of variables) {
		if (outs.has(-v.value)) return 'tautology';
		outs.add(v.value);
	}
	return outs;
}

const CNF_FALSE: CnfExpr = cnf(disj(lit(Infinity)), disj(lit(-Infinity)));
function cnf_false(): CnfExpr {
	return CNF_FALSE;
}

const CNF_TRUE: CnfExpr = cnf();
function cnf_true(): CnfExpr {
	return CNF_TRUE;
}

const DNF_FALSE: DnfExpr = dnf();
function dnf_false(): DnfExpr {
	return DNF_FALSE;
}

const DNF_TRUE: DnfExpr = dnf(conj(lit(Infinity)), conj(lit(-Infinity)));
function dnf_true(): DnfExpr {
	return DNF_TRUE;
}

function not_dnf_to_cnf(dnf: DnfExpr): CnfExpr {
	const { term, terms } = DISTRIBUTE_CNF;
	return terms(dnf.symbols.map((ls) => term(ls.symbols.map((l) => inv_lit(l)))));
}

function not_cnf_to_dnf(cnf: CnfExpr): DnfExpr {
	const { term, terms } = DISTRIBUTE_DNF;
	return terms(cnf.symbols.map((ls) => term(ls.symbols.map((l) => inv_lit(l)))));
}
