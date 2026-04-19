export function char_alias(ch: string) {
  switch (ch) {
    case "":
      return "ε";
    case " ":
      return "⎵";
    case "\\e":
      return "ε";
    case "\\.":
      return ".";
  }
  return ch;
}