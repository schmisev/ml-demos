import {
	vadd,
	vdiv,
	vinvscale,
	vlen,
	vdist,
	vdist2,
	vmul,
	vscale,
	vsqrt,
	vsub,
	vv,
	type Vec2D
} from './vector';

export type ObjectiveFunction = (v: Vec2D) => number;
export type ObjectiveGradient = (v: Vec2D) => Vec2D;

export abstract class Descenter {
	tau: number = $state(0.1); // learning rate
	gamma: number = $state(0.5);
	epsilon: number = $state(1e-8);
	beta_1: number = $state(0.9);
	beta_2: number = $state(0.999);

	step_points: Vec2D[];
	moments: Vec2D[];
	second_moments: Vec2D[];

	t: number = $state(0);
	t_max: number = 50;

	init_point: Vec2D;

	fn: ObjectiveFunction;
	grad: ObjectiveGradient;

	p_curr: Vec2D = $state(vv());
	grad_curr: Vec2D = $state(vv(Infinity));
	m_curr: Vec2D = $state(vv());
	m_last: Vec2D = $state(vv());

	v_curr: Vec2D = $state(vv());
	v_last: Vec2D = $state(vv());

	constructor(
		fn: ObjectiveFunction,
		grad: ObjectiveGradient,
		init_point: Vec2D,
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

	clear(init_point: Vec2D) {
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
		this.grad_curr = this.grad(this.p_curr);
		this.m_last = this.m_curr;
		this.v_last = this.v_curr;
	}

	step() {
		console.log('step', this.t);
		if (vlen(this.grad_curr) < this.epsilon) return;
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

	abstract _step(): Vec2D;
}

export class GradientDescenter extends Descenter {
	_step(): Vec2D {
		this.m_curr = vv(); // we dont use momentum
		this.p_curr = vsub(this.p_curr, vscale(this.grad_curr, this.tau));

		return this.p_curr;
	}
}

export class MomentumGradientDescenter extends Descenter {
	_step(): Vec2D {
		this.m_curr = vadd(vscale(this.grad_curr, this.tau), vscale(this.m_last, this.gamma));
		this.p_curr = vsub(this.p_curr, this.m_curr);

		return this.p_curr;
	}
}

export class AdamGradientDescenter extends Descenter {
	_step(): Vec2D {
    this.m_curr = vadd(vscale(this.m_last, this.beta_1), vscale(this.grad_curr, 1 - this.beta_1))
		const m_hat = vinvscale(
			this.m_curr,
			1 - this.beta_1 ** (this.t+1)
		);

		this.v_curr = vadd(vscale(this.v_last, this.beta_2), vscale(vmul(this.grad_curr, this.grad_curr), 1 - this.beta_2))
    const v_hat = vinvscale(
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
