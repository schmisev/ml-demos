import { BuechiAutomaton } from '$lib/buechi.svelte';
import type { HuiGraphDefinition } from '$lib/hui-graphs/hui-core';
import { char_alias } from './character-alias';

export enum RegexTokenKind {
	STAR,
	PLUS,
	QUESTION,
	PIPE,
	DOT,
	LPAREN,
	RPAREN,
	LBRACKET,
	RBRACKET,
	LCURLY,
	RCURLY,
	CHARSET,
	EOF,
	EMPTY,
	DASH,
	SELF
}

export interface RegexToken {
	kind: RegexTokenKind;
	content: string;
}

function is_digit(c: string) {
	return '0123456789'.includes(c);
}

function is_alpha(c: string) {
	return c.toUpperCase() !== c.toLowerCase();
}

export function regex_tokenize(src: string): RegexToken[] {
	const tokens: RegexToken[] = [];
	const chars = src.split('');

	function at() {
		return chars[0];
	}

	function token(kind: RegexTokenKind) {
		if (chars.length <= 0) throw `No character left to consume!`;
		tokens.push({
			content: chars.shift()!,
			kind
		});
	}

	while (chars.length > 0) {
		switch (at()) {
			case '^':
				token(RegexTokenKind.SELF);
				break;
			case '*':
				token(RegexTokenKind.STAR);
				break;
			case '+':
				token(RegexTokenKind.PLUS);
				break;
			case '?':
				token(RegexTokenKind.QUESTION);
				break;
			case '|':
				token(RegexTokenKind.PIPE);
				break;
			case '.':
				token(RegexTokenKind.DOT);
				break;
			case '(':
				token(RegexTokenKind.LPAREN);
				break;
			case ')':
				token(RegexTokenKind.RPAREN);
				break;
			case '[':
				token(RegexTokenKind.LBRACKET);
				break;
			case ']':
				token(RegexTokenKind.RBRACKET);
				break;
			case '{':
				token(RegexTokenKind.LCURLY);
				break;
			case '}':
				token(RegexTokenKind.RCURLY);
				break;
			case '\\':
				chars.shift()!;
				if (chars.length <= 0) throw `Letter should follow after \\`;
				switch (at()) {
					case '(':
					case ')':
					case '[':
					case ']':
					case '{':
					case '}':
					case '|':
					case '*':
					case '+':
					case '?':
					case '\\':
						token(RegexTokenKind.CHARSET);
						break;
					default:
						throw `${at()} is not escapable`;
				}
				break;
			default:
				token(RegexTokenKind.CHARSET);
				break;
		}
	}

	tokens.push({
		content: '',
		kind: RegexTokenKind.EOF
	});

	return tokens;
}

export type RegexNode =
	| RegexStar
	| RegexPlus
	| RegexAnyChar
	| RegexChar
	| RegexChoice
	| RegexSequence
	| RegexEmpty
	| RegexSelf;

export const ANY_CHAR = 'any';
export const SELF_REF = 'self';
export const ALPHABET = new Set('abcdefghijklmnopqrstuvwxyz'.split(''));

export interface RegexCharSet {
	trigger: string;
	alias: string;
}

export interface RegexSelf extends RegexCharSet {
	kind: 'SELF';
}

export interface RegexChar extends RegexCharSet {
	kind: 'CHAR';
	value: string;
}

export interface RegexAnyChar extends RegexCharSet {
	kind: 'ANY';
}

export interface RegexEmpty {
	kind: 'EMPTY';
}

export interface RegexStar {
	kind: 'STAR';
	value: RegexNode;
}

export interface RegexPlus {
	kind: 'PLUS';
	value: RegexNode;
}

export interface RegexChoice {
	kind: 'CHOICE';
	nodes: RegexNode[];
}

export interface RegexSequence {
	kind: 'CONCAT';
	left: RegexNode;
	right: RegexNode;
}

export function regex_parse(tokens: RegexToken[]): [RegexNode, Map<string, RegexCharSet>] {
	let charset_id = 0;
	const charset_map = new Map<string, RegexCharSet>();

	function get_alias(): string {
		return '' + charset_id++;
	}

	function store_alias(charset: RegexCharSet) {
		charset_map.set(charset.alias, charset);
	}

	function eat() {
		return tokens.shift()!;
	}

	function at() {
		return tokens[0];
	}

	function expect(kind: RegexTokenKind) {
		if (at().kind !== kind) throw `Unexpected TOKEN: ${at().content}`;
		return eat();
	}

	function parse_regex(): RegexNode {
		return parse_choice();
	}

	function parse_choice(): RegexNode {
		let first = parse_sequence();
		if (at().kind !== RegexTokenKind.PIPE) return first;

		let node: RegexNode = {
			kind: 'CHOICE',
			nodes: [first]
		};

		while (at().kind === RegexTokenKind.PIPE) {
			eat();
			const next = parse_sequence();
			node.nodes.push(next);
		}

		return node;
	}

	function parse_sequence(): RegexNode {
		let left = parse_right_unop();

		while (true) {
			switch (at().kind) {
				case RegexTokenKind.PIPE:
				case RegexTokenKind.EOF:
				case RegexTokenKind.RPAREN:
					return left;
			}

			let right = parse_right_unop();

			left = {
				kind: 'CONCAT',
				left,
				right
			};
		}
	}

	function parse_right_unop(): RegexNode {
		let left = parse_primary_regex();
		while (
			at().kind === RegexTokenKind.PLUS ||
			at().kind === RegexTokenKind.STAR ||
			at().kind === RegexTokenKind.QUESTION
		) {
			if (at().kind === RegexTokenKind.QUESTION) {
				eat();
				left = {
					kind: 'CHOICE',
					nodes: [{ kind: 'EMPTY' }, left]
				};
			} else if (at().kind === RegexTokenKind.PLUS) {
				eat();
				left = {
					kind: 'PLUS',
					value: left
				};
			} else if (at().kind === RegexTokenKind.STAR) {
				eat();
				left = {
					kind: 'STAR',
					value: left
				};
			} else {
				break;
			}
		}

		return left;
	}

	function parse_primary_regex(): RegexNode {
		switch (at().kind) {
			case RegexTokenKind.DOT:
				eat();
				const any: RegexAnyChar = {
					kind: 'ANY',
					trigger: ANY_CHAR,
					alias: get_alias()
				};
				store_alias(any);
				return any;
			case RegexTokenKind.EMPTY:
				eat();
				return {
					kind: 'EMPTY'
				};
			case RegexTokenKind.SELF:
				eat();
				return {
					kind: 'SELF',
          trigger: SELF_REF,
          alias: get_alias()
				};
			case RegexTokenKind.CHARSET:
				return parse_char_regex();
			case RegexTokenKind.LPAREN:
				eat();
				const expr = parse_regex();
				expect(RegexTokenKind.RPAREN);
				return expr;
			case RegexTokenKind.LBRACKET:
				eat();
				const charset = parse_char_regex();
				expect(RegexTokenKind.RBRACKET);
				return charset;
			default:
				throw `Unexpected TOKEN: ${at().content}`;
		}
	}

	function parse_charset_regex(): RegexNode {
		const nodes: RegexNode[] = [];

		while (at().kind !== RegexTokenKind.RBRACKET) {
			parse_char_regex;
		}

		return {
			kind: 'CHOICE',
			nodes
		};
	}

	function parse_char_regex(): RegexNode {
		const value = eat().content;
		const char: RegexChar = {
			kind: 'CHAR',
			trigger: value,
			value,
			alias: get_alias()
		};
		store_alias(char);
		return char;
	}

	const ast = parse_regex();
	return [ast, charset_map];
}

export function make_regex_graph(node: RegexNode): HuiGraphDefinition {
	const graph: HuiGraphDefinition = {
		edges: [],
		nodes: []
	};

	let node_id = 0;
	let edge_id = 0;

	function traverse_tree(node: RegexNode): string {
		const this_id = '' + node_id++;

		switch (node.kind) {
			case 'CHAR':
				graph.nodes.push({
					id: this_id,
					label: `<b>${char_alias(node.value)}</b><sub>${node.alias}</sub>`,
					labelClasses: ['hui', 'node', 'rounded']
				});
				return this_id;
			case 'STAR':
			case 'PLUS':
				graph.nodes.push({
					id: this_id,
					label: node.kind === 'STAR' ? '*' : '+',
					labelClasses: ['hui', 'node', 'ellipse', 'special']
				});

				const val_id = traverse_tree(node.value);
				graph.edges.push({
					id: '' + edge_id++,
					fromId: this_id,
					toId: val_id
				});
				return this_id;

			case 'CHOICE':
				graph.nodes.push({
					id: this_id,
					label: '&nbsp;|&nbsp;',
					labelClasses: ['hui', 'node', 'ellipse', 'positive']
				});

				for (const val of node.nodes) {
					const opt_id = traverse_tree(val);

					graph.edges.push({
						id: '' + edge_id++,
						fromId: this_id,
						toId: opt_id
					});
				}

				return this_id;
			case 'CONCAT':
				graph.nodes.push({
					id: this_id,
					label: '&nbsp;‿&nbsp;',
					labelClasses: ['hui', 'node', 'ellipse']
				});

				graph.edges.push({
					id: '' + edge_id++,
					fromId: this_id,
					toId: traverse_tree(node.left)
				});

				graph.edges.push({
					id: '' + edge_id++,
					fromId: this_id,
					toId: traverse_tree(node.right)
				});
				return this_id;

			case 'ANY':
				graph.nodes.push({
					id: this_id,
					label: `<b>any</b><sub>${node.alias}</sub>`,
					labelClasses: ['hui', 'node', 'ellipse']
				});

				return this_id;
			case 'EMPTY':
				graph.nodes.push({
					id: this_id,
					label: 'ε',
					labelClasses: ['hui', 'node', 'ellipse']
				});

				return this_id;
			case 'SELF':
				graph.nodes.push({
					id: this_id,
					label: '↺',
					labelClasses: ['hui', 'node', 'ellipse']
				});

				return this_id;
		}
	}

	traverse_tree(node);
	return graph;
}

export function make_regex_buechi(node: RegexNode) {}
