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
      case "=": { read(); push_token(TokenType.EQUALS); next(); }
      case "~": { read(); push_token(TokenType.NOT); next(); }
      case "+": { read(); push_token(TokenType.PLUS); next(); }
      case "-": { read(); push_token(TokenType.MINUS); next(); }
      case "*": { read(); push_token(TokenType.MULTIPLY); next(); }
      case "/": { read(); push_token(TokenType.DIVIDE); next(); }
      case "{": { read(); push_token(TokenType.LEFT_CURLY); next(); }
      case "}": { read(); push_token(TokenType.RIGHT_CURLY); next(); }
      case "(": { read(); push_token(TokenType.LEFT_PAREN); next(); }
      case ")": { read(); push_token(TokenType.RIGHT_PAREN); next(); }
      case "[": { read(); push_token(TokenType.LEFT_BRACKET); next(); }
      case "]": { read(); push_token(TokenType.RIGHT_BRACKET); next(); }
      case ",": { read(); push_token(TokenType.EXPR_SEPERATOR); next(); }
      case "<": {
        read();
        if (is_more() && at() === "=") { read(); push_token(TokenType.LESSER_EQUALS); }
        else push_token(TokenType.LESSER);
        next();
      }
      case ">": {
        read();
        if (is_more() && at() === "=") { read(); push_token(TokenType.GREATER_EQUALS); }
        else push_token(TokenType.GREATER);
        next();
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
          throw `Unrecognized character: __${at()}__`;
        }
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

export type Term = Variable | NumericLiteral;

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
    if (tk.kind !== kind) throw `Expected ${kind}, got ${JSON.stringify(tk)}`;
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

  function parse_atomic_predicate(): Sentence {
    switch (at().kind) {
      case TokenType.IDENTIFIER:
      case TokenType.NUMBER:
      case TokenType.LEFT_PAREN:
        eat(); // eat curly
        return parse_sentence()
        expect(TokenType.RIGHT_PAREN);
      case TokenType.LEFT_BRACKET:
        eat(); // eat curly
        return parse_sentence()
        expect(TokenType.RIGHT_BRACKET);
      case TokenType.LEFT_CURLY:
      case TokenType.RIGHT_CURLY:
        throw `{} not yet implemented`;
        
    }
  }

  const seq: Sequence = parse_sequence();

  return seq;
}

// testing
const src = 
`x in {1, 2, 3, 4}
forall x x > 2
`

console.log(tokenize(src));