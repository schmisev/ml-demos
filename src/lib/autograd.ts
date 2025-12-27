import type { EdgeDef, NodeDef } from './dagre-graph/hui-graphs';
import type { Vec2D } from './vector';

type ValueType =
	| 'in'
	| 'const'
	| 'relu'
	| 'sum'
	| 'sigmoid'
	| 'abs'
	| 'cos'
	| 'sin'
	| 'exp'
	| '^'
	| '+'
	| '*'
	| '-'
	| '/'
	| '~'
	| 'log';

abstract class Value {
	value: number;
	grad: number;
	children: Value[];
	type: ValueType;
	label?: string;
	abstract prec: number;
	id: number;
	static max_id: number = 0;

	constructor(value: number, type: ValueType = 'in', children: Value[] = [], label?: string) {
		this.value = value;
		this.grad = 0;
		this.children = children;
		this.label = label;
		this.type = type;
		this.id = Value.max_id++;
	}

	backward() {
		return; // this does nothing
	}

	forward() {
		this.grad = 0; // reset gradient
		return; // this does nothing
	}

	to_expr(mathjax = false, precedence: number = 0): string {
		if (!mathjax) {
			if (this.label) return this.label;
			if (this.children.length > 1)
				return this.children
					.map((v) => (v.prec < this.prec ? '(' + v.to_expr() + ')' : v.to_expr()))
					.join(this.type);
			if (this.children.length == 1) return this.type + '(' + this.children[0].to_expr() + ')';
			if (this.type === 'const') return '' + this.value;
		}

		let out = '';

		switch (this.type) {
			case 'in':
				out = this.label || `in(${this.value})`;
				break;
			case 'const':
				out = '' + this.value;
				break;
			case 'relu':
			case 'sigmoid':
				out = `\\sigma(${this.children[0].to_expr(mathjax, this.prec)})`;
				break;
			case 'cos':
			case 'sin':
			case 'exp':
			case 'log':
				out = `\\${this.type}(${this.children[0].to_expr(mathjax, this.prec)})`;
				break;
			case 'abs':
				out = `|${this.children[0].to_expr(mathjax, this.prec)}|`;
				break;
			case 'sum':
				out = `\\Sigma[${this.children.map((v) => v.to_expr(mathjax, this.prec)).join(', ')}]`;
				break;
			case '^': {
				const [base, expo] = this.children;
				out = `${base.to_expr(mathjax, this.prec)}^{${expo.to_expr(mathjax, this.prec)}}`;
				break;
			}
			case '+': {
				const [A, B] = this.children;
				out = `${A.to_expr(mathjax, this.prec)}+${B.to_expr(mathjax, this.prec)}`;
				break;
			}
			case '*': {
				const [A, B] = this.children;
				if (B.type === 'const') {
					out = `${B.to_expr(mathjax, this.prec)}${A.to_expr(mathjax, this.prec)}`;
					break;
				}
				out = `${A.to_expr(mathjax, this.prec)} \\cdot ${B.to_expr(mathjax, this.prec)}`;
				break;
			}
			case '-': {
				const [A, B] = this.children;
				out = `${A.to_expr(mathjax, this.prec)} - ${B.to_expr(mathjax, this.prec)}`;
				break;
			}
			case '/': {
				const [A, B] = this.children;
				out = `\\frac{${A.to_expr(mathjax, this.prec)}}{${B.to_expr(mathjax, this.prec)}}`;
				break;
			}
			case '~':
				out = `-${this.children[0].to_expr(mathjax, this.prec)}`;
				break;
			default:
				const NEVER: never = this.type;
		}

		if (precedence > this.prec) {
			return '(' + out + ')';
		} else {
			return out;
		}
	}

	listVals(depth = 0, index = 0): string {
		const val = `${this.to_expr()} = ${this.value.toFixed(4)} \t grad = ${this.grad.toFixed(4)} \n`;
		const deps = this.children.map((v, i) => v.listVals(++depth, i)).join('');
		return val + deps;
	}

	add(other: Value | number, label?: string) {
		if (typeof other === 'number') other = new Constant(other);
		return new AddNode(this, other, label);
	}

	mul(other: Value | number, label?: string) {
		if (typeof other === 'number') other = new Constant(other);
		return new MulNode(this, other, label);
	}

	sub(other: Value | number, label?: string) {
		if (typeof other === 'number') other = new Constant(other);
		return new SubNode(this, other, label);
	}

	div(other: Value | number, label?: string) {
		if (typeof other === 'number') other = new Constant(other);
		return new DivNode(this, other, label);
	}

	neg(label?: string) {
		return new NegNode(this, label);
	}

	pow(other: Value | number, label?: string) {
		if (typeof other === 'number') other = new Constant(other);
		return new PowNode(this, other, label);
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

	abs(label?: string) {
		return new AbsNode(this, label);
	}

	log(label?: string) {
		return new LogNode(this, label);
	}
}

// convenience class
export class Input extends Value {
	prec: number = 100;

	constructor(data: number, label?: string) {
		super(data, 'in', [], label);
	}
}

export class Constant extends Value {
	prec: number = 100;

	constructor(data: number, label?: string) {
		super(data, 'const', [], label);
	}
}

function sum_over_values(vals: Value[]) {
	let out = 0;
	for (const v of vals) {
		out += v.value;
	}
	return out;
}

//
class SumNode extends Value {
	prec: number = 5;

	constructor(vals: Value[], label?: string) {
		super(sum_over_values(vals), 'sum', vals, label);
	}

	backward(): void {
		const vals = this.children;
		for (const v of vals) {
			v.grad += 1.0 * this.grad;
		}
	}

	forward(): void {
		super.forward();
		const vals = this.children;
		this.value = sum_over_values(vals);
	}
}

export function sum(vals: Value[], label?: string) {
	return new SumNode(vals, label);
}

// calc classes
class AddNode extends Value {
	prec: number = 5;

	constructor(a: Value, b: Value, label?: string) {
		super(a.value + b.value, '+', [a, b], label);
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
		this.value = A.value + B.value;
	}
}

class SubNode extends Value {
	prec: number = 6;

	constructor(a: Value, b: Value, label?: string) {
		super(a.value - b.value, '-', [a, b], label);
	}

	backward(): void {
		// f = A-B
		// df/dA = 1
		// df/dB = -1
		const [A, B] = this.children;
		A.grad += 1.0 * this.grad;
		B.grad += -1.0 * this.grad; // TODO: check if this is right?
	}

	forward(): void {
		super.forward();
		const [A, B] = this.children;
		this.value = A.value - B.value;
	}
}

class MulNode extends Value {
	prec: number = 10;

	constructor(a: Value, b: Value, label?: string) {
		super(a.value * b.value, '*', [a, b], label);
	}

	backward(): void {
		// f = A*B
		// df/dA = B
		// df/dB = A
		const [A, B] = this.children;
		A.grad += B.value * this.grad;
		B.grad += A.value * this.grad;
	}

	forward(): void {
		super.forward();
		const [A, B] = this.children;
		this.value = A.value * B.value;
	}
}

class DivNode extends Value {
	prec: number = 11;

	constructor(a: Value, b: Value, label?: string) {
		super(a.value / b.value, '/', [a, b], label);
	}

	backward(): void {
		// f = A / B
		// df/dA = 1/B
		// df/dB = -A/B^2
		const [A, B] = this.children;
		A.grad += this.grad / B.value;
		B.grad += (-A.value / B.value ** 2) * this.grad;
	}

	forward(): void {
		super.forward();
		const [A, B] = this.children;
		this.value = A.value / B.value;
	}
}

class NegNode extends Value {
	prec: number = 1;

	constructor(x: Value, label?: string) {
		super(-x.value, '~', [x], label);
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
		this.value = -A.value;
	}
}

class PowNode extends Value {
	prec: number = 15;

	constructor(base: Value, expo: Value, label?: string) {
		super(base.value ** expo.value, '^', [base, expo], label);
	}

	backward(): void {
		// f = A^B
		// df/dA = B * A^(B-1)
		// df/dB = A^B * log(A)
		const [A, B] = this.children;
		A.grad += B.value * A.value ** (B.value - 1) * this.grad;
		B.grad += A.value ** B.value * Math.log(A.value);
	}

	forward(): void {
		super.forward();
		const [A, B] = this.children;
		this.value = A.value ** B.value;
	}
}

class SimpleFunctionNode extends Value {
	prec: number = 20;
}

class ExpNode extends SimpleFunctionNode {
	constructor(x: Value, label?: string) {
		super(Math.exp(x.value), 'exp', [x], label);
	}

	backward(): void {
		// f = exp(A)
		// df/dA = exp(A) = f
		const [A] = this.children;
		A.grad = this.grad * this.value;
	}

	forward(): void {
		super.forward();
		const [A] = this.children;
		this.value = Math.exp(A.value);
	}
}

class LogNode extends SimpleFunctionNode {
	constructor(x: Value, label?: string) {
		super(Math.log(x.value), 'log', [x], label);
	}

	backward(): void {
		// f = log(A)
		// df/dA = 1/A
		const [A] = this.children;
		A.grad = this.grad / A.value;
	}

	forward(): void {
		super.forward();
		const [A] = this.children;
		this.value = Math.log(A.value);
	}
}

class ReLUNode extends SimpleFunctionNode {
	constructor(x: Value, label?: string) {
		super(x.value > 0 ? x.value : 0, 'relu', [x], label);
	}

	backward(): void {
		// f = relu(A)
		// df/dA = {1 if A>0 else 0}
		const [A] = this.children;
		if (A.value > 0) A.grad += 1.0 * this.grad;
		else A.grad += 0.0;
	}

	forward(): void {
		super.forward();
		const [A] = this.children;
		this.value = A.value > 0 ? A.value : 0;
	}
}

class SinNode extends SimpleFunctionNode {
	constructor(x: Value, label?: string) {
		super(Math.sin(x.value), 'sin', [x], label);
	}

	backward(): void {
		// f = sin(A)
		// df/dA = cos(A)
		const [A] = this.children;
		A.grad += Math.cos(A.value) * this.grad;
	}

	forward(): void {
		super.forward();
		const [A] = this.children;
		this.value = Math.sin(A.value);
	}
}

class CosNode extends SimpleFunctionNode {
	constructor(x: Value, label?: string) {
		super(Math.exp(x.value), 'cos', [x], label);
	}

	backward(): void {
		// f = cos(A)
		// df/dA = -sin(A)
		const [A] = this.children;
		A.grad += -Math.sin(A.value) * this.grad;
	}

	forward(): void {
		super.forward();
		const [A] = this.children;
		this.value = Math.cos(A.value);
	}
}

class AbsNode extends SimpleFunctionNode {
	constructor(x: Value, label?: string) {
		super(Math.exp(x.value), 'abs', [x], label);
	}

	backward(): void {
		// f = |A|
		// df/dA = [-1, 0, 1]
		const [A] = this.children;
		A.grad += (A.value > 0 ? 1 : A.value == 0 ? 0 : -1) * this.grad;
	}

	forward(): void {
		super.forward();
		const [A] = this.children;
		this.value = Math.abs(A.value);
	}
}

function sigmoid(x: number) {
	return 1 / (1 + Math.exp(-x));
}

class SigmoidNode extends SimpleFunctionNode {
	constructor(x: Value, label?: string) {
		super(sigmoid(x.value), 'sigmoid', [x], label);
	}

	backward(): void {
		// f = sigmoid(A)
		// df/dA = signmoid(A) * sigmoid(-A)
		const [A] = this.children;
		A.grad += sigmoid(-A.value) * sigmoid(A.value) * this.grad;
	}

	forward(): void {
		const [A] = this.children;
		this.value = sigmoid(A.value);
	}
}

function topological_ordering(from: Value) {
	const visited = new Set<Value>();
	const topo: Value[] = [];

	function rec_topo(from: Value) {
		if (!visited.has(from)) {
			visited.add(from);
			for (const child of from.children) {
				rec_topo(child);
			}
			topo.push(from);
		}
	}

	rec_topo(from);

	return topo;
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
		return this.inputs.map((i) => i.value);
	}

	set_x(...args: number[]) {
		for (let i = 0; i < this.inputs.length; i++) {
			this.inputs[i].value = args[i];
		}
	}

	descend_by(shift: number[], rate = 1.0) {
		for (let i = 0; i < this.inputs.length; i++) {
			this.inputs[i].value -= shift[i] * rate;
		}
	}

	read_y(): number {
		return this.result.value;
	}

	read_grad_x(): number[] {
		return this.inputs.map((i) => i.grad);
	}

	// calculate the value of the function
	fn(...args: number[]): number {
		this.set_x(...args);
		forward_pass(this.topo);
		return this.result.value;
	}

	grad(...args: number[]): number[] {
		this.fn(...args);
		this.result.grad = 1.0;
		backpropagation(this.topo);
		return this.inputs.map((i) => i.grad);
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
		return { x1: dy[0], x2: dy[1] };
	}

	get_bound_fn2d() {
		return this.fn2d.bind(this);
	}

	get_bound_grad2d() {
		return this.grad2d.bind(this);
	}

	format_graph_for_mermaid(): string {
		const preamble = 'graph LR';
		const nodes: string[] = [];
		const conns: string[] = [];

		for (const val of this.topo) {
			let node_name = '';

			switch (val.type) {
				case 'in':
					node_name = `v${val.id}`;
					nodes.push(
						node_name +
							`["${val.label || node_name} = ${val.value.toFixed(3)} | #nabla; = ${val.grad.toFixed(3)}"]`
					);
					break;
				case 'const':
					node_name = `v${val.id}`;
					nodes.push(node_name + `["${val.value}"]`);
					break;
				case 'relu':
				case 'sum':
				case 'sigmoid':
				case 'abs':
				case 'cos':
				case 'sin':
				case 'exp':
				case '^':
				case '+':
				case '*':
				case '-':
				case '/':
				case '~':
				case 'log':
					node_name = `o${val.id}`;
					nodes.push(node_name + `(("${val.type}"))`);
					nodes.push(
						'v' + val.id + `(["${val.value.toFixed(3)} | #nabla; = ${val.grad.toFixed(3)}"])`
					);
					conns.push(`${node_name} --> v${val.id}`);
					break;
				default:
					const NEVER: never = val.type;
			}

			for (const child of val.children) {
				conns.push(`v${child.id} --> ${node_name}`);
			}
		}

		const out = preamble + '\n' + nodes.join('\n') + '\n' + conns.join('\n');
		return out;
	}

	format_graph_for_dagre(): { node_defs: NodeDef[]; edge_defs: EdgeDef[] } {
		const node_defs: NodeDef[] = [];
		const edge_defs: EdgeDef[] = [];

		for (const val of this.topo) {
			let name = '';
			let value = val.value.toFixed(3);
			let grad = val.grad.toFixed(3);
			let var_name = val.label ? `${val.label} = ` : ``;
			switch (val.type) {
				case 'in': {
					name = `v${val.id}`;
					node_defs.push({
						name,
						label: `<div><div>${var_name}<b>${value}</b></div><div class="border-t-2 bg-amber-300">&nabla; = ${grad}</div></div>`,
						cls: ['border-2', 'rounded-xl', 'min-w-30', 'overflow-clip', 'shiny-shadow'],
					});
					break;
				}
				case 'const': {
					name = `v${val.id}`;
					node_defs.push({
						name,
						label: `<div>${var_name}<b>${value}</b></div>`,
						cls: ['border-2', 'rounded-xl', 'min-w-30', 'overflow-clip', 'bg-gray-200', 'shiny-shadow'],
					});
					break;
				}
				case 'relu':
				case 'sum':
				case 'sigmoid':
				case 'abs':
				case 'cos':
				case 'sin':
				case 'exp':
				case '^':
				case '+':
				case '*':
				case '-':
				case '/':
				case '~':
				case 'log': {
					name = `o${val.id}`;
					let next_name = `v${val.id}`;
					node_defs.push({
						name: next_name,
						label: `<div>${var_name}<b>${value}</b></div><div class="border-t-2 bg-amber-100">&nabla; = ${grad}</div>`,
						cls: ['border-2', 'rounded-xl', 'min-w-30', 'overflow-clip', 'shiny-shadow'],
					});
					node_defs.push({
						name,
						label: `${val.type}`,
						cls: [
							'flex',
							'flex-row',
							'items-center',
							'justify-center',
							'border-2',
							'rounded-full',
							'min-w-9',
							'aspect-square',
							'overflow-clip',
							'bg-blue-200',
							'font-bold',
              'pl-2',
              'pr-2',
              'shiny-shadow'
						],
					});
					edge_defs.push({
						from: name,
						to: next_name,
						label: '',
						arrow_style: 'stroke-width: 4; stroke: oklch(0.4378 0.105 251.813)',
						arrow_start: 'dot',
					});
					break;
				}
				default:
					const NEVER: never = val.type;
			}

			for (const child of val.children) {
				edge_defs.push({
					from: `v${child.id}`,
					to: `${name}`,
					label: '',
					arrow_style: 'stroke-width: 2;',
          corner_radius: 50,
				});
			}
		}

		return {
			node_defs,
			edge_defs
		};
	}
}
