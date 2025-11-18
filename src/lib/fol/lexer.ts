export enum TokenType {
  EOF,
  NOT,
  EXISTS,
  FOR_ALL,
  EQUALS,
  PLUS,
  MINUS,
  MULTIPLY,
  DIVIDE,
  POW,
  GREATER,
  GREATER_EQUALS,
  LESSER,
  LESSER_EQUALS,
  IDENTIFIER,
  NUMBER,
  STMT_SEPERATOR,
  EXPR_SEPERATOR,
  LEFT_PAREN,
  RIGHT_PAREN,
  LEFT_BRACKET,
  RIGHT_BRACKET,
  LEFT_CURLY,
  RIGHT_CURLY
}

const KEYWORDS: Record<string, TokenType> = {
  "forall": TokenType.FOR_ALL,
  "exists": TokenType.EXISTS,
}

export interface CodePosition {
  start: number,
  end: number,
}

export interface Token {
  kind: TokenType,
  content: string,
  code_pos: CodePosition,
}

export function new_token(kind: TokenType, content: string, code_pos: CodePosition): Token {
  return {kind, content, code_pos};
}

function is_digit(c: string) {
  return "0123456789".includes(c);
}

function is_alpha(c: string) {
  return c.toUpperCase() !== c.toLowerCase();
}

function is_ident(c: string, first_char: boolean) {
  if (is_alpha(c) || "_".includes(c)) return true;
  if (!first_char && (is_digit(c) || `'"`.includes(c))) return true;
  return false;
}

// error reporting
function unexpected_token(tk: Token, expected?: TokenType) {
  throw `Unexpected Token: ${JSON.stringify(tk)}` + expected !== undefined ? `, expected kind ${expected}` : "";
}

function unexpected_character(c: string) {
  throw `Unexpected Character: __${c}__`;
}

export function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  const chars = src.split("");
  let token_buffer = "";
  let start = 0;
  let end = 0;

  function flush_buffer() {
    token_buffer = "";
  }

  function at() {
    return chars[0];
  }

  function read() {
    const c = chars.shift()!;
    token_buffer += c;
    widen();
    return c;
  }

  function widen() {
    end++;
  }

  function next() {
    start = end;
    flush_buffer();
  }

  function pos(): CodePosition {
    return {start, end}
  }

  function is_more(): boolean {
    return chars.length > 0;
  }

  function push_token(kind: TokenType) {
    return tokens.push(new_token(kind, token_buffer, pos()));
  }

  while (chars.length > 0) {
    switch (at()) {
      case "=": { read(); push_token(TokenType.EQUALS); next(); break;}
      case "^": { read(); push_token(TokenType.POW); next(); break;}
      case "~": { read(); push_token(TokenType.NOT); next(); break;}
      case "+": { read(); push_token(TokenType.PLUS); next(); break;}
      case "-": { read(); push_token(TokenType.MINUS); next(); break;}
      case "*": { read(); push_token(TokenType.MULTIPLY); next(); break;}
      case "/": { read(); push_token(TokenType.DIVIDE); next(); break;}
      case "{": { read(); push_token(TokenType.LEFT_CURLY); next(); break;}
      case "}": { read(); push_token(TokenType.RIGHT_CURLY); next(); break;}
      case "(": { read(); push_token(TokenType.LEFT_PAREN); next(); break;}
      case ")": { read(); push_token(TokenType.RIGHT_PAREN); next(); break;}
      case "[": { read(); push_token(TokenType.LEFT_BRACKET); next(); break;}
      case "]": { read(); push_token(TokenType.RIGHT_BRACKET); next(); break;}
      case ",": { read(); push_token(TokenType.EXPR_SEPERATOR); next(); break;}
      case "<": {
        read();
        if (is_more() && at() === "=") { read(); push_token(TokenType.LESSER_EQUALS); }
        else push_token(TokenType.LESSER);
        next();
        break;
      }
      case ">": {
        read();
        if (is_more() && at() === "=") { read(); push_token(TokenType.GREATER_EQUALS); }
        else push_token(TokenType.GREATER);
        next();
        break;
      }
      default: {
        if (" \r".includes(at())) {
          read();
          next();
        } else if (at() === "\n") {
          read();
          push_token(TokenType.STMT_SEPERATOR);
          next();
        } else if (is_digit(at())) {
          // parse numbers
          while (is_more() && is_digit(at())) read();
          if (is_more() && at() === ".") read();
          while (is_more() && is_digit(at())) read();
          push_token(TokenType.NUMBER);
          next();
        } else if (is_ident(at(), true)) {
          // parse ident
          while (is_more() && is_ident(at(), false)) read();

          if (token_buffer in KEYWORDS) {
            push_token(KEYWORDS[token_buffer]);
          } else {
            push_token(TokenType.IDENTIFIER);
          }
          next();
        } else {
          unexpected_character(at());
        }
        break;
      }
    }
  }

  push_token(TokenType.EOF);

  return tokens;
}


// PARSING
export enum NodeType {
  SEQUENCE = "Sequence",
  FOR_ALL = "ForAll",
  EXISTS = "Exists",
  CALL_PRED = "CallPredicate",
  UNARY_PRED = "UnaryPredicate",
  BINARY_PRED = "BinaryPredicate",
  NUMBER = "Number",
  BINARY_OP = "BinaryOp",
  UNARY_OP = "UnaryOP",
  FUNCTION = "Function",
  VARIABLE = "Variable"
}

export interface Sequence {
  kind: NodeType.SEQUENCE;
  sentences: Sentence[];
}

export type Sentence = ForAll | Exists | CallPredicate | UnaryPredicate | BinaryPredicate;

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

export interface CallPredicate {
  kind: NodeType.CALL_PRED;
  name: Token,
  args: Term[],
}

export interface UnaryPredicate {
  kind: NodeType.UNARY_PRED;
  op: Token,
  right: Term,
}

export interface BinaryPredicate {
  kind: NodeType.BINARY_PRED;
  op: Token,
  left: Term,
  right: Term,
}

export type Term = Variable | NumericLiteral | Function | BinaryOp | UnaryOp;

export interface Variable {
  kind: NodeType.VARIABLE;
  name: string;
  tk: Token; // for better error handling
}

export interface NumericLiteral {
  kind: NodeType.NUMBER;
  value: number;
  tk: Token; // for better error handling
}

export interface Function {
  kind: NodeType.FUNCTION;
  name: Token,
  args: Term[],
}

export interface BinaryOp {
  kind: NodeType.BINARY_OP;
  op: Token,
  left: Term,
  right: Term,
}

export interface UnaryOp {
  kind: NodeType.UNARY_OP;
  op: Token,
  right: Term,
}

function parse(src: string): Sequence {
  const tokens = tokenize(src);
  
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
    }

    while (at().kind !== TokenType.EOF) {
      seq.sentences.push(parse_sentence());
    }
    eat(); // eat EOF

    return seq;
  }

  function parse_variable(): Variable {
    const tk = expect(TokenType.IDENTIFIER);
    return {
      kind: NodeType.VARIABLE,
      name: tk.content,
      tk
    }
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
      sentence: parse_sentence(),
    }
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
      sentence: parse_sentence(),
    }
  }

  function parse_sentence(): Sentence {
    switch (at().kind) {
      case TokenType.EXISTS:
        return parse_exists()
      case TokenType.FOR_ALL:
        return parse_forall()
      default:
        return parse_unquantified_sentence()
    }
  }

  function parse_unquantified_sentence(): Sentence {
    return parse_bicond_predicate();
  }

  function parse_bicond_predicate(): Sentence {
    
  }

  function parse_impl_predicate(): Sentence {

  }

  function parse_or_predicate(): Sentence {

  }

  function parse_and_predicate(): Sentence {

  }

  function parse_not_predicate(): Sentence {
    if (at().kind === TokenType.NOT) {
      eat();

    }
  }

  function parse_term(): Term {
    
  }

  function parse_additive_term(): Term {
    let left = parse_multiplicative_term();

    if ([TokenType.PLUS, TokenType.MINUS].includes(at().kind)) {
      const op = eat();
      const right = parse_unary_term();

      left = {
        kind: NodeType.BINARY_OP,
        op,
        left,
        right,
      }
    }

    return left;
  }

  function parse_multiplicative_term(): Term {
    let left = parse_unary_term();

    if ([TokenType.MULTIPLY, TokenType.DIVIDE].includes(at().kind)) {
      const op = eat();
      const right = parse_unary_term();

      left = {
        kind: NodeType.BINARY_OP,
        op,
        left,
        right,
      }
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
      }
    }

    return parse_exponential_term();
  }

  function parse_exponential_term(): Term {
    let left = parse_function_term();
		while (at().type == TokenType.POW) {
			const operator = eat();
			const right = parse_exponential_term();

			left = {
				kind: NodeType.BINARY_OP,
				left,
				right,
				operator,
			};
		}

		return left;
  }

  function parse_function_term(): Term {
    const ident = parse_primary_term();
    if (ident.kind !== NodeType.VARIABLE) return ident;

    if (at().kind === TokenType.LEFT_PAREN) {
      eat();
      while (at().kind != TokenType.RIGHT_PAREN) {
        const arg = parse_term();
        
      }
    }
  }

  function parse_primary_term(): Term {
    switch (at().kind) {
      case TokenType.NUMBER: {
        const tk = eat();
        return {
          kind: NodeType.NUMBER,
          tk,
          value: parseFloat(tk.content)
        }
      }
      case TokenType.IDENTIFIER: {
        const tk = eat();
        return {
          kind: NodeType.VARIABLE,
          tk,
          name: tk.content,
        }
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
  return seq;
}

// testing
const src = 
`forall x (x > 20)
`

console.log(tokenize(src));