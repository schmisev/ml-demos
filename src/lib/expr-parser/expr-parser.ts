export enum TokenKind {
  Number,
  Ident,
  Plus,
  Minus,
  Times,
  Divide,
  Pow,
  Colon,
}

export interface Token {
  kind: TokenKind;
  content: string;
}

function is_alpha(ch: string): boolean {
  return ch.toLowerCase() !== ch.toUpperCase();
}

function is_digit(ch: string): boolean {
  return "0123456789".includes(ch);
}

export function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  const chars = src.split("");
  let buffer = "";

  function at() {
    return chars[0];
  }

  function at_char(ch: string) {
    if (chars.length <= 0) return false;
    return chars[0] === ch;
  }

  function eat() {
    buffer += adv();
  }

  function adv() {
    if (chars.length <= 0) throw `No character found!`;
    return chars.shift()!;
  }

  function token(kind: TokenKind) {
    tokens.push({content: buffer, kind});
    buffer = "";
  }

  while (chars.length > 0) {
    switch (at()) {
      case " ":
        adv();
        break;
      case "+":
        eat();
        token(TokenKind.Plus);
        break;
      case "-":
        eat();
        token(TokenKind.Minus);
        break;
      case "*":
        eat();
        token(TokenKind.Times);
        break;
      case "/":
        eat();
        token(TokenKind.Divide);
        break;
    }
  }

  return tokens;
}