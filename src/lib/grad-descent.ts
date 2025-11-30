import { vadd, vlendiff, vscale, vsub, vv, type Vector2 } from "./vector";

export type ObjectiveFunction = (v: Vector2) => number;
export type ObjectiveGradient = (v: Vector2) => Vector2;

export abstract class Descenter {
  tau: number;
  gamma: number;
  epsilon: number;

  step_points: Vector2[];
  moments: Vector2[];

  steps: number = 0;
  max_steps: number = 50;

  init_point: Vector2;

  fn: ObjectiveFunction;
  grad: ObjectiveGradient;

  p_curr: Vector2 = vv();
  g: Vector2 = vv();
  m_curr: Vector2 = vv();
  m_last: Vector2 = vv();

  constructor(fn: ObjectiveFunction, grad: ObjectiveGradient, init_point: Vector2, tau: number, gamma: number, epsilon: number, max_steps: number) {
    this.fn = fn;
    this.grad = grad;
    
    this.tau = tau;
    this.gamma = gamma;
    this.epsilon = epsilon;
    this.max_steps = max_steps;

    this.init_point = init_point;
    this.step_points = [init_point];
    this.moments = [vv()];
  }

  clear(init_point: Vector2) {
    this.init_point = init_point;
    this.step_points = [this.init_point];
    this.moments = [vv()];
    this.steps = 0;
  }

  step() {
    if (this.steps >= this.max_steps) return;

    this._step();

    this.steps++;
  }

  last() {
    return this.step_points.at(-1) || vv();
  }

  abstract _step(): Vector2;
}


export class GradientDescenter extends Descenter {
  _step(): Vector2 {
    this.p_curr = this.last();
    this.g = this.grad(this.p_curr);
    this.m_last = this.m_curr;
    this.m_curr = vadd(vscale(this.g, this.tau), vscale(this.m_last, this.gamma));
    this.p_curr = vsub(this.p_curr, this.m_curr);
    this.step_points.push(this.p_curr);

    return this.p_curr;
  }
}