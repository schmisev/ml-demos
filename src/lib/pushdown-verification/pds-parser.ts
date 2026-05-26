import { EMPTY, type Configuration, type PDS_Def, type StackSymbol } from "./pds.svelte";
import { TT, type Token, lexer } from "$lib/pda/pda-parser";
import type { InputSymbol } from "$lib/pda/pda.svelte";

export function EMPTY_DEF(): PDS_Def {
  return {
    rules: [],
    initial_configs: []
  }
} 

function parse_pds_from_tokens(tokens: Token[]): PDS_Def {
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

  function parse_main(): PDS_Def {
    const def: PDS_Def = EMPTY_DEF();

    while(!is(TT.EOF)) {
      parse_stmt(def);
    }
    expect(TT.EOF);
    
    return def;
  }

  function parse_stmt(def: PDS_Def) {
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

  function parse_transition(def: PDS_Def) {
    eat(); // (
    const from = expect(TT.Symbol).content;
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
    def.rules.push([from, top_of_stack, to, repl]);
  }

  function parse_initial_config(def: PDS_Def) {
    expect(TT.LeftPointy);
    const loc: string = expect(TT.Symbol).content;
    expect(TT.Comma);
    let w: StackSymbol[] = [];
    while (!is(TT.RightPointy)) {
      w.push(expect(TT.Symbol).content);
    }
    expect(TT.RightPointy);

    def.initial_configs.push({
      loc,
      w
    })
  }

  function parse_definition(def: PDS_Def) {
    const set_name = expect(TT.Symbol);
    expect(TT.Equals);

    switch (set_name.content) {
      case "I":
        expect(TT.LeftCurly);
        while (!is(TT.RightCurly)) {
          parse_initial_config(def);
          if (is(TT.RightCurly)) break;
          expect(TT.Comma);
        }
        expect(TT.RightCurly);
        break;
      default:
        throw `Cannot set value of set '${set_name.content}' or there is no such set!`;
    }
  }

  return parse_main();
}

export function parse_pds(src: string): PDS_Def {
  const tokens = lexer(src);
  const pds = parse_pds_from_tokens(tokens);
  return pds;
}