
export type LTL_Expr = LTL_Bool | LTL_Prop | LTL_Binop | LTL_Unop;

export interface LTL_Bool {
  kind: "Bool";
  value: boolean;
}

export type LTL_Prop = {
  kind: "Prop";
  name: string;
  value: boolean;
};

export interface LTL_Unop {
  kind: "Not" | "Next" | "Finally" | "Always";
  expr: LTL_Expr;
}

export interface LTL_Binop {
  kind: "And" | "Or" | "Impl" | "Until" | "Release";
  left: LTL_Expr;
  right: LTL_Expr;
}

export type LTL_LabelingFunction = Map<string, Set<string>>;

export function tex_ltl_expr(expr: LTL_Expr): string {
  switch (expr.kind) {
    case "Bool":
      return expr.value ? `\\top` : `\\bot`;  
    case "Prop":
      return `${expr.value ? "" : "\\neg"}\\boldsymbol{${expr.name}}`;
    case "And":
      return `(${tex_ltl_expr(expr.left)} \\land ${tex_ltl_expr(expr.right)})`;
    case "Or":
      return `(${tex_ltl_expr(expr.left)} \\lor ${tex_ltl_expr(expr.right)})`;
    case "Impl":
      return `(${tex_ltl_expr(expr.left)} \\rightarrow ${tex_ltl_expr(expr.right)})`;
    case "Until":
      return `(${tex_ltl_expr(expr.left)} \\:\\mathcal{U}\\: ${tex_ltl_expr(expr.right)})`;
    case "Release":
      return `(${tex_ltl_expr(expr.left)} \\:\\mathcal{R}\\: ${tex_ltl_expr(expr.right)})`;
    case "Not":
      return `(\\neg ${tex_ltl_expr(expr.expr)})`;
    case "Next":
      return `(\\mathcal{X}\\: ${tex_ltl_expr(expr.expr)})`;
    case "Finally":
      return `(\\mathcal{F}\\: ${tex_ltl_expr(expr.expr)})`;
    case "Always":
      return `(\\mathcal{G}\\: ${tex_ltl_expr(expr.expr)})`;
  }
}

function bin(kind: LTL_Binop["kind"], left: LTL_Expr, right: LTL_Expr): LTL_Binop {
  return {kind, left, right};
}
function un(kind: LTL_Unop['kind'], expr: LTL_Expr): LTL_Unop {
  return {kind, expr};
}
function prop(name: string, value: boolean): LTL_Prop {
  return {kind: "Prop", name, value}
}
function bool(value: boolean): LTL_Bool {
  return {kind: "Bool", value};
}

export function nnf(expr: LTL_Expr): LTL_Expr {
  switch (expr.kind) {
    case "Bool":
      return { kind: "Bool", value: expr.value };
    case "Prop":
      return { kind: "Prop", name: expr.name, value: expr.value };
    case "And":
      return { kind: "And", left: nnf(expr.left), right: nnf(expr.right) };
    case "Or":
      return { kind: "Or", left: nnf(expr.right), right: nnf(expr.right) };
    case "Impl":
      return { kind: "Or", left: nnf_neg(expr.right), right: nnf(expr.right) };
    case "Until":
      return { kind: "Until", left: nnf(expr.right), right: nnf(expr.right) };
    case "Release":
      return { kind: "Until", left: nnf(expr.right), right: nnf(expr.right) };
    case "Not":
      return nnf_neg(expr.expr);
    case "Next":
      return { kind: "Next", expr: nnf(expr.expr) };
    case "Finally":
      return { kind: "Finally", expr: nnf(expr.expr) };
    case "Always":
      return { kind: "Finally", expr: nnf(expr.expr) };
  }
}

export function nnf_neg(expr: LTL_Expr): LTL_Expr {
  switch (expr.kind) {
    case "Bool":
      return bool(!expr.value);
    case "Prop":
      return prop(expr.name, !expr.value);
    case "And":
      return bin("Or", nnf_neg(expr.left), nnf_neg(expr.right));
    case "Or":
      return bin("And", nnf_neg(expr.left), nnf_neg(expr.right));
    case "Impl":
      return bin("And", nnf(expr.left), nnf_neg(expr.right));
    case "Until":
      return bin("Release", nnf_neg(expr.left), nnf_neg(expr.right));
    case "Release":
      return bin("Until", nnf_neg(expr.left), nnf_neg(expr.right));
    case "Not":
      return nnf(expr.expr); // double negation
    case "Next":
      return un("Next", nnf_neg(expr.expr));
    // the duals
    case "Finally":
      return un("Always", nnf_neg(expr.expr));
    case "Always":
      return un("Finally", nnf_neg(expr.expr));
  }
}

export function format(expr: LTL_Expr): string {
  switch (expr.kind) {
    case "Bool":
      return expr.value ? "TRUE" : "FALSE";
    case "Prop":
      return expr.name;
    case "And":
      return `(${format(expr.left)}&${format(expr.right)})`;
    case "Or":
      return `(${format(expr.left)}|${format(expr.right)})`;
    case "Impl":
      return `(${format(expr.left)}->${format(expr.right)})`;
    case "Until":
      return `U(${format(expr.left)},${format(expr.right)})`;
    case "Release":
      return `R(${format(expr.left)},${format(expr.right)})`;
    case "Not":
      return `(-${format(expr.expr)})`;
    case "Next":
      return `X(${format(expr.expr)})`;
    case "Finally":
      return `F(${format(expr.expr)})`;
    case "Always":
      return `G(${format(expr.expr)})`;
  }
}

// this is super slow, but what the hell
export function ltl_id(expr: LTL_Expr): string {
  return tex_ltl_expr(expr);
}

export function accumulate_cl(partial_cl: Set<LTL_Expr>, expr: LTL_Expr) {
  partial_cl.add(expr);
  accumulate_cl(partial_cl, nnf_neg(expr));
  
  switch (expr.kind) {
    case "Bool":
      return;
    case "Prop":
      break;
    case "And":
    case "Or":
    case "Until":
    case "Release":
    case "Impl":
      accumulate_cl(partial_cl, expr.left);
      accumulate_cl(partial_cl, expr.right);
    case "Not":
      break;
    case "Next":
      accumulate_cl(partial_cl, expr.expr);
    case "Finally":
      break;
    case "Always":
      break;
  }
}

export function cl(expr: LTL_Expr): Set<LTL_Expr> {
  const s = new Set<LTL_Expr>([bool(true)]);
  accumulate_cl(s, expr);
  return s;
}