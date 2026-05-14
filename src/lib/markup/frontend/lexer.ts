import { KW_TAGS, TT, type Token } from "./tokens";

export interface Selection {
  from: number, // inclusive
  to: number // exclusive
}

export class LexerError extends Error {
  selection: Selection;
  buffer: string;
  constructor(message: string, selection: Selection, buffer: string) {
    super(message);
    this.selection = selection;
    this.buffer = buffer;
  }
}

export class Lexer {
  src: string;
  index = 0;
  buffer = "";
  from = 0;
  tokens: Token[] = [];
  success: boolean = false;
  errors: LexerError[] = [];

  constructor(src: string) {
    this.src = src;
    try {
      this.lex();
      this.success = true;
    } catch(e) {
      if (e instanceof LexerError){
        this.errors.push(e);
        return;
      }
      throw e;
    }
  }

  selection():Selection { return { from: this.from, to: this.index } }
  error(message: string) { return new LexerError(message, this.selection(), this.buffer); }

  is_ident(ch: string, first=false) {
    if (ch === "_") return true;
    if (!first && this.is_numeric(ch)) return true;
    return ch.toUpperCase() !== ch.toLowerCase();
  }

  is_numeric(ch: string) {
    if (!ch) return false;
    return "0123456789".includes(ch);
  }

  at() {
    // get character at index
    if (this.eof()) throw this.error(`Reached end of input!`);
    return this.src[this.index];
  }

  eof() {
    return (this.index >= this.src.length);
  }

  is(ch: string) {
    if (this.eof()) return false;
    return this.at() === ch;
  }

  lookahead(ch: string) {
    const length = ch.length;
    const substring = this.src.slice(this.index, this.index + length);
    return (substring === ch);
  }

  next() {
    // go to next character
    this.index++;
  }

  clear() {
    this.buffer = "";
  }

  skip() {
    // skip over current character
    this.clear();
    this.next();
    this.from = this.index;
  }

  read() {
    // read current character, move to next
    this.buffer += this.at();
    this.next();
  }

  expect(ch: string) {
    if (!this.is(ch)) throw this.error(`Expected '${ch}', got '${this.at()}'`);
    return this.read();
  }

  expect_word(word: string) {
    for (const ch of word) {
      this.expect(ch);
    }
  }

  token(kind: TT) {
    this.tokens.push({kind, content: this.buffer});
    this.clear();
  }

  lex() {
    loop: while (!this.eof()) {
      switch (this.at()) {
        case "\\":
          this.next(); this.read(); 
          if (this.eof()) {
            this.token(TT.Text);
            return;
          }
          continue loop;
        case '<':
          this.read();
          switch (this.at()) {
            case ">": this.read(); this.token(TT.TagSep); continue loop;
            case '"': {
              this.read(); this.expect(">"); this.token(TT.TagQuote); this.lex_quote(); continue loop;
            }
            case '#': {
              this.read(); this.expect(">"); this.token(TT.TagComment); this.lex_quote(); continue loop;
            }
            case "/": {
              this.read(); this.expect(">"); this.token(TT.TagEnd); continue loop;
            }
          }
          this.read_ident();
          if (KW_TAGS.has(this.buffer)) this.token(this.buffer as TT);
          else this.token(TT.TagIdent);
          // lex inside of tag
          this.lex_inside_tag();
          continue loop;
        default:
          // read text
          this.lex_text();
          continue loop;
      }
    }
  }

  lex_text() {
    loop: while (!this.eof()) {
      switch (this.at()) {
        case "\\":
          this.next(); this.read(); continue loop;
        case "<":
          this.token(TT.Text);
          return; // we found a tag!
        case "\n":
          this.token(TT.Text);
          this.read();
          this.token(TT.NewLine);
          continue loop;
        default:
          this.read();
          continue loop;
      }
    }
    this.token(TT.Text);
  }

  lex_quote() {
    loop: while (!this.eof()) {
      switch (this.at()) {
        case "\\":
          this.next(); this.read(); continue loop;
        case "\n":
          this.token(TT.Text);
          this.read();
          this.token(TT.NewLine);
          continue loop;
        default:
          if (this.lookahead(TT.TagComment)) {
            this.token(TT.Text);
            this.expect_word(TT.TagComment);
            this.token(TT.TagComment);
            return;
          } else if (this.lookahead(TT.TagQuote)) {
            this.token(TT.Text);
            this.expect_word(TT.TagQuote);
            this.token(TT.TagQuote);
            return;
          } else {
            this.read();
          }
        
      }
    }
    this.token(TT.Text);
    this.token(TT.TagQuote);
  }

  lex_inside_tag() {
    let expr_depth = 0;

    loop: while(!this.eof()) {
      switch (this.at()) {
        case "/":
          if (expr_depth === 0) { 
            this.read(); 
            if (this.is("/")) { this.read(); this.token(TT.TagLineApply); return; }
            this.expect(">"); this.token(TT.TagCloseEnd); return; 
          };
          this.read(); this.token(TT.Div); continue loop;
        case " ":
        case "\n":
          this.skip();
          break;
        case "=":
          this.read();
          if (this.is("=")) { this.read(); this.token(TT.EQ); continue loop; }
          this.token(TT.Assign); continue loop;
        case ">":
          this.read();
          if (expr_depth === 0) {  this.token(TT.TagClose); return; }
          if (this.is("=")) { this.read(); this.token(TT.GEQ); continue loop; }
          this.token(TT.GT); continue loop;
        case "<":
          if (expr_depth === 0) throw this.error(`Only use ${this.at()} inside (...)`);
          this.read();
          if (this.is("=")) { this.read(); this.token(TT.LEQ); continue loop; }
          this.token(TT.LT); continue loop;
        case "^":
          this.read(); this.token(TT.Pow); continue loop;
        case "*":
          this.read(); this.token(TT.Times); continue loop;
        case "&":
          this.read(); this.token(TT.And); continue loop;
        case "|":
          this.read(); this.token(TT.Or); continue loop;
        case "%":
          this.read(); this.token(TT.Mod); continue loop;
        case "(":
          this.read(); this.token(TT.LParen);
          expr_depth += 1;
          continue loop;
        case ")":
          if (expr_depth === 0) throw this.error(`Unmatched parentheses: ... )`);
          this.read(); this.token(TT.RParen);
          expr_depth -= 1;
          continue;
        default:
          if (this.is_ident(this.at(), true)) { this.read_ident(); this.token(TT.Ident); continue loop } 
          else if (this.is_numeric(this.at()) || this.is(".")) { this.lex_number(); continue loop; }
          throw this.error(`Illegal character '${this.at()}'!`);
      }
    }
  }

  lex_number() {
    while(!this.eof() && this.is_numeric(this.at())) {
      this.read();
    }
    if(!this.is(".")) { 
      if (this.buffer.length === 0) throw this.error(`Tried to read integer, but there was none!`);
      this.token(TT.Int); 
      return; 
    }
    this.read();
    while(!this.eof() && this.is_numeric(this.at())) {
      this.read();
    }
    if (this.buffer.length <= 1) throw this.error(`Tried to read float, but only received '${this.buffer}'!`);
    this.token(TT.Float);
    return;
  }

  // reads identifier into the buffer
  read_ident() {
    let first = true;
    while (!this.eof() && this.is_ident(this.at(), first)) {
      this.read();
      first = false;
    }
    if (this.buffer.length === 0) throw this.error(`Tried to read identifier, but there was none!`);
  }
}