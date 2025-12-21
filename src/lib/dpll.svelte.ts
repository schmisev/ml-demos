import { clause, type CNF } from './resolution';
import { choice } from '$lib';

export enum DPLL_Result {
  SUCCESS = "SUCCESS",
  UNDECIDED = "UNDECIDED",
  FAILURE = "FAILURE"
}

export class DPLL {
  init_asg: number[];
  init_cnf: CNF;

  asg_stack: number[][] = $state([]);
  cnf_stack: CNF[] = $state([]);
  t: number = $state(0);

  current_asg: number[] = $state([]);
  asg_history: number[][] = $state([]);
  current_cnf: CNF = $state({kind: "CNF", clauses: []});

  last_result: DPLL_Result = $state(DPLL_Result.UNDECIDED);

  constructor(init_cnf: CNF, init_asg: number[]) {
    this.init_asg = init_asg;
    this.init_cnf = init_cnf;

    this.current_cnf = init_cnf;
    
    this.asg_stack.push(init_asg);
    this.cnf_stack.push(init_cnf);
  }

  reset() {
    this.last_result = DPLL_Result.UNDECIDED;
    this.t = 0;
    this.asg_stack = [this.init_asg];
    this.cnf_stack = [this.init_cnf];
    this.current_asg = this.init_asg;
    this.current_cnf = this.init_cnf;
    this.asg_history = [];
  }

  step(): DPLL_Result {
    if (this.last_result !== DPLL_Result.UNDECIDED) return this.last_result;
    const res = this._step();
    this.last_result = res;
    this.t++;
    return this.last_result;
  }

  _step(): DPLL_Result {
    if (this.cnf_stack.length <= 0 || this.asg_stack.length <= 0) return DPLL_Result.FAILURE;

    this.current_asg = this.asg_stack.pop()!;
    this.current_cnf = this.cnf_stack.pop()!;

    let clauses = [...this.current_cnf.clauses];
    let asg_diff: number[] = [];
    
    while (true) {
      clauses.sort((a, b) => a.size - b.size);
     
      const first_multi = clauses.findIndex((a) => a.size > 1);
      
      let units: Set<number>[];
      if (first_multi === -1) {
        units = clauses;
        clauses = [];
      } else {
        units = clauses.splice(0, first_multi);
      }

      if (units.length === 0) break;

      while (units.length > 0) {
        const cl = units.pop()!;
        if (cl.size == 0) {
          this.asg_history.pop(); // asg failed -- remove it from history!
          return DPLL_Result.UNDECIDED; // couldn't be satisfied!
        }
        // this is a unit clause
        const lit = choice(cl);
        units = unit_propagate(lit, units);
        clauses = unit_propagate(lit, clauses);
        asg_diff.push(lit);
      }
    }

    this.current_asg.push(...asg_diff);
    this.asg_history.push(asg_diff);

    if (clauses.length === 0) {
      this.current_cnf = {kind: "CNF", clauses: [...clauses]};
      this.current_asg = [...this.current_asg];
      return DPLL_Result.SUCCESS; // SATISFIED!
    }

    // choose next literal
	  let next_literal: number = unit_choose_literal(clauses);

    this.cnf_stack.push({ kind: 'CNF', clauses: [clause(next_literal), ...clauses] });
    this.asg_stack.push([...this.current_asg]);

    this.cnf_stack.push({ kind: 'CNF', clauses: [clause(-next_literal), ...clauses] });
    this.asg_stack.push([...this.current_asg]);

    return DPLL_Result.UNDECIDED;
  }
}


/**
 * Recursive implementaion of DPLL
 * @param cnf 
 * @param asg 
 * @returns 
 */
export function dpll(cnf: CNF, asg: number[]): { result: boolean; asg: number[] } {
	let clauses = [...cnf.clauses];

	unit_check: while (true) {
		for (const cl of clauses) {
			if (cl.size == 1) {
				// this is a unit clause
				const lit = [...cl][0];
				clauses = unit_propagate(lit, clauses);
				asg.push(lit);
				continue unit_check;
			}
			if (cl.size == 0) return { result: false, asg }; // can't be satisfied!
		}
		break;
	}

	if (clauses.length === 0) return { result: true, asg }; // SATISFIED!

	// choose next literal
	let next_literal: number = unit_choose_literal(clauses);

	// short circuiting
	const first_try = dpll({ kind: 'CNF', clauses: [clause(next_literal), ...clauses] }, [...asg]);
	if (first_try.result) return first_try;

	const second_try = dpll({ kind: 'CNF', clauses: [clause(-next_literal), ...clauses] }, [...asg]);
	return second_try;
}

export function unit_choose_literal(clauses: Set<number>[]) {
	for (const cl of clauses) {
		for (const lit of cl) {
			return lit;
		}
	}
	return 0;
}

export function unit_propagate(unit: number, clauses: Set<number>[]) {
	const new_clauses: Set<number>[] = [];

	for (const cl of clauses) {
		if (cl.has(unit)) {
			// remove satisfied clause
			continue;
		} else if (cl.has(-unit)) {
			// remove false literals
			const new_cl = new Set(cl);
			new_cl.delete(-unit);
			new_clauses.push(new_cl);
		} else {
			new_clauses.push(new Set(cl));
		}
	}

	return new_clauses;
}


export function split_assigment(asg: number[]): {pos_asg: number[], neg_asg: number[]} {
  const res = {
    pos_asg: new Array<number>(),
    neg_asg: new Array<number>()
  }
  for (const id of asg) {
    if (id > 0) res.pos_asg.push(id);
    if (id < 0) res.neg_asg.push(id);
  }

  return res;
}