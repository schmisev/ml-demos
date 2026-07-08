import type { HuiGraphDefinition, HuiNodeDefinition } from '$lib/hui-graphs/hui-core';
import { EMPTY_DEF } from './pds-parser';
import type { PDS_Def, StackSequence, StackSymbol, Transition } from './pds.svelte';

export enum TT {
	Ident = 'ident',
	If = 'if',
	Else = 'else',
	While = 'while',
	Return = 'return',
	Break = 'break',
	Continue = 'continue',
  Error = 'error',
  Work = 'work',
  Crash = 'crash',
	LeftParen = '(',
	RightParen = ')',
	RightCurly = '}',
	LeftCurly = '{',
	Semi = ';',
	Colon = ':',
	Condition = '?',
	TruthyCondition = '!',
  Target = "@",
	EOF = 'eof'
}

const KEYWORDS: Record<string, TT> = {
	if: TT.If,
	else: TT.Else,
	while: TT.While,
	return: TT.Return,
	break: TT.Break,
	continue: TT.Continue,
	work: TT.Work,
	error: TT.Error,
  crash: TT.Crash,
};

export interface Token {
	type: TT;
	content: string;
}

function is_alpha(ch: string) {
	return ch.toUpperCase() !== ch.toLowerCase();
}

function is_numeric(ch: string) {
	return '0123456789'.includes(ch);
}

function is_ident(ch: string | undefined) {
	return ch && (is_alpha(ch) || is_numeric(ch) || ch === '_');
}

export function lexer(src: string): Token[] {
	let index = 0;
	let buffer = '';
	let tokens: Token[] = [];

	function is(ch: string) {
		return at() === ch;
	}
	function at() {
		return src.at(index);
	}
	function adv() {
		index++;
	}
	function read() {
		if (at()) buffer = buffer + at()!;
		else throw 'No character found!';
		adv();
	}
	function clear() {
		buffer = '';
	}
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
			case ' ':
			case '\n':
			case '\r':
				adv();
				break;
			case '(':
				read();
				token(TT.LeftParen);
				break;
			case ')':
				read();
				token(TT.RightParen);
				break;
			case '{':
				read();
				token(TT.LeftCurly);
				break;
			case '}':
				read();
				token(TT.RightCurly);
				break;
			case '?':
				read();
				token(TT.Condition);
				break;
			case '!':
				read();
				token(TT.TruthyCondition);
				break;
			case ';':
				read();
				token(TT.Semi);
				break;
      case '@':
				read();
				token(TT.Target);
				break;
      case ':':
				read();
				token(TT.Colon);
				break;
			case '%': {
				// comments
				clear();
				while (!is('\n')) {
					adv();
				}
				adv();
				break;
			}
			default:
				if (is_ident(ch)) {
					while (is_ident(at())) {
						read();
					}

					if (buffer in KEYWORDS) {
						token(KEYWORDS[buffer]);
					} else {
						token(TT.Ident);
					}

					break;
				}
				throw `Unexpected character: '${ch}'`;
		}
	}

	token(TT.EOF);
	return tokens;
}

export enum MiniKind {
	Sequence = 'seq',
	IfElse = 'if_else',
	While = 'while',
	Call = 'call',
	FuncDef = 'func_def',
	Program = 'program',
	Return = 'return',
  Break = 'break',
  Continue = 'continue',
  Work = 'work',
  Error = 'error',
  Crash = 'crash'
}

export type MiniStmt = MiniSequence | MiniIfElse | MiniWhile | MiniCall | MiniFuncDef | MiniProgram | MiniReturn | MiniBreak | MiniContinue | MiniWork | MiniError | MiniCrash;

export interface MiniMeta {
	loc: string;
}

export interface MiniSequence extends MiniMeta {
	kind: MiniKind.Sequence;
	stmts: MiniStmt[];
}

export interface MiniIfElse extends MiniMeta {
	kind: MiniKind.IfElse;
	if: MiniStmt;
	else?: MiniStmt;
}

export interface MiniWhile extends MiniMeta {
	kind: MiniKind.While;
	stmt: MiniStmt;
	truthiness: boolean;
}

export interface MiniCall extends MiniMeta {
	kind: MiniKind.Call;
	ident: string;
}

export interface MiniFuncDef extends MiniMeta {
	kind: MiniKind.FuncDef;
	ident: string;
	seq: MiniSequence;
}

export interface MiniProgram extends MiniMeta {
	kind: MiniKind.Program;
	func_defs: MiniFuncDef[];
}

export interface MiniReturn extends MiniMeta {
  kind: MiniKind.Return;
}

export interface MiniBreak extends MiniMeta {
  kind: MiniKind.Break;
}

export interface MiniContinue extends MiniMeta {
  kind: MiniKind.Continue;
}

export interface MiniWork extends MiniMeta {
  kind: MiniKind.Work;
}

export interface MiniError extends MiniMeta {
  kind: MiniKind.Error;
}

export interface MiniCrash extends MiniMeta {
  kind: MiniKind.Crash;
}

export function parse_mini(src: string) {
	let tokens = lexer(src);

	let index: number = 0;
	let id: number = 0;
  let reserved_ids: string[] = [];
  let reserved_labels: Set<string> = new Set();

  function reserve_id() {
    reserved_ids.push("" + id++);
  }

	function retrieve_id() {
    if (reserved_ids.length === 0) reserve_id();
    return reserved_ids.pop()!;
	}

  function get_id() {
    reserve_id();
    return reserved_ids.pop()!;
	}

	function at() {
		if (index >= tokens.length) throw 'No more tokens!';
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

	function parse_main(): MiniProgram {
		reserve_id();
    
    const func_defs: MiniFuncDef[] = [];

		while (!is(TT.EOF)) {
			func_defs.push(parse_func_def());
		}

		eat();

		return {
			kind: MiniKind.Program,
			func_defs,
			loc: retrieve_id()
		};
	}

  function parse_label(): false | string {
    if (
      tokens.at(index)?.type !== TT.Ident 
      || tokens.at(index+1)?.type !== TT.Colon
    ) return false;

    const ident = expect(TT.Ident);
    expect(TT.Colon);

    if (reserved_labels.has(ident.content))
      throw `${ident.content}: This label is already used elsewhere!`;
    reserved_labels.add(ident.content);
    return ident.content;
  }

	function parse_func_def(): MiniFuncDef {
		const label = parse_label();

    const ident = expect(TT.Ident);
    reserve_id();
		expect(TT.LeftParen);
		expect(TT.RightParen);
		expect(TT.LeftCurly);
		const seq = parse_seq(TT.RightCurly);
    const id = retrieve_id();
		return {
			kind: MiniKind.FuncDef,
			ident: ident.content,
			seq,
			loc: label || id,
		};
	}

	function parse_seq(until: TT): MiniSequence {
    reserve_id();

		const stmts: MiniStmt[] = [];

		while (!is(until)) {
			stmts.push(parse_stmt());
		}

		expect(until);

		return {
			kind: MiniKind.Sequence,
			stmts,
			loc: retrieve_id()
		};
	}

	function parse_stmt(): MiniStmt {
		const label = parse_label();
    if (label) {
      const labeled_stmt = parse_stmt();
      labeled_stmt.loc = label;
      return labeled_stmt;
    }
    
    switch (ttype()) {
			case TT.Ident:
        const ident = eat();
				expect(TT.LeftParen);
				expect(TT.RightParen);
				expect(TT.Semi);
				return {
					kind: MiniKind.Call,
					ident: ident.content,
					loc: get_id()
				};
			case TT.If:
				return parse_if_else();
			case TT.While:
				return parse_while();
			case TT.LeftCurly:
				eat();
				return parse_seq(TT.RightCurly);
			case TT.Return:
				eat();
        expect(TT.Semi);
				return {
					kind: MiniKind.Return,
          loc: get_id()
				};
      case TT.Continue:
				eat();
        expect(TT.Semi);
				return {
					kind: MiniKind.Continue,
          loc: get_id()
				};
      case TT.Break:
				eat();
        expect(TT.Semi);
				return {
					kind: MiniKind.Break,
          loc: get_id()
				};
      case TT.Error:
				eat();
        expect(TT.Semi);
				return {
					kind: MiniKind.Error,
          loc: get_id()
				};
      case TT.Work:
				eat();
        expect(TT.Semi);
				return {
					kind: MiniKind.Work,
          loc: get_id()
				};
      case TT.Crash:
				eat();
        expect(TT.Semi);
				return {
					kind: MiniKind.Crash,
          loc: get_id()
				};
			default:
				throw `Illegal Token: ${ttype()}`;
		}
	}

	function parse_if_else(): MiniIfElse {
    reserve_id();

		expect(TT.If);
		expect(TT.LeftParen);
		expect(TT.Condition);
		expect(TT.RightParen);
		const if_stmt = parse_stmt();
		if (is(TT.Else)) {
			eat();
			const else_stmt = parse_stmt();
			return {
				kind: MiniKind.IfElse,
				if: if_stmt,
				else: else_stmt,
				loc: retrieve_id()
			};
		}
		return {
			kind: MiniKind.IfElse,
			if: if_stmt,
			loc: retrieve_id()
		};
	}

	function parse_while(): MiniWhile {
    reserve_id();

		expect(TT.While);
		expect(TT.LeftParen);

		let truthiness = false;
		if (is(TT.TruthyCondition)) {
			eat();
			truthiness = true;
		} else {
			expect(TT.Condition);
		}
		expect(TT.RightParen);

		const stmt = parse_stmt();
		return {
			kind: MiniKind.While,
			stmt,
			truthiness,
			loc: retrieve_id()
		};
	}

	return parse_main();
}


// Graphing

export function graph_mini(stmt: MiniStmt): HuiGraphDefinition {
	const graph: HuiGraphDefinition = {
		edges: [],
		nodes: []
	};

	function traverse(stmt: MiniStmt, parent?: string): string {
		const node_id = '+' + stmt.loc;

		if (parent)
			graph.edges.push({
				fromId: parent,
				toId: node_id
			});

		let node: HuiNodeDefinition = {
			id: node_id,
			label: `${stmt.kind}`,
			labelClasses: ['border-2', 'p-2', 'rounded-xl']
		};

		switch (stmt.kind) {
			case MiniKind.Sequence:
				for (const n of stmt.stmts) {
					traverse(n, node_id);
				}
				break;
			case MiniKind.IfElse:
				traverse(stmt.if, node_id);
				if (stmt.else) traverse(stmt.else, node_id);
				break;
			case MiniKind.While:
				node.label = stmt.truthiness ? `while(!)` : `while(?)`;
				traverse(stmt.stmt, node_id);
				break;
			case MiniKind.Call:
				node.label = `${stmt.ident}()`;
				break;
			case MiniKind.FuncDef:
				traverse(stmt.seq, node_id);
				node.label = `<b>${stmt.ident}</b>`;
				break;
			case MiniKind.Program:
				for (const d of stmt.func_defs) {
					traverse(d, node_id);
				}
				break;
		}

		graph.nodes.push(node);
		return node_id;
	}

	traverse(stmt);
	return graph;
}

