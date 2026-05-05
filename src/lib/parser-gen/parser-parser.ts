import { N, R, rule, T, type Grammar, type GrammarNode, type GrammarRule, type GrammarWord } from "./parser-gen";

export enum TT {
  Token = "terminal",
  NonTerminal = "non-terminal",
  To = "->",
  Or = "|",
  Sep = ";",
  EOF = "EOF",
}

const NON_TERM_START = "<";
const NON_TERM_END = ">";

export interface Token {
  type: TT,
  content: string,
}

export function tokenize(src: string): Token[] {
  let buffer = "";
  let index = 0;
  let tokens: Token[] = [];

  function at() {
    if (index < src.length) return src[index];
    throw `Not enough input!`;
  }

  function is(ch: string): boolean {
    return src.at(index) === ch; 
  }

  function next() {
    index++;
  }

  function eof() {
    if (index >= src.length) return true;
    return false;
  }

  function eot() {
    return (eof() || 
    [
      TT.Or, 
      TT.Sep, 
      NON_TERM_START, 
      NON_TERM_END,
      " ",
      "\n",
      "\r",
    ].includes(at()));
  }

  function read() {
    buffer += at();
    next();
  }

  function token(tt: TT) {
    const tk =  {type: tt, content: buffer};
    buffer = "";
    tokens.push(tk);
  }

  function skip() {
    buffer = "";
    next();
  }

  outer: while (!eof()) {
    switch (at()) {
      case "\n":
      case "\r":
      case " ":
        skip();
        break;
      case TT.Sep:
        read();
        token(TT.Sep);
        break;
      case TT.Or:
        read();
        token(TT.Or);
        break;
      case "'":
      case '"':
      case '`':
        const terminator = at();
        skip();
        while (!is(terminator) && !eof()) {
          read();
        }
        token(TT.Token);
        skip();
        break;
      case NON_TERM_START: {
        skip();
        while (!is(NON_TERM_END)) {
          if (eof()) {
            token(TT.NonTerminal);
            break outer;
          }
          read();
        }
        token(TT.NonTerminal);
        skip();
        break;
      }
      case "-":
        read();
        if (is(">")) {
          read();
          token(TT.To);
          break;
        }
      default:
        // continue parsing ANY terminal token
        while (!eot()) {
          read();
        }
        token(TT.Token);
        break;
    }
  }

  token(TT.EOF);
  return tokens;
}

export function parse(tokens: Token[]): Grammar {
  let index = 0;

  function at() {
    if (index >= tokens.length) throw `Hit EOF!`;
    return tokens.at(index)!;
  }

  function eat() {
    if (index >= tokens.length) throw `Not enough tokens left!`;
    return tokens[index++];
  }

  function expect(tt: TT) {
    if (!is(tt)) throw `Expected ${tt}, got ${JSON.stringify(at())}`;
    return eat();
  }

  function is(tt: TT) {
    return (at().type === tt);
  }

  return parse_grammar();

  function parse_grammar(): Grammar {
    const grammar: GrammarRule[] = [];

    while (!is(TT.EOF)) {
      grammar.push(...parse_rule());
    }

    return grammar;
  }

  function parse_rule(): GrammarRule[] {
    const nt = expect(TT.NonTerminal);
    expect(TT.To);

    let rules: GrammarRule[] = [];
    let active_word: GrammarWord = [];

    function new_rule() {
      if (active_word.length === 0) return;
      rules.push(rule(N(nt.content), active_word));
      active_word = [];
    }

    while (!is(TT.EOF)) {
      if (is(TT.Sep)) break;
      else if (is(TT.Or)) {
        new_rule();
        eat();
      } 
      else if (is(TT.NonTerminal)) active_word.push(N(eat().content));
      else if (is(TT.Token)) active_word.push(T(eat().content));
      else break;
    }
    new_rule();
    expect(TT.Sep);

    return rules;
  }
}