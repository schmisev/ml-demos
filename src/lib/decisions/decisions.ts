

export interface DecisionTable {
  state_probs: number[],
  state_labels: string[],
  action_labels: string[],
  table: number[][],
}

export function norm_probs(tb: DecisionTable) {
  const S = tb.state_probs.reduce((a, b) => a+b, 0);
  tb.state_probs = tb.state_probs.map(v => v / S);
}

export function make_risky(tb: DecisionTable): DecisionTable {
  let table: number[][] = [];

  const max_action_per_state: number[] = [];
  for (let state_id = 0; state_id < tb.state_labels.length; state_id++) {
    const actions = actions_of_state(tb, state_id);
    const {val, arg} = max(actions);
    max_action_per_state.push(val);
  }

  for (const [action_id, states] of tb.table.entries()) {
    table.push([]);
    for (const [state_id, payoff] of states.entries()) {
      table[action_id].push(max_action_per_state[state_id] - payoff);
    }
  }
  
  return {
    state_probs: [...tb.state_probs],
    action_labels: [...tb.action_labels],
    state_labels: [...tb.state_labels],
    table
  }
}

export interface LabledData {
  labels: string[],
  data: number[]
}

export function assert_dec_table(tb: DecisionTable) {
  const n = tb.state_labels.length;
  const m = tb.action_labels.length;

  if (tb.table.length !== m) throw `Expected ${m} actions, got ${tb.table.length}`;
  if (m === 0) throw `Decision table is empty!`;

  for (const states of tb.table) {
    if (m === 0) throw `Decision table is empty!`;
    if (states.length !== n) throw `Expected ${n} states, got ${states.length}`;
  }
}

export function actions_of_state(tb: DecisionTable, state_id: number): number[] {
  return tb.table.map(states => states[state_id]);
}

export function states_of_action(tb: DecisionTable, action_id: number): number[] {
  return tb.table[action_id];
}

export function max(list: number[]): { arg: number, val: number } {
  let maxval = -Infinity;
  let argmax = -1;
  for (const [i, v] of list.entries()) {
    if (v >= maxval) {
      maxval = v;
      argmax = i;
    }
  }
  return {val: maxval, arg: argmax};
}

export function avg(list: number[]): { arg: number, val: number } {
  return {val: list.reduce((a, b) => a+b, 0) / list.length, arg: -1};
}

export function min(list: number[]): { arg: number, val: number } {
  let minval = Infinity;
  let argmin = -1;
  for (const [i, v] of list.entries()) {
    if (v <= minval) {
      minval = v;
      argmin = i;
    }
  }
  return {val: minval, arg: argmin};
}

export function realism(alpha: number, list: number[]): { arg: number, val: number } {
  return { val: Math.max(...list) * alpha + Math.min(...list) * (1-alpha), arg: -1 }
}

export function weighted(weights: number[], list: number[]): { arg: number, val: number } {
  return { val: weights.map((w, i) => w * list[i]).reduce((a, b) => a+b, 0), arg: -1 }
}

export function strategy(
  tb: DecisionTable,
  better: (a: number, b: number) => boolean,
  better_or_equal: (a: number, b: number) => boolean,
  agg: (list: number[]) => {arg: number, val: number},
): { best_states: number[], best_actions: number[]; best_payoff: number; } {
  let best_actions = [-1];
  let best_states = [-1];
  let best_payoff = better(Infinity, -Infinity) ? -Infinity : Infinity;
  
  for (const [action_id, states] of tb.table.entries()) {
    const {arg, val} = agg(states);
    if (better(val, best_payoff)) {
      best_actions = [];
      best_states = [];
    }
    if (better_or_equal(val, best_payoff)) {
      best_payoff = val;
      best_actions.push(action_id);
      best_states.push(arg);
    }
  }

  return { best_actions, best_states, best_payoff }
}

export function caution(tb: DecisionTable) {
  return strategy(tb, (a, b) => a > b, (a, b) => a >= b, min);
}

export function full_risk(tb: DecisionTable) {
  return strategy(tb, (a, b) => a > b, (a, b) => a >= b, max);
}

export function laplace(tb: DecisionTable) {
  return strategy(tb, (a, b) => a > b, (a, b) => a >= b, avg);
}

export function hurwicz(tb: DecisionTable, alpha: number) {
  return strategy(tb, (a, b) => a > b, (a, b) => a >= b, (list) => realism(alpha, list));
}

export function emv(tb: DecisionTable) {
  return strategy(tb, (a, b) => a > b, (a, b) => a >= b, (list) => weighted(tb.state_probs, list));
}

export function alternative_caution(tb: DecisionTable) {
  return strategy(tb, (a, b) => a < b, (a, b) => a <= b, max);
}