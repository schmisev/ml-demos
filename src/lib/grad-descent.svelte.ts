import {
	vadd,
	vdiv,
	viscale,
	vlen,
	vlendiff,
	vlendiff2,
	vmul,
	vscale,
	vsqrt,
	vsub,
	vv,
	type Vector2
} from './vector';

export type ObjectiveFunction = (v: Vector2) => number;
export type ObjectiveGradient = (v: Vector2) => Vector2;

export abstract class Descenter {
	tau: number = $state(0.1); // learning rate
	gamma: number = $state(0.5);
	epsilon: number = $state(1e-8);
	beta_1: number = $state(0.9);
	beta_2: number = $state(0.999);

	step_points: Vector2[];
	moments: Vector2[];
	second_moments: Vector2[];

	t: number = $state(0);
	t_max: number = 50;

	init_point: Vector2;

	fn: ObjectiveFunction;
	grad: ObjectiveGradient;

	p_curr: Vector2 = $state(vv());
	g: Vector2 = $state(vv(Infinity));
	m_curr: Vector2 = $state(vv());
	m_last: Vector2 = $state(vv());

	v_curr: Vector2 = $state(vv());
	v_last: Vector2 = $state(vv());

	constructor(
		fn: ObjectiveFunction,
		grad: ObjectiveGradient,
		init_point: Vector2,
		max_steps: number
	) {
		this.fn = fn;
		this.grad = grad;

		this.t_max = max_steps;

		this.init_point = init_point;
		this.step_points = [init_point];
		this.moments = [vv()];
		this.second_moments = [vv()];

		// do first prestep, so the right values will show up in the UI
		this.prestep();
	}

	clear(init_point: Vector2) {
		this.init_point = init_point;
		this.step_points = [this.init_point];
		this.moments = [vv()];
		this.second_moments = [vv()];

		this.m_curr = vv();
		this.v_curr = vv();

		this.t = 0;

		this.prestep();
	}

	prestep() {
		this.p_curr = this.last();
		this.g = this.grad(this.p_curr);
		this.m_last = this.m_curr;
		this.v_last = this.v_curr;
	}

	step() {
		console.log('step', this.t);
		if (vlen(this.g) < this.epsilon) return;
		if (this.t >= this.t_max) return;

		this._step();

		this.step_points.push(this.p_curr);

		this.t++;

		// do prestep for next step
		this.prestep();
	}

	last() {
		return this.step_points.at(-1) || vv();
	}

	abstract _step(): Vector2;
}

export class GradientDescenter extends Descenter {
	_step(): Vector2 {
		this.m_curr = vv(); // we dont use momentum
		this.p_curr = vsub(this.p_curr, vscale(this.g, this.tau));

		return this.p_curr;
	}
}

export class MomentumGradientDescenter extends Descenter {
	_step(): Vector2 {
		this.m_curr = vadd(vscale(this.g, this.tau), vscale(this.m_last, this.gamma));
		this.p_curr = vsub(this.p_curr, this.m_curr);

		return this.p_curr;
	}
}

export class AdamGradientDescenter extends Descenter {
	_step(): Vector2 {
    this.m_curr = vadd(vscale(this.m_last, this.beta_1), vscale(this.g, 1 - this.beta_1))
		const m_hat = viscale(
			this.m_curr,
			1 - this.beta_1 ** (this.t+1)
		);

		this.v_curr = vadd(vscale(this.v_last, this.beta_2), vscale(vmul(this.g, this.g), 1 - this.beta_2))
    const v_hat = viscale(
			this.v_curr,
			1 - this.beta_2 ** (this.t+1)
		);

		this.p_curr = vsub(
			this.p_curr,
			vscale(vdiv(m_hat, vsqrt(vadd(v_hat, vv(this.epsilon)))), this.tau)
		);

		return this.p_curr;
	}
}
