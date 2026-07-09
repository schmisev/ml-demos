import { EMPTY, type Configuration, type PDS_Def, type StackSymbol } from "./pds.svelte";
import { TT, type Token, lexer } from "$lib/pda/pda-parser";
import type { InputSymbol } from "$lib/pda/pda.svelte";
import { cat, char, choice, eps, star, type RegexNode } from "$lib/regex/regex";
import type { LTL_Expr } from "./pds-ltl";
import { ANY_CHAR } from "$lib/regex/character-classes";

export function EMPTY_DEF(): PDS_Def {
  return {
    rules: [],
    initial_configs: [],
    target_configs: [],
    lambda: new Map(),
    phi: {kind: "Bool", value: true},
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

  function parse_initial_config() {
    expect(TT.LeftPointy);
    const loc: string = expect(TT.Symbol).content;
    expect(TT.Comma);
    let w: StackSymbol[] = [];
    while (!is(TT.RightPointy)) {
      w = [expect(TT.Symbol).content, ...w];
    }
    expect(TT.RightPointy);

    return {loc, w}
  }

  function parse_target_config(def: PDS_Def) {
    expect(TT.LeftPointy);
    const loc: string = expect(TT.Symbol).content;
    expect(TT.Comma);
    let w: RegexNode = parse_choice();
    expect(TT.RightPointy);

    def.target_configs.push({
      loc,
      w
    })
  }

  function parse_choice(): RegexNode {
    const left = parse_cat();
    if (at().type !== TT.Or) return left;
    let node = choice(left);

    while (at().type === TT.Or) {
      eat();
      const next = parse_cat();
      node.nodes.push(next);
    }
    return node;
  }

  function parse_cat(): RegexNode {
    let left = parse_star();
    if (is(TT.LeftParen) || is(TT.Symbol) || is(TT.Dot)) return cat(left, parse_cat());
    return left;
  }

  function parse_star(): RegexNode {
    let left: RegexNode = parse_primary();
    while (at().type === TT.Star) {
      eat();
      left = star(left);
    }

    return left;
  }

  function parse_primary(): RegexNode {
    switch (at().type) {
      case TT.Symbol:
        return char(eat().content);
      case TT.LeftParen:
        eat();
        const re = parse_choice();
        expect(TT.RightParen);
        return re;
      case TT.Dot:
        eat();
        return char(ANY_CHAR);
      case TT.Empty:
        eat();
        return eps();
      default:
        throw `Unexpected token in regex! ${at()}`;
    }
  }

  function parse_labeling(def: PDS_Def) {
    const prop_set = new Set<string>();

    while (is(TT.Symbol)) {
      const prop = expect(TT.Symbol);
      prop_set.add(prop.content);
      if (!def.lambda.has(prop.content)) {
        def.lambda.set(prop.content, new Set());
      }

      if (is(TT.Or)) {
        expect(TT.Or);
        continue;
      }
    }

    expect(TT.Impl);
    
    while (is(TT.Symbol)) {
      const sym = expect(TT.Symbol);
      // add prop to labeling function
      for (const prop of prop_set) {
        def.lambda.get(prop)!.add(sym.content); 
      }
      if (is(TT.And)) {
        expect(TT.And);
        continue;
      }
    }

  }

  function parse_ltl(): LTL_Expr {
    return parse_ltl_impl();
  }

  function parse_ltl_impl(): LTL_Expr {
    let left = parse_ltl_or();
    while (is(TT.Impl)) {
      expect(TT.Impl);
      left = {
        kind: "Impl", left, right: parse_ltl_or()
      }
    }
    return left;
  }

  function parse_ltl_or(): LTL_Expr {
    let left = parse_ltl_and();
    if (is(TT.Or)) {
      expect(TT.Or);
      return {
        kind: "Or", left, right: parse_ltl_or()
      }
    }
    return left;
  }

  function parse_ltl_and(): LTL_Expr {
    let left = parse_ltl_not();
    if (is(TT.And)) {
      expect(TT.And);
      return {
        kind: "And", left, right: parse_ltl_and()
      }
    }
    return left;
  }

  function parse_ltl_not(): LTL_Expr {
    if (is(TT.Not)) {
      eat();
      return {
        kind: "Not",
        expr: parse_ltl_not()
      }
    }
    return parse_ltl_fn();
  }

  function parse_ltl_fn(): LTL_Expr {
    const ident = parse_ltl_primary();
    if (ident.kind !== "Prop") return ident;
    if (!is(TT.LeftParen)) return ident;
    expect(TT.LeftParen);
    const unarg = parse_ltl();
    if (!is(TT.Comma)) {
      expect(TT.RightParen);
      switch (ident.name) {
        case "X":
          return { kind: "Next", expr: unarg }
        case "G":
          return { kind: "Always", expr: unarg }
        case "F":
          return { kind: "Finally", expr: unarg }
        default:
          throw `Unknown unary function '${ident.name}'`;
      }
    }
    expect(TT.Comma);
    const diarg = parse_ltl();
    expect(TT.RightParen);
    switch (ident.name) {
      case "U": 
        return { kind: "Until", left: unarg, right: diarg };
      case "R": 
        return { kind: "Release", left: unarg, right: diarg };
      default:
        throw `Unknown binary function '${ident.name}'`;
    }
  }

  function parse_ltl_primary(): LTL_Expr {
    switch (at().type) {
      case TT.Symbol:
        const sym = eat().content;
        if (sym == "TRUE") return {kind: "Bool", value: true};
        if (sym == "FALSE") return {kind: "Bool", value: false};
        return {
          kind: "Prop",
          name: sym,
          value: true
        }
      case TT.LeftParen: {
        eat();
        const expr = parse_ltl();
        expect(TT.RightParen);
        return expr;
      }
      default:
        throw `Unexpected token '${at().content}'`;
    }
  }

  function parse_definition(def: PDS_Def) {
    const set_name = expect(TT.Symbol);
    expect(TT.Equals);

    switch (set_name.content) {
      case "I":
        expect(TT.LeftCurly);
        while (!is(TT.RightCurly)) {
          def.initial_configs.push(parse_initial_config());
          if (is(TT.RightCurly)) break;
          expect(TT.Comma);
        }
        expect(TT.RightCurly);
        break;
      case "C":
        expect(TT.LeftCurly);
        while (!is(TT.RightCurly)) {
          parse_target_config(def);
          if (is(TT.RightCurly)) break;
          expect(TT.Comma);
        }
        expect(TT.RightCurly);
        break;
      case "lambda":
        expect(TT.LeftCurly);
        while (!is(TT.RightCurly)) {
          parse_labeling(def);
          if (is(TT.RightCurly)) break;
          expect(TT.Comma);
        }
        expect(TT.RightCurly);
        break;
      case "phi":
        def.phi = parse_ltl();
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