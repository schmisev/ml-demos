import type { RegexNode } from "./regex";

function annotate(node: RegexNode): RegexNode {
  switch (node.kind) {
    case "STAR": return {
      kind: "STAR",
      value: annotate(node.value),
      possiblyEmpty: true,
    }
    case "PLUS": {
      const value = annotate(node.value);
      return {
        kind: "PLUS",
        value,
        possiblyEmpty: value.possiblyEmpty
      }
    }
    case "CHOICE":
      let possiblyEmpty = false;
      let new_choices: RegexNode[] = [];
      for (const choice of node.nodes) {
        const annnotated = annotate(choice);
        if (annnotated.possiblyEmpty) possiblyEmpty = true;
        new_choices.push(annnotated);
      }
      return {kind: "CHOICE", nodes: new_choices, possiblyEmpty};
    case "CONCAT": {
      const left = annotate(node.left);
      const right = annotate(node.right);
      return {
        kind: "CONCAT", 
        left, right, 
        possiblyEmpty: left.possiblyEmpty && right.possiblyEmpty
      };
    }
    case "EMPTY": return {...node, possiblyEmpty: true};
    case "CHAR": return {...node, possiblyEmpty: false};
  }
}

type Derivative<Enc> = {
  zeroth: Array<Enc>,
  deriv: (enc: Enc, ch: string) => Set<Enc>,
  decode: (enc: Enc) => RegexNode,
}