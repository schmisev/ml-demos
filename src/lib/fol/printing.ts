import { NodeType, type FOL_Node, type Sequence } from "./parser";

export function format_ast(node: FOL_Node): string {
  switch (node.kind) {
    case NodeType.SEQUENCE:
      return node.sentences.map(format_ast).join("\n");
    case NodeType.FOR_ALL:
      return `∀${node.variables.map(format_ast).join(",")} ${format_ast(node.sentence)}`
    case NodeType.EXISTS:
      return `∃${node.variables.map(format_ast).join(",")} ${format_ast(node.sentence)}`
    case NodeType.UNARY_OP:
    case NodeType.UNARY_LOGIC:
      return `${node.op.kind}${format_ast(node.right)}`
    case NodeType.BINARY_OP:
    case NodeType.BINARY_LOGIC:
    case NodeType.COMPARISON_PREDICATE:
      return `( ${format_ast(node.left)} ${node.op.kind} ${format_ast(node.right)} )`
    case NodeType.FUNCTION:
      return `${node.name}(${node.args.map(format_ast).join(", ")})`
    case NodeType.NUMBER:
      return `${node.value}`;
    case NodeType.VARIABLE:
      return `${node.name}`;
    case NodeType.SIMPLE_PREDICATE:
      return `[${node.name}]`;
  }
}

export function print_ast(node: FOL_Node) {
  console.log(format_ast(node));
}