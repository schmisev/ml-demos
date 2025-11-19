import { unexpected_character } from "./error_handling";

export enum TokenType {
  EOF = "EOF",
  NOT = "¬",
  EXISTS = "∃",
  FOR_ALL = "∀",
  EQUALS = "=",
  NOT_EQUALS = "≠",
  PLUS = "+",
  MINUS = "-",
  MULTIPLY = "⋅",
  DIVIDE = "÷",
  POW = "^",
  GREATER = ">",
  GREATER_EQUALS = "≥",
  LESSER = "<",
  LESSER_EQUALS = "≤",
  IDENTIFIER = "I",
  NUMBER = "#",
  STMT_SEPERATOR = ";",
  EXPR_SEPERATOR = ",",
  LEFT_PAREN = "(",
  RIGHT_PAREN = ")",
  LEFT_BRACKET = "[",
  RIGHT_BRACKET = "]",
  LEFT_CURLY = "{",
  RIGHT_CURLY = "}",
  BICOND = "⇔",
  IMPL = "⇒",
  AND = "∧",
  OR = "∨",
}

const KEYWORDS: Record<string, TokenType> = {
  "forall": TokenType.FOR_ALL,
  "exists": TokenType.EXISTS,
  "and": TokenType.AND,
  "or": TokenType.OR,
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
      case "=": { 
        read(); 
        if (is_more() && at() === ">") { read(); push_token(TokenType.IMPL); }
        else { push_token(TokenType.EQUALS); }
        next();
        break;
      }
      case "&": { read(); push_token(TokenType.AND); next(); break;}
      case "|": { read(); push_token(TokenType.OR); next(); break;}
      case "^": { read(); push_token(TokenType.POW); next(); break;}
      case "~": { 
        read(); 
        if (is_more() && at() === "=") { read(); push_token(TokenType.NOT_EQUALS); }
        else push_token(TokenType.NOT); 
        next(); break;
      }
      case "+": { read(); push_token(TokenType.PLUS); next(); break;}
      case "-": { read(); push_token(TokenType.MINUS); next(); break; }
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
        if (is_more() && at() === "=") { 
          read();
          if (is_more() && at() === ">") { read(); push_token(TokenType.BICOND); }
          else { push_token(TokenType.LESSER_EQUALS) }; 
        }
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


