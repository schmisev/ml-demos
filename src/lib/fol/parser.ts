import { syntax_error, unexpected_token } from './error_handling';
import { tokenize, TokenType, type Token } from './lexer';
import { print_ast } from './printing';

// PARSING
export enum NodeType {
	SEQUENCE = 'Sequence',
	// quantifier
	FOR_ALL = 'ForAll',
	EXISTS = 'Exists',
	// logic expressions
	UNARY_LOGIC = 'UnaryLogic',
	BINARY_LOGIC = 'BinaryLogic',
	// predicates
	COMPARISON_PREDICATE = 'ComparisonPredicate',
	SIMPLE_PREDICATE = 'SimplePredicate',
	// literals
	NUMBER = 'Number',
	VARIABLE = 'Variable',
	// operations
	BINARY_OP = 'BinaryOp',
	UNARY_OP = 'UnaryOp',
	FUNCTION = 'Function'
}

export type FOL_Node = Sequence | Sentence | Term;

export interface Sequence {
	kind: NodeType.SEQUENCE;
	sentences: Sentence[];
}

export type Sentence =
	| ForAll
	| Exists
  | Function
	| UnaryPredicate
	| BinaryPredicate
	| SimplePredicate
	| Comparison;

export interface ForAll {
	kind: NodeType.FOR_ALL;
	variables: Variable[];
	sentence: Sentence;
}

export interface Exists {
	kind: NodeType.EXISTS;
	variables: Variable[];
	sentence: Sentence;
}

export interface UnaryPredicate {
	kind: NodeType.UNARY_LOGIC;
	op: Token;
	right: Sentence;
}

export interface BinaryPredicate {
	kind: NodeType.BINARY_LOGIC;
	op: Token;
	left: Sentence;
	right: Sentence;
}

export interface Comparison {
	kind: NodeType.COMPARISON_PREDICATE;
	op: Token;
	left: Term;
	right: Term;
}

export interface SimplePredicate {
	kind: NodeType.SIMPLE_PREDICATE;
	name: string;
}

export type Term = Variable | NumericLiteral | Function | BinaryOp | UnaryOp;

export interface Variable {
	kind: NodeType.VARIABLE;
	name: string;
}

export interface NumericLiteral {
	kind: NodeType.NUMBER;
	value: number;
}

export interface Function {
	kind: NodeType.FUNCTION;
	name: string;
	args: Term[];
}

export interface BinaryOp {
	kind: NodeType.BINARY_OP;
	op: Token;
	left: Term;
	right: Term;
}

export interface UnaryOp {
	kind: NodeType.UNARY_OP;
	op: Token;
	right: Term;
}

function parse(src: string): Sequence {
	console.log(src);
  const tokens = tokenize(src);
  console.log(tokens);

	function at(): Token {
		return tokens[0];
	}

	function eat(): Token {
		return tokens.shift()!;
	}

	function expect(kind: TokenType) {
		const tk = eat();
		if (tk.kind !== kind) unexpected_token(tk, kind);
		return tk;
	}

	function peek(): Token | undefined {
		return tokens.at(1);
	}

	// parsing nodes nodes
	function parse_sequence(): Sequence {
		const seq: Sequence = {
			kind: NodeType.SEQUENCE,
			sentences: []
		};

		while (at().kind !== TokenType.EOF) {
			seq.sentences.push(parse_sentence());
      if (at().kind === TokenType.EOF) break;
      expect(TokenType.STMT_SEPERATOR);
		}
		eat(); // eat EOF

		return seq;
	}

	function parse_variable(): Variable {
		const tk = expect(TokenType.IDENTIFIER);
		return {
			kind: NodeType.VARIABLE,
			name: tk.content
		};
	}

	function parse_exists(): Exists {
		expect(TokenType.EXISTS);
		const variables = [parse_variable()];

		while (at().kind === TokenType.EXPR_SEPERATOR) {
			eat(); // eat ,
			variables.push(parse_variable());
		}

		return {
			kind: NodeType.EXISTS,
			variables,
			sentence: parse_sentence()
		};
	}

	function parse_forall(): ForAll {
		expect(TokenType.FOR_ALL);
		const variables = [parse_variable()];

		while (at().kind === TokenType.EXPR_SEPERATOR) {
			eat(); // eat ,
			variables.push(parse_variable());
		}

		return {
			kind: NodeType.FOR_ALL,
			variables,
			sentence: parse_sentence()
		};
	}

	function parse_sentence(): Sentence {
		switch (at().kind) {
			case TokenType.EXISTS:
				return parse_exists();
			case TokenType.FOR_ALL:
				return parse_forall();
			default:
				return parse_unquantified_sentence();
		}
	}

	function parse_unquantified_sentence(): Sentence {
		return parse_bicond_like_predicate();
	}

	function parse_bicond_like_predicate(): Sentence {
		let left = parse_impl_like_predicate();

		while ([TokenType.BICOND].includes(at().kind)) {
			const op = eat();
			const right = parse_impl_like_predicate();

			left = {
				kind: NodeType.BINARY_LOGIC,
				left,
				right,
				op
			};
		}

		return left;
	}

	function parse_impl_like_predicate(): Sentence {
		let left = parse_or_like_predicate();

		while ([TokenType.IMPL].includes(at().kind)) {
			const op = eat();
			const right = parse_or_like_predicate();

			left = {
				kind: NodeType.BINARY_LOGIC,
				left,
				right,
				op
			};
		}

		return left;
	}

	function parse_or_like_predicate(): Sentence {
		let left = parse_and_like_predicate();

		while ([TokenType.OR].includes(at().kind)) {
			const op = eat();
			const right = parse_and_like_predicate();

			left = {
				kind: NodeType.BINARY_LOGIC,
				left,
				right,
				op
			};
		}

		return left;
	}

	function parse_and_like_predicate(): Sentence {
		let left = parse_unary_predicate();

		while ([TokenType.AND].includes(at().kind)) {
			const op = eat();
			const right = parse_unary_predicate();

			left = {
				kind: NodeType.BINARY_LOGIC,
				left,
				right,
				op
			};
		}

		return left;
	}

	function parse_unary_predicate(): Sentence {
		if ([TokenType.NOT].includes(at().kind)) {
			const op = eat();
			return {
				kind: NodeType.UNARY_LOGIC,
				op,
				right: parse_unary_predicate()
			};
		}

		return parse_simple_predicate();
	}

	function parse_simple_predicate(): Sentence {
		if (at().kind === TokenType.LEFT_PAREN) {
			eat();
			const sen = parse_sentence();
			expect(TokenType.RIGHT_PAREN);
			return sen;
		} else if (at().kind === TokenType.LEFT_BRACKET) {
			eat();
			const sen = parse_sentence();
			expect(TokenType.RIGHT_BRACKET);
			return sen;
		}
    
    const left = parse_term();
		if (
			[
				TokenType.EQUALS,
				TokenType.GREATER,
				TokenType.LESSER,
				TokenType.GREATER_EQUALS,
				TokenType.LESSER_EQUALS,
				TokenType.NOT_EQUALS
			].includes(at().kind)
		) {
			// this is a comparison
			// cannot be chained!
			const op = eat();
			const right = parse_term();

			return {
				kind: NodeType.COMPARISON_PREDICATE,
				op,
				left,
				right
			};
		}

    if (left.kind === NodeType.VARIABLE) {
      return {
        kind: NodeType.SIMPLE_PREDICATE,
        name: left.name
      };
    }

    if (left.kind === NodeType.FUNCTION) {
      return left;
    }

    throw syntax_error(`Illegal statement: ${JSON.stringify(left)}`)
	}

	function parse_term(): Term {
		return parse_additive_term();
	}

	function parse_additive_term(): Term {
		let left = parse_multiplicative_term();

		while ([TokenType.PLUS, TokenType.MINUS].includes(at().kind)) {
			const op = eat();
			const right = parse_unary_term();

			left = {
				kind: NodeType.BINARY_OP,
				op,
				left,
				right
			};
		}

		return left;
	}

	function parse_multiplicative_term(): Term {
		let left = parse_unary_term();

		while ([TokenType.MULTIPLY, TokenType.DIVIDE].includes(at().kind)) {
			const op = eat();
			const right = parse_unary_term();

			left = {
				kind: NodeType.BINARY_OP,
				op,
				left,
				right
			};
		}

		return left;
	}

	function parse_unary_term(): Term {
		if ([TokenType.MINUS, TokenType.PLUS].includes(at().kind)) {
			const op = eat();
			return {
				kind: NodeType.UNARY_OP,
				op,
				right: parse_unary_term()
			};
		}

		return parse_exponential_term();
	}

	function parse_exponential_term(): Term {
		let left = parse_function_term();
		while (at().kind == TokenType.POW) {
			const op = eat();
			const right = parse_exponential_term();

			left = {
				kind: NodeType.BINARY_OP,
				left,
				right,
				op
			};
		}

		return left;
	}

	function parse_function_term(): Term {
		const left = parse_primary_term();
		if (left.kind !== NodeType.VARIABLE) return left;

		const args: Term[] = [];
		if (at().kind === TokenType.LEFT_PAREN) {
			eat();
			while (at().kind != TokenType.RIGHT_PAREN) {
				args.push(parse_term());
				if (at().kind === TokenType.RIGHT_PAREN) break;
				expect(TokenType.EXPR_SEPERATOR);
			}
      eat();

			return {
				kind: NodeType.FUNCTION,
				args,
				name: left.name
			};
		}

		return left;
	}

	function parse_primary_term(): Term {
		switch (at().kind) {
			case TokenType.NUMBER: {
				const tk = eat();
				return {
					kind: NodeType.NUMBER,
					value: parseFloat(tk.content)
				};
			}
			case TokenType.IDENTIFIER: {
				const tk = eat();
				return {
					kind: NodeType.VARIABLE,
					name: tk.content
				};
			}
			case TokenType.LEFT_PAREN: {
				eat();
				const term = parse_term();
				expect(TokenType.RIGHT_PAREN);
				return term;
			}
			case TokenType.LEFT_BRACKET: {
				eat();
				const term = parse_term();
				expect(TokenType.RIGHT_BRACKET);
				return term;
			}
			default:
				throw unexpected_token(at());
		}
	}

	// start parsing
	const seq: Sequence = parse_sequence();

  print_ast(seq);
	return seq;
}

// testing
const src = `forall x exists t person(x) => time(t) and can_fool(x, t)`;

parse(src);
