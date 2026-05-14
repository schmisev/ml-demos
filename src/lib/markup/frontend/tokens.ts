
export enum TT {
  // text level
  TagIdent = "<tag",
  TagClose = "...>",
  TagSep = "<>",
  TagEnd = "</>",
  TagCloseEnd = "/>",
  TagLineApply = "//",
  TagIf = "<if",
  TagElif = "<elif",
  TagElse = "<else",
  TagFor = "<for",
  TagQuote = '<">',
  TagComment = '<#>',
  Text = "text",
  NewLine = "newline",

  // tag level
  Assign = "=",
  LParen = "(",
  RParen = ")",
  Int = "int",
  Float = "float",
  Ident = "ident",
  String = "string",

  // expr level
  EQ = "==",
  GT = ">",
  LT = "<",
  Pow = "^",
  Div = "/",
  Times = "*",
  GEQ = ">=",
  LEQ = "<=",
  And = "&",
  Or = "|",
  Mod = "%",
}

export const KW_TAGS: Set<string> = new Set([TT.TagIf, TT.TagElif, TT.TagElse, TT.TagFor]);

export interface Token {
  kind: TT,
  content: string,
}