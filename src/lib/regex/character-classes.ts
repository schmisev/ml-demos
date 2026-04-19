import type { BuechiActions } from "$lib/buechi.svelte";

export const ANY_CHAR = '\\.';
export const ANY_WORD = '\\w';
export const ANY_DIGIT = '\\d';
export const NON_DIGIT = '\\D';
export const NON_WORD = '\\W';
export const ANY_WHITESPACE = '\\s';
export const NON_WHITESPACE = '\\S';

export const CLASS_MATCHERS: Record<string, (char: string) => boolean> = {
  [ANY_CHAR]: (char: string) => true,
  [ANY_WORD]: (char: string) => char.toUpperCase() !== char.toLowerCase(),
  [NON_WORD]: (char: string) => char.toUpperCase() === char.toLowerCase(),
  [ANY_DIGIT]: (char: string) => "0123456789".includes(char),
  [NON_DIGIT]: (char: string) => !"0123456789".includes(char),
  [ANY_WHITESPACE]: (char: string) => " \f\n\r\t\v".includes(char),
  [NON_WHITESPACE]: (char: string) => !" \f\n\r\t\v".includes(char),
}

export function check_class_match(
  actions: BuechiActions,
  char: string
) {
  let to_nodes = new Set<string>();
  let via_char = actions.get(char);
  if (via_char) to_nodes = to_nodes.union(via_char);

  for (const [k, v] of Object.entries(CLASS_MATCHERS)) {
    const to_option = actions.get(k);
    if (to_option) {
      if (CLASS_MATCHERS[k](char)) {
        to_nodes = to_nodes.union(to_option);
      }
    }
  }
  return to_nodes;
}