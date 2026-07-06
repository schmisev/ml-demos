import type { HuiGraphDefinition, HuiNodeDefinition } from '$lib/hui-graphs/hui-core';
import { EMPTY_DEF } from './pds-parser';
import type { PDS_Def, StackSequence, StackSymbol, Transition } from './pds.svelte';

export enum TT {
	Ident = 'ident',
	If = 'if',
	Else = 'else',
	While = 'while',
	LeftParen = '(',
	RightParen = ')',
	RightCurly = '}',
	LeftCurly = '{',
	Semi = ';',
	Condition = '?',
	TruthyCondition = '!',
	EOF = 'eof'
}

const KEYWORDS: Record<string, TT> = {
	if: TT.If,
	else: TT.Else,
	while: TT.While
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
	Program = 'program'
}

export type MiniStmt = MiniSequence | MiniIfElse | MiniWhile | MiniCall | MiniFuncDef | MiniProgram;

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

export function parse_mini(src: string) {
	let tokens = lexer(src);

	let index: number = 0;
	let id: number = 0;
	let local_id: number = 0;

	function get_id() {
		return '' + id++;
	}

	function get_local_id() {
		return '' + local_id++;
	}

	function start_local_id() {
		local_id = 0;
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
		const func_defs: MiniFuncDef[] = [];

		while (!is(TT.EOF)) {
			func_defs.push(parse_func_def());
		}

		eat();

		return {
			kind: MiniKind.Program,
			func_defs,
			loc: get_id()
		};
	}

	function parse_func_def(): MiniFuncDef {
		start_local_id();

		const ident = expect(TT.Ident);
		expect(TT.LeftParen);
		expect(TT.RightParen);
		expect(TT.LeftCurly);
		const seq = parse_seq(TT.RightCurly);
		return {
			kind: MiniKind.FuncDef,
			ident: ident.content,
			seq,
			loc: get_id()
		};
	}

	function parse_seq(until: TT): MiniSequence {
		const stmts: MiniStmt[] = [];

		while (!is(until)) {
			stmts.push(parse_stmt());
		}

		expect(until);

		return {
			kind: MiniKind.Sequence,
			stmts,
			loc: get_id()
		};
	}

	function parse_stmt(): MiniStmt {
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
			default:
				throw `Illegal Token: ${ttype()}`;
		}
	}

	function parse_if_else(): MiniIfElse {
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
				loc: get_id()
			};
		}
		return {
			kind: MiniKind.IfElse,
			if: if_stmt,
			loc: get_id()
		};
	}

	function parse_while(): MiniWhile {
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
			loc: get_id()
		};
	}

	return parse_main();
}

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

export function mini_to_pds(stmt: MiniProgram): PDS_Def {
	const def: PDS_Def = EMPTY_DEF();
	// [string, StackSymbol, string, StackSequence]

	function new_rule(from: string, popped: StackSymbol, to: string, pushed: StackSequence) {
		def.rules.push([from, popped, to, pushed]);
	}

	let entry_point: MiniStmt | undefined = undefined;
	const call_locs = new Map<string, string[]>();
	for (const d of stmt.func_defs) {
		const func_name = d.ident;
		if (!call_locs.has(func_name)) {
			call_locs.set(func_name, []);
		}
		call_locs.get(func_name)!.push(d.loc);

		if (func_name === 'main') {
			entry_point = d;
		}
	}

	function get_locs(called_ident: string): string[] {
		return call_locs.get(called_ident) || [];
	}

	// Rule: Function name --> stack symbol
	// Rule: Stmt id --> Control loc

	function traverse(stmt: MiniStmt, ret?: {loc: string, sym: StackSymbol}) {
		switch (stmt.kind) {
			case MiniKind.Sequence: {
        if (!ret) break;
        for (const s of stmt.stmts) {
          new_rule(ret.loc, ret.sym, s.loc, [s.loc]);
          ret = {loc: s.loc, sym: s.loc};
          traverse(s, ret);
        }
        break;
      }
			case MiniKind.IfElse: {
        traverse(stmt.if);
        if (stmt.else) traverse(stmt.else);
        break;
      }
			case MiniKind.While: {
        traverse(stmt.stmt);
        break;
      }
			case MiniKind.Call: {
        if (!ret) break;
        for (const to_loc of get_locs(stmt.ident)) {
          new_rule(stmt.loc, ret.sym, to_loc, [to_loc, ret.sym]);
        }
        break;
      }
			case MiniKind.FuncDef: {
        traverse(stmt.seq, {loc: stmt.loc, sym: stmt.loc});
        break;
			}
			case MiniKind.Program: {
        for (const def of stmt.func_defs) {
          traverse(def);
        }
			}
		}
	}

	traverse(stmt);
	return def;
}
