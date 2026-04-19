import { BuechiAutomaton } from '$lib/buechi.svelte';
import type { HuiGraphDefinition } from '$lib/hui-graphs/hui-core';
import { char_alias } from './character-alias';
import { ANY_CHAR } from './character-classes';

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
  let buffer = "";

	function at() {
		return chars[0];
	}

  function eat() {
    if (chars.length <= 0) throw `No character left to consume!`;
    buffer += chars.shift()!;
  }

  function clear() {
    buffer = "";
  }

	function singleToken(kind: RegexTokenKind) {
		clear();
    eat();
    tokens.push({
			content: buffer,
			kind
		});
    clear();
	}

  function token(kind: RegexTokenKind) {
    tokens.push({
			content: buffer,
			kind
		});
    clear();
	}

	while (chars.length > 0) {
		switch (at()) {
			case '^':
				singleToken(RegexTokenKind.SELF);
				break;
			case '*':
				singleToken(RegexTokenKind.STAR);
				break;
			case '+':
				singleToken(RegexTokenKind.PLUS);
				break;
			case '?':
				singleToken(RegexTokenKind.QUESTION);
				break;
			case '|':
				singleToken(RegexTokenKind.PIPE);
				break;
			case '.':
				singleToken(RegexTokenKind.DOT);
				break;
			case '(':
				singleToken(RegexTokenKind.LPAREN);
				break;
			case ')':
				singleToken(RegexTokenKind.RPAREN);
				break;
			case '[':
				singleToken(RegexTokenKind.LBRACKET);
				break;
			case ']':
				singleToken(RegexTokenKind.RBRACKET);
				break;
			case '{':
				singleToken(RegexTokenKind.LCURLY);
				break;
			case '}':
				singleToken(RegexTokenKind.RCURLY);
				break;
			case '\\':
				eat();
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
					case '.':
					case '\\':
						singleToken(RegexTokenKind.CHARSET);
            break;
          case 'w':
          case 'W':
          case 'd':
          case 'D':
          case 's':
          case 'S':
            eat();
            token(RegexTokenKind.CHARSET)
						break;
          case 'e':
            eat();
            token(RegexTokenKind.EMPTY)
            break;
					default:
						throw `${at()} is not escapable`;
				}
				break;
			default:
				singleToken(RegexTokenKind.CHARSET);
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
	| RegexChoice
	| RegexSequence
	| RegexEmpty
	| RegexCharSet;

export const SELF_REF = 'self';
export const ALPHABET = new Set('abcdefghijklmnopqrstuvwxyz'.split(''));

export interface RegexCharSet {
  kind: 'CHAR';
	trigger: string;
	alias: string;
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

export function re_alias(node: RegexNode): [RegexNode, Map<string, RegexCharSet>] {
  let charset_id = 0;
	const charset_map = new Map<string, RegexCharSet>();

  function get_alias(): string {
		return '' + charset_id++;
	}

  function store_alias(charset: RegexCharSet) {
    charset_map.set(charset.alias, charset);
  }

  function traverse(node: RegexNode): RegexNode {
    switch (node.kind) {
      case 'STAR':
        return {...node, value: traverse(node.value)}
      case 'PLUS':
        return {...node, value: traverse(node.value)}
      case 'CHOICE':
        return {...node, nodes: node.nodes.map(n => traverse(n))}
      case 'CONCAT':
        return {...node, left: traverse(node.left), right: traverse(node.right)}
      case 'EMPTY':
        return {...node};
      case 'CHAR':
        const new_node: RegexCharSet = {
          ...node,
          alias: get_alias()
        }
        store_alias(new_node);
        return new_node;
    }
  }

  const new_node = traverse(node);
  return [new_node, charset_map]
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

    switch (at().kind) {
      case RegexTokenKind.PIPE:
      case RegexTokenKind.EOF:
      case RegexTokenKind.RPAREN:
        return left;
    }

    let right = parse_sequence();

    return {
      kind: 'CONCAT',
      left,
      right
    };
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
				const any: RegexCharSet = {
					kind: 'CHAR',
					trigger: ANY_CHAR,
					alias: get_alias(),
				};
				store_alias(any);
				return any;
			case RegexTokenKind.EMPTY:
				eat();
				return {
					kind: 'EMPTY'
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
		const char: RegexCharSet = {
			kind: 'CHAR',
			trigger: value,
			alias: get_alias()
		};
		store_alias(char);
		return char;
	}

	const ast = parse_regex();
	return [ast, charset_map];
}

function same<A extends RegexNode>(a: A, b: RegexNode): A {
  return b as A;
}

export function in_choice(a: RegexChoice, b: RegexChoice) {
  outer: for (const a_choice of a.nodes) {
    for (const b_choice of b.nodes) {
      if (regex_equal(a_choice, b_choice)) {
        continue outer;
      }
    }
    return false;
  }
  return true;
}

export function equal_choice(a: RegexChoice, b: RegexChoice) {
  return in_choice(a, b) && in_choice(b, a);
}

export function regex_equal(a: RegexNode, b: RegexNode): boolean {
  if (a.kind !== b.kind) return false;

  switch (a.kind) {
    case 'STAR':
      return regex_equal(a.value, same(a, b).value);
    case 'PLUS':
      return regex_equal(a.value, same(a, b).value);
    case 'CHOICE':
      return equal_choice(a, same(a, b));
    case 'CONCAT':
      return regex_equal(a.left, same(a, b).left) 
      && regex_equal(a.right, same(a, b).right)
    case 'EMPTY':
      return true;
    case 'CHAR':
      return a.trigger === same(a, b).trigger;
  }
}

export function merge_choice(a: RegexChoice): RegexChoice {
  const nodes: RegexNode[] = [];
  for (const node of a.nodes) {
    if (node.kind === "CHOICE") {
      const merged_choice = merge_choice(node);
      nodes.push(...merged_choice.nodes);
    } else {
      nodes.push(node);
    }
  }

  return {
    kind: "CHOICE",
    nodes
  }
}

export function zip_choice(a: RegexChoice): RegexNode {
  const paths: [RegexNode, RegexNode[]][] = [];

  outer: for (const option of a.nodes) {
    const [head, tail] = head_tail(option);
    if (paths.length === 0) {
      paths.push([head, [tail]]);
      continue;
    }

    for (const [key, list] of paths) {
      if (regex_equal(head, key)) {
        list.push(tail);
        continue outer;
      }
    }

    paths.push([head, [tail]]);
  }

  return zip_paths(paths);
}

export function zip_paths(paths: [RegexNode, RegexNode[]][]): RegexNode {
  if (paths.length === 0) return {kind: "EMPTY"}; // this should never happen, as it would require an empty choice
  if (paths.length === 1) {
    const key = paths[0][0];
    const next = paths[0][1];
    if (key.kind === "EMPTY") return key;
    if (next.length === 0) return key;
    let all_empty = true;
    let has_empty = false;
    for (const n of next) {
      if (n.kind !== "EMPTY") {
        all_empty = false;
        break;
      } else {
        has_empty = true;
      }
    }
    if (all_empty) {
      return key;
    }
    return {kind: "CONCAT", left: key, right: regex_optimize({kind: "CHOICE", nodes: next})}; // we can zip to one single concatenation
  }
  if (paths.length > 1) {
    return {
      kind: "CHOICE",
      nodes: paths.map(p => zip_paths([p]))
    }
  }
  return {kind: "EMPTY"}
}

export function head_tail(node: RegexNode): [RegexNode, RegexNode] {
  switch (node.kind) {
    case 'CONCAT':
      return [node.left, node.right];
    case 'PLUS':
    case 'STAR':
    case 'CHOICE':
    case 'EMPTY':
    case 'CHAR':
      return [node, {kind: "EMPTY"}];
  }
}

export function regex_optimize(node: RegexNode): RegexNode {
  switch (node.kind) {
    case 'STAR': {
      const opt = regex_optimize(node.value);
      switch (opt.kind) {
        case 'EMPTY':
          return opt;
        case 'STAR':
        case 'PLUS':
          return {...opt, kind: 'STAR'};
      }
      return {
        kind: "STAR",
        value: regex_optimize(node.value)
      }
    }
    case 'PLUS': {
      const opt = regex_optimize(node.value);
      switch (opt.kind) {
        case 'EMPTY':
          return opt;
        case 'STAR':
        case 'PLUS':
          return regex_optimize(node.value);
      }
      return {
        kind: "PLUS",
        value: regex_optimize(node.value)
      }
    }
    case 'CHOICE':
      // TODO: probably does too much work right now
      const new_choice: RegexChoice = {
        kind: "CHOICE",
        nodes: node.nodes.map(n => regex_optimize(n))
      }
      const merged_choice = merge_choice(new_choice);
      const zipped_choice = zip_choice(merged_choice);
      if (zipped_choice.kind === "CHOICE") {
        return merge_choice(zipped_choice);
      }
      return zipped_choice;
    case 'CONCAT':
      const left = regex_optimize(node.left);
      const right = regex_optimize(node.right);

      if (left.kind === "CONCAT") {
        return {
          kind: "CONCAT",
          left: left.left,
          right: { kind: "CONCAT", left: left.right, right: right }
        }
      }
      
      if (left.kind === "EMPTY") {
        return right;
      }

      if (right.kind === "EMPTY") {
        return left;
      }

      return {
        kind: "CONCAT",
        left: regex_optimize(node.left),
        right: regex_optimize(node.right),
      }
    case 'EMPTY':
      return {
        kind: "EMPTY",
      }
    case 'CHAR':
      return {...node}
  }
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
        const isClass = node.trigger[0] === "\\";
				graph.nodes.push({
					id: this_id,
					label: `<b>${char_alias(node.trigger)}</b><sub>${node.alias}</sub>`,
					labelClasses: ['hui', 'node', 'rounded', isClass ? 'special' : 'negative']
				});
				return this_id;
			case 'STAR':
			case 'PLUS':
				graph.nodes.push({
					id: this_id,
					label: node.kind === 'STAR' ? '*' : '+',
					labelClasses: ['hui', 'node', 'rect']
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
					labelClasses: ['hui', 'node', 'rect']
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
					label: '•',
					labelClasses: ['hui', 'node', 'rect']
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
			case 'EMPTY':
				graph.nodes.push({
					id: this_id,
					label: 'ε',
					labelClasses: ['hui', 'node', 'rounded', 'special']
				});
				return this_id;
		}
	}

	traverse_tree(node);
	return graph;
}


export function format_regex(node: RegexNode): string {
  switch (node.kind) {
    case 'STAR':
    case 'PLUS': {
      const op = (node.kind === "PLUS" ? "+" : "*");
      const in_paren = (node.value.kind === "CONCAT");
      if (in_paren) return "(" + format_regex(node.value) + ")" + op;
      return format_regex(node.value) + op;
    }
    case 'CHOICE': {
      const non_empty_nodes: RegexNode[] = [];
      let has_empty = false;
      for (const n of node.nodes) {
        if (n.kind === "EMPTY") {
          has_empty = true;
        } else non_empty_nodes.push(n);
      }
      const question = (has_empty ? "?" : "");
      const in_paren = non_empty_nodes.length > 1 || non_empty_nodes[0].kind === "CONCAT";
      if (!in_paren) return format_regex(non_empty_nodes[0]) + question;
      return "(" + non_empty_nodes.map(n => format_regex(n)).join("|") + ")" + question;
    }
    case 'CONCAT':
      return format_regex(node.left) + format_regex(node.right);
    case 'EMPTY':
      return `\\e`;
    case 'CHAR':
      if (node.trigger === "\\.") return ".";
      return node.trigger;
  }
}