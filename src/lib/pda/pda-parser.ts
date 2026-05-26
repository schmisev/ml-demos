import { EMPTY, type NPDA_Def, type InputSymbol, type StackSymbol } from "./pda.svelte";

export enum TT {
  Symbol = "sym",
  LeftParen = "(",
  RightParen = ")",
  RightCurly = "}",
  LeftCurly = "{",
  LeftPointy = "<",
  RightPointy = ">",
  Comma = ",",
  Empty = "~",
  Decl = "*",
  Equals = "=",
  EOF = "eof",
}

export interface Token {
  type: TT,
  content: string,
}

export function EMPTY_DEF() {
  return {
    delta: [],
    Z: EMPTY,
    F: [],
    q_0: []
  }
} 

export function lexer(src: string): Token[] {
  let index = 0;
  let buffer = "";
  let tokens: Token[] = [];

  function is(ch: string) { 
    return at() === ch 
  };
  function at() { 
    return src.at(index);
  };
  function adv() { index++ };
  function read() { 
    if (at()) buffer = buffer + at()! 
    else throw "No character found!" 
    adv();
  }
  function clear() { buffer = "" };
  function token(type: TT) {
    tokens.push({
      type,
      content: buffer
    });
    clear();
  }

  while (at()) {
    const ch = at()!;

    switch (ch) {
      case " ":
      case "\n":
      case "\r":
        adv(); break;
      case "(": read(); token(TT.LeftParen); break;
      case ")": read(); token(TT.RightParen); break;
      case "{": read(); token(TT.LeftCurly); break;
      case "}": read(); token(TT.RightCurly); break;
      case "<": read(); token(TT.LeftPointy); break;
      case ">": read(); token(TT.RightPointy); break;
      case "*": read(); token(TT.Decl); break;
      case "~": read(); token(TT.Empty); break;
      case "=": read(); token(TT.Equals); break;
      case ",": read(); token(TT.Comma); break;
      case "#": read(); token(TT.Symbol); break;
      case "%": {
        // comments
        clear();
        while (!is("\n")) { adv(); };
        adv();
        break;
      }
      default:
        if (is_ident(ch)) {
          while(is_ident(at())) {
            read();
          }
          token(TT.Symbol);
          break;
        }
        throw `Unexpected character: '${ch}'`
    }
  }

  token(TT.EOF);
  return tokens;
}

function parse_pda_from_tokens(tokens: Token[]): NPDA_Def {
  let index: number = 0;

  function at() {
    if (index >= tokens.length) throw "No more tokens!";
    return tokens[index];
  }

  function ttype() {
    return at().type;
  }

  function is(type: TT) {
    return at().type === type;
  }

  function eat() {
    const curr = at();
    index++;
    return curr;
  }

  function expect(type: TT) {
    if (!is(type)) throw `Expected '${type}', got '${at().type}'`;
    return eat();
  }

  function parse_main(): NPDA_Def {
    const def: NPDA_Def = EMPTY_DEF();

    while(!is(TT.EOF)) {
      parse_stmt(def);
    }
    expect(TT.EOF);
    
    return def;
  }

  function parse_stmt(def: NPDA_Def) {
    switch (ttype()) {
      case TT.Symbol:
        // this is a definition
        parse_definition(def);
        break;
      case TT.LeftParen:
        // this is a transition
        parse_transition(def);
        break;
      default:
        throw `Unexpected Token: '${ttype()}'`
    }
  }

  function parse_transition(def: NPDA_Def) {
    eat(); // (
    const from = expect(TT.Symbol).content;
    expect(TT.Comma);
    let input: InputSymbol;
    if (is(TT.Symbol)) input = expect(TT.Symbol).content;
    else if (is(TT.Empty)) {
      eat();
      input = "";
    }
    else throw `Expected input symbol!`;
    expect(TT.Comma);
    let top_of_stack: StackSymbol;
    if (is(TT.Symbol)) top_of_stack = expect(TT.Symbol).content;
    else if (is(TT.Empty)) {
      eat();
      top_of_stack = EMPTY;
    }
    else throw `Expected stack symbol!`;
    expect(TT.Comma);
    const to = expect(TT.Symbol).content;
    expect(TT.Comma);
    const repl: StackSymbol[] = [];
    if (is(TT.Empty)) {
      eat();
    }
    else while (!is(TT.RightParen)) {
      repl.push(expect(TT.Symbol).content);
    }
    expect(TT.RightParen);
    def.delta.push([from, input, top_of_stack, to, repl]);
  }

  function parse_definition(def: NPDA_Def) {
    const set_name = expect(TT.Symbol);
    expect(TT.Equals);

    switch (set_name.content) {
      case "F":
        expect(TT.LeftCurly);
        while (!is(TT.RightCurly)) {
          def.F.push(expect(TT.Symbol).content);
          if (is(TT.RightCurly)) break;
          expect(TT.Comma);
        }
        expect(TT.RightCurly);
        break;
      case "q_0":
        if (is(TT.Symbol)) {
          def.q_0.push(eat().content);
        } else {
          expect(TT.LeftCurly);
          while (!is(TT.RightCurly)) {
            def.q_0.push(expect(TT.Symbol).content);
            if (is(TT.RightCurly)) break;
            expect(TT.Comma);
          }
          expect(TT.RightCurly);
        }
        break;
      case "#":
        if (is(TT.Empty)) {
          def.Z = EMPTY;
        } else {
          def.Z = expect(TT.Symbol).content;
        }
        break;
      default:
        throw `Cannot set value of set '${set_name.content}' or there is no such set!`;
    }
  }

  return parse_main();
}

export function parse_pda(src: string): NPDA_Def {
  const tokens = lexer(src);
  const pda = parse_pda_from_tokens(tokens);
  return pda;
}

/*
(p, 0, Z, A Z)
*/

function is_alpha(ch: string) {
  return ch.toUpperCase() !== ch.toLowerCase();
}

function is_numeric(ch: string) {
  return "0123456789".includes(ch);
}

function is_ident(ch: string | undefined) {
  return ch && (is_alpha(ch) || is_numeric(ch) || ch === "_");
}