import {
  delimitedIndent,
  foldInside,
  foldNodeProp,
  HighlightStyle,
  indentNodeProp,
  LanguageSupport,
  LRLanguage,
  syntaxHighlighting
} from "@codemirror/language"

import {
  styleTags,
  tags as t,
  Tag
} from "@lezer/highlight"

import {parser} from "./parser.js"

const configuredParser = parser.configure({
  props: [
    styleTags({
      // Control-flow keywords
      "while if else": t.controlKeyword,

      // Function declaration names
      "FunctionDeclaration/Identifier":
        t.function(t.definition(t.variableName)),

      // Called function names
      "FunctionCall/Identifier":
        t.function(t.variableName),

      // Statements such as `work;` and `error;`
      "BareStatement/Identifier":
        t.variableName,

      "Tag/...":
        t.tagName,

      "error crash":
        t.atom,

      // Placeholder condition
      ConditionContent:
        t.special(t.variableName),

      // Comments
      LineComment:
        t.lineComment,

      BlockComment:
        t.blockComment,

      "Regex/...":
        t.regexp,

      // Punctuation
      "( )":
        t.paren,

      "{ }":
        t.brace,

      ";":
        t.separator
    }),

    indentNodeProp.add({
      Block: delimitedIndent({
        closing: "}",
        align: false
      })
    }),

    foldNodeProp.add({
      Block: foldInside
    })
  ]
})

export const miniLanguage = LRLanguage.define({
  name: "MiniLanguage",

  parser: configuredParser,

  languageData: {
    commentTokens: {
      line: "%",
    },

    closeBrackets: {
      brackets: ["(", "{"]
    },

    indentOnInput: /^\s*\}$/
  }
})

export const miniHighlightStyle = HighlightStyle.define([
  {
    tag: t.controlKeyword,
    color: "blue",
    fontWeight: "bold"
  },

  {
    tag: t.function(t.definition(t.variableName)),
    color: "black",
    fontWeight: "bold"
  },

  {
    tag: t.function(t.variableName),
    color: "black"
  },

  {
    tag: t.tagName,
    color: "green",
    fontWeight: "bold",
  },

  {
    tag: t.regexp,
    color: "darkgreen",
  },

  {
    tag: t.special(t.variableName),
    color: "coral",
    fontWeight: "bold"
  },

  {
    tag: [t.paren, t.brace],
    color: "#abb2bf"
  },

  {
    tag: t.separator,
    color: "#5c6370"
  },

  {
    tag: t.comment,
    color: "#7f848e",
    fontStyle: "italic"
  },

  {
    tag: t.atom,
    color: "red",
    fontWeight: "bold"
  }
])

export const miniSyntaxHighlighting =
  syntaxHighlighting(miniHighlightStyle)

export function miniLanguageSupport(): LanguageSupport {
  return new LanguageSupport(miniLanguage)
}