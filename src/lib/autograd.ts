type ValueType = 'in' | 'const' | 'relu' | '^' | '+' | '*' | '-' | '/' | '~';

class Value {
	data: number;
	grad: number;
	children: Value[];
	type: ValueType;
	label?: string;

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

	toExpr(): string {
		if (this.label) return this.label;
		if (this.children.length > 1)
			return '(' + this.children.map((v) => v.toExpr()).join(this.type) + ')';
		if (this.children.length == 1) return this.type + this.children[0].toExpr();
		return '???';
	}

	listVals(depth = 0, index = 0): string {
		const val = `${this.toExpr()} = ${this.data.toFixed(4)} \t grad = ${this.grad.toFixed(4)} \n`;
		const deps = [...this.children].map((v, i) => v.listVals(++depth, i)).join('');
		return val + deps;
	}

	add(other: Value | number, label?: string) {
    if (typeof other === "number") other = new Constant(other);
		return new AddNode(this.data + other.data, '+', [this, other], label);
	}

	mul(other: Value, label?: string) {
		return new MulNode(this.data * other.data, '*', [this, other], label);
	}

	sub(other: Value, label?: string) {
		return new SubNode(this.data - other.data, '-', [this, other], label);
	}

	div(other: Value, label?: string) {
		return new DivNode(this.data / other.data, '/', [this, other], label);
	}

	neg(label?: string) {
		return new NegNode(-this.data, '~', [this], label);
	}

  pow(exp: number, label?: string) {
    return new PowNode(this.data ** exp, exp, [this], label);
  }

	relu(label?: string) {
		return new ReLUNode(this.data > 0 ? this.data : 0, 'relu', [this], label);
	}
}

// convenience class
class Input extends Value {
	constructor(data: number, label?: string) {
		super(data, 'in', [], label);
	}
}

class Constant extends Value {
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
}

class DivNode extends Value {
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
}

class NegNode extends Value {
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
}

class PowNode extends Value {
  exp: number;
  
  constructor(data: number, exp: number, children: Value[] = [], label?: string) {
    super(data, "^", children, label);
    this.exp = exp;
  }

	backward(): void {
		// f = A^exp
		// df/dA = exp * A^(exp-1)
		const [A] = this.children;
		A.grad += this.exp * A.data ** (this.exp-1);
	}

	forward(): void {
		super.forward();
		const [A] = this.children;
		this.data = A.data ** this.exp;
	}

  toExpr(): string {
    return `${this.children[0].toExpr()}^${this.exp}`
  }
}

class ReLUNode extends Value {
	backward(): void {
		// f = relu(A)
		// df/dA = {1 if A>0 else 0}
		const [A] = this.children;
		if (A.data > 0) A.grad = 1.0 * this.grad;
		else A.grad += 0.0;
	}

	forward(): void {
		super.forward();
		const [A] = this.children;
		this.data = A.data > 0 ? A.data : 0;
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

class AutogradFunction {
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

  shift_x(shift: number[], rate = 1.0) {
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
    for (let i = 0; i < this.inputs.length; i++) {
      this.inputs[i].data = args[i];
    }
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

// testing
const a = new Input(2.0, 'a');
const b = new Input(-3.0, 'b');
const f = a.pow(2).add(b.add(-2).pow(2));

const F = new AutogradFunction(f, [a, b])

const tau = 0.1;

for (let epoch = 0; epoch < 50; epoch++) {
	const grad = F.grad(...F.read_x());
  console.log(F.result.listVals())
  F.shift_x(grad,  tau);
}
