import type { Token, TokenType } from "./lexer";

// error reporting
export function unexpected_token(tk: Token, expected?: TokenType) {
  throw `Unexpected Token: ${JSON.stringify(tk)}` + (expected !== undefined ? `, expected kind ${expected}` : "");
}

export function syntax_error(msg: string) {
  throw `Syntax error: ${msg}`;
}

export function unexpected_character(c: string) {
  throw `Unexpected Character: __${c}__`;
}