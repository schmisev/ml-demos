import type { Vec2D } from "./vector";

type ValueType = 'in' | 'const' | 'relu' | 'sigmoid' | 'cos' | 'sin' | 'exp' | '^' | '+' | '*' | '-' | '/' | '~';

abstract class Value {
	data: number;
	grad: number;
	children: Value[];
	type: ValueType;
	label?: string;
  abstract op_precendence: number;

	constructor(data: number, type: ValueType = 'in', children: Value[] = [], label?: string) {
		this.data = data;
		this.grad = 0;
		this.children = children;
		this.label = label;
		this.type = type;
	}

	backward() {
		return; // this does nothing
	}

	forward() {
		this.grad = 0; // reset gradient
		return; // this does nothing
	}

	toExpr(mathjax = false): string {
		if (this.label) return this.label;
		if (this.children.length > 1)
			return this.children.map((v) => v.op_precendence < this.op_precendence ? "(" + v.toExpr(mathjax) + ")" : v.toExpr(mathjax)).join(this.type);
		if (this.children.length == 1) return this.type + this.children[0].toExpr(mathjax);
		return '???';
	}

	listVals(depth = 0, index = 0): string {
		const val = `${this.toExpr()} = ${this.data.toFixed(4)} \t grad = ${this.grad.toFixed(4)} \n`;
		const deps = this.children.map((v, i) => v.listVals(++depth, i)).join('');
		return val + deps;
	}

	add(other: Value | number, label?: string) {
    if (typeof other === "number") other = new Constant(other);
		return new AddNode(this, other, label);
	}

	mul(other: Value | number, label?: string) {
    if (typeof other === "number") other = new Constant(other);
		return new MulNode(this, other, label);
	}

	sub(other: Value | number, label?: string) {
    if (typeof other === "number") other = new Constant(other);
		return new SubNode(this, other, label);
	}

	div(other: Value | number, label?: string) {
    if (typeof other === "number") other = new Constant(other);
		return new DivNode(this, other, label);
	}

	neg(label?: string) {
		return new NegNode(this, label);
	}

  pow(expo: number, label?: string) {
    return new PowNode(this, expo, label);
  }

	relu(label?: string) {
		return new ReLUNode(this, label);
	}

  sigmoid(label?: string) {
		return new SigmoidNode(this, label);
	}

  sin(label?: string) {
		return new SinNode(this, label);
	}

  cos(label?: string) {
		return new CosNode(this, label);
	}

  exp(label?: string) {
    return new ExpNode(this, label);
  }
}

// convenience class
export class Input extends Value {
  op_precendence: number = 100;
  
	constructor(data: number, label?: string) {
		super(data, 'in', [], label);
	}
}

export class Constant extends Value {
  op_precendence: number = 100;

  constructor(data: number, label?: string) {
		super(data, 'const', [], label);
	}

  toExpr(): string {
    return "" + this.data;
  }

  listVals(depth?: number, index?: number): string {
    return "";
  }
}

class AddNode extends Value {
  op_precendence: number = 5;

  constructor(a: Value, b: Value, label?: string) {
    super(a.data + b.data, "+", [a, b], label);
  }

	// f = A+B
	// df/dA = 1
	// df/dB = 1
	backward(): void {
		const [A, B] = this.children;
		A.grad += 1.0 * this.grad;
		B.grad += 1.0 * this.grad;
	}

	forward(): void {
		super.forward();
		const [A, B] = this.children;
		this.data = A.data + B.data;
	}
}

class SubNode extends Value {
  op_precendence: number = 6;

  constructor(a: Value, b: Value, label?: string) {
    super(a.data - b.data, "-", [a, b], label);
  }

	// f = A-B
	// df/dA = 1
	// df/dB = -1
	backward(): void {
		const [A, B] = this.children;
		A.grad += 1.0 * this.grad;
		B.grad += -1.0 * this.grad; // TODO: check if this is right?
	}

	forward(): void {
		super.forward();
		const [A, B] = this.children;
		this.data = A.data - B.data;
	}
}

class MulNode extends Value {
  op_precendence: number = 10;

  constructor(a: Value, b: Value, label?: string) {
    super(a.data * b.data, "*", [a, b], label);
  }

	backward(): void {
		// f = A*B
		// df/dA = B
		// df/dB = A
		const [A, B] = this.children;
		A.grad += B.data * this.grad;
		B.grad += A.data * this.grad;
	}

	forward(): void {
		super.forward();
		const [A, B] = this.children;
		this.data = A.data * B.data;
	}

  toExpr(mathjax?: boolean): string {
    const [A, B] = this.children;
    if (mathjax) {
      return `${A.toExpr(mathjax)} \\cdot ${B.toExpr(mathjax)}`
    }

    return `${A.toExpr(mathjax)} * ${B.toExpr(mathjax)}`
  }
}

class DivNode extends Value {
  op_precendence: number = 11;

  constructor(a: Value, b: Value, label?: string) {
    super(a.data / b.data, "/", [a, b], label);
  }

	backward(): void {
		// f = A / B
		// df/dA = 1/B
		// df/dB = -A/B^2
		const [A, B] = this.children;
		A.grad += this.grad / B.data;
		B.grad += (-A.data / B.data ** 2) * this.grad;
	}

	forward(): void {
		super.forward();
		const [A, B] = this.children;
		this.data = A.data / B.data;
	}

  toExpr(mathjax?: boolean): string {
    const [A, B] = this.children;
    if (mathjax) {
      return `\\frac{${A.toExpr(mathjax)}}{${B.toExpr(mathjax)}}`
    }

    return `${A.toExpr(mathjax)}/${B.toExpr(mathjax)}`
  }
}

class NegNode extends Value {
  op_precendence: number = 1;

  constructor(x: Value, label?: string) {
    super(-x.data, "~", [x], label);
  }

	backward(): void {
		// f = -A
		// df/dA = -1
		const [A] = this.children;
		A.grad += -1.0 * this.grad;
	}

	forward(): void {
		super.forward();
		const [A] = this.children;
		this.data = -A.data;
	}

  toExpr(mathjax?: boolean): string {
    return "-" + this.children[0].toExpr(mathjax);
  }
}

class PowNode extends Value {
  op_precendence: number = 15;

  expo: number;
  
  constructor(base: Value, expo: number, label?: string) {
    super(base.data ** expo, "^", [base], label);
    this.expo = expo;
  }

	backward(): void {
		// f = A^exp
		// df/dA = exp * A^(exp-1)
		const [A] = this.children;
		A.grad += this.expo * A.data ** (this.expo-1);
	}

	forward(): void {
		super.forward();
		const [A] = this.children;
		this.data = A.data ** this.expo;
	}

  toExpr(mathjax = false): string {
    if (mathjax) return `${this.children[0].toExpr()}^{${this.expo}}`

    return `${this.children[0].toExpr()}^${this.expo}`
  }
}

class SimpleFunctionNode extends Value {
  op_precendence: number = 20;

  toExpr(mathjax = false): string {
    if (mathjax) return `\\${this.type}(${this.children.map(v => v.toExpr()).join(", ")})`
    return `${this.type}(${this.children.map(v => v.toExpr()).join(", ")})`
  }
}

class ExpNode extends SimpleFunctionNode {

  constructor(x: Value, label?: string) {
    super(Math.exp(x.data), "exp", [x], label);
  }

  backward(): void {
    // f = exp(A)
    // df/dA = exp(A) = f
    const [A] = this.children;
    A.grad = this.grad * this.data;
  }

  forward(): void {
    super.forward();
    const [A] = this.children;
    this.data = Math.exp(A.data);
  }
}

class ReLUNode extends SimpleFunctionNode {
  constructor(x: Value, label?: string) {
    super(x.data > 0 ? x.data : 0, "relu", [x], label);
  }

	backward(): void {
		// f = relu(A)
		// df/dA = {1 if A>0 else 0}
		const [A] = this.children;
		if (A.data > 0) A.grad += 1.0 * this.grad;
		else A.grad += 0.0;
	}

	forward(): void {
		super.forward();
		const [A] = this.children;
		this.data = A.data > 0 ? A.data : 0;
	}
}

class SinNode extends SimpleFunctionNode {
  constructor(x: Value, label?: string) {
    super(Math.sin(x.data), "sin", [x], label);
  }

  backward(): void {
    // f = sin(A)
    // df/dA = cos(A)
    const [A] = this.children;
    A.grad += Math.cos(A.data) * this.grad;
  }

  forward(): void {
    super.forward();
    const [A] = this.children;
    this.data = Math.sin(A.data);
  }
}

class CosNode extends SimpleFunctionNode {
  constructor(x: Value, label?: string) {
    super(Math.exp(x.data), "cos", [x], label);
  }

  backward(): void {
    // f = cos(A)
    // df/dA = -sin(A)
    const [A] = this.children;
    A.grad += -Math.sin(A.data) * this.grad;
  }

  forward(): void {
    super.forward();
    const [A] = this.children;
    this.data = Math.cos(A.data);
  }
}

function sigmoid(x: number) {
  return 1 / (1- Math.exp(-x))
}

class SigmoidNode extends SimpleFunctionNode {
  constructor(x: Value, label?: string) {
    super(sigmoid(x.data), "sigmoid", [x], label);
  }

  backward(): void {
    // f = sigmoid(A)
    // df/dA = signmoid(A) * sigmoid(-A)
    const [A] = this.children;
    A.grad += sigmoid(-A.data) * sigmoid(A.data) * this.grad;
  }

  forward(): void {
    const [A] = this.children;
    this.data = sigmoid(this.data);
  }
}

function topological_ordering(from: Value) {
	const visited = new Set<Value>();
	const frontier: Value[] = [from];
	const topo: Value[] = [];

	while (frontier.length > 0) {
		const node = frontier.shift()!;
		if (!visited.has(node)) {
			visited.add(node);
			frontier.push(...node.children);
			topo.push(node);
		}
	}

	return topo.toReversed();
}

function backpropagation(topo: Value[]) {
	for (const node of topo.toReversed()) {
		node.backward();
	}
}

function forward_pass(topo: Value[]) {
	for (const node of topo) {
		node.forward();
	}
}

export class Function {
  result: Value;
  topo: Value[];
  inputs: Input[];
  
  constructor(result: Value, inputs: Input[]) {
    this.result = result;
    this.topo = topological_ordering(result);
    this.inputs = inputs;
  }

  read_x(): number[] {
    return this.inputs.map(i => i.data);
  }

  set_x(...args: number[]) {
    for (let i = 0; i < this.inputs.length; i++) {
      this.inputs[i].data = args[i];
    }
  }

  descend_by(shift: number[], rate = 1.0) {
    for (let i = 0; i < this.inputs.length; i++) {
      this.inputs[i].data -= shift[i] * rate;
    }
  }

  read_y(): number {
    return this.result.data;
  }

  read_grad_x(): number[] {
    return this.inputs.map(i => i.grad);
  }

  // calculate the value of the function
  fn(...args: number[]): number {
    this.set_x(...args);
    forward_pass(this.topo);
    return this.result.data;
  }

  grad(...args: number[]): number[] {
    this.fn(...args);
    this.result.grad = 1.0;
    backpropagation(this.topo);
    return this.inputs.map(i => i.grad);
  }
}

export class Function2D extends Function {
  x1: Value;
  x2: Value;
  y: Value;

  constructor(y: Value, x1: Value, x2: Value) {
    super(y, [x1, x2]);

    // for faster access
    this.x1 = x1;
    this.x2 = x2;
    this.y = y;
  }

  fn2d(v: Vec2D): number {
    return this.fn(v.x1, v.x2);
  }

  grad2d(v: Vec2D): Vec2D {
    const dy = this.grad(v.x1, v.x2);
    return {x1: dy[0], x2: dy[1]}
  }

  get_bound_fn2d() {
    return this.fn2d.bind(this);
  }

  get_bound_grad2d() {
    return this.grad2d.bind(this);
  }
}