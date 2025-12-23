import { and, bicond, impl, LogicContext, not, or, type LogicExpr } from "$lib/prop-logic";
import { TokenType } from "./lexer";
import { NodeType, parse, type FOL_Node, type Sequence } from "./parser";

export function pl_compiler(ctx: LogicContext, src: string): LogicExpr {
  const expr = parse(src);
  const compiled_expr = pl_compile_node(ctx, expr);
  return compiled_expr;
}

function pl_compile_node(ctx: LogicContext, seq: FOL_Node): LogicExpr {
  switch (seq.kind) {
    case NodeType.FOR_ALL:
    case NodeType.EXISTS:
    case NodeType.BINARY_OP:
    case NodeType.UNARY_OP:
    case NodeType.VARIABLE:
    case NodeType.FUNCTION:
    case NodeType.COMPARISON_PREDICATE:
    case NodeType.NUMBER:
      throw `${seq.kind} is not allowed in propositional logic.`
    // allowed from here
    case NodeType.SEQUENCE:
      return and(...seq.sentences.map(s => pl_compile_node(ctx, s)));
    case NodeType.UNARY_LOGIC: {
      switch (seq.op.kind) {
        case TokenType.NOT:
          return not(pl_compile_node(ctx, seq.right));
        default:
          throw `${seq.op.kind} is not an allowed unary operator.`
      }
    }
    case NodeType.BINARY_LOGIC: {
      const left = pl_compile_node(ctx, seq.left);
      const right = pl_compile_node(ctx, seq.right);
      switch (seq.op.kind) {
        case TokenType.IMPL:
          return impl(left, right);
        case TokenType.BICOND:
        case TokenType.EQUALS:
          return bicond(left, right);
        case TokenType.NOT_EQUALS:
          return not(bicond(left, right));
        case TokenType.PLUS:
        case TokenType.OR:
          return or(left, right);
        case TokenType.MULTIPLY:
        case TokenType.AND:
          return and(left, right);
        default:
          throw `${seq.op.kind} is not an allowed binary operator.`
      }
    }
    case NodeType.SIMPLE_PREDICATE:
      return ctx.get_lit(seq.name);
  }
}
