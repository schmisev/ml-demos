export type SAT_Assignment = Record<string, number | undefined>;
export type SAT_Domain = Record<string, number[]>;
export type SAT_Constraint = SAT_BinaryConstraint;
export type SAT_Variable = "<no variable>" | string;

export interface SAT_BinaryConstraint {
	vars: string[];
	op: '=' | '≠' | "<" | "⊻" | "+";
}

enum SAT_Result {
	FAILURE,
	UNDECIDED,
	SUCCESS
}

function cut_out_value(arr: number[], value: number) {
	const i = arr.indexOf(value);
	if (i < 0) return [];
	return arr.splice(i, 1);
}

function copy_dom(dom: SAT_Domain): SAT_Domain {
	return JSON.parse(JSON.stringify(dom));
}

// checking values pairwise
function check_constraint(cstr: SAT_Constraint, asg: SAT_Assignment): SAT_Result {
	let undecided = false;
  switch (cstr.op) {
    case "=":
    case "≠":
    case "<":
      break;
    case "⊻":
    case "+":
      let over_zero_count = 0;
      let undecided_count = 0;
      for (const v of cstr.vars) {
        if (asg[v] === undefined) undecided_count++;
        else if (asg[v] > 0) over_zero_count++;
      }
      if (over_zero_count > 1) return SAT_Result.FAILURE;
      if (undecided_count > 0) return SAT_Result.UNDECIDED;
      if (cstr.op === "⊻" && over_zero_count !== 1) return SAT_Result.FAILURE;
      return SAT_Result.SUCCESS;
  }

  for (const [i, v1] of cstr.vars.entries()) {
    for (const [j, v2] of cstr.vars.entries()) {
      const A = asg[v1];
      const B = asg[v2];

      if (A === undefined || B === undefined) {
        undecided = true;
        continue; // skip undefined values
      }

      if (i >= j) continue; // skip greater < lesser

      switch (cstr.op) {
        case '=':
          if (A !== B) return SAT_Result.FAILURE;
          break;
        case '≠':
          if (A === B) return SAT_Result.FAILURE;
          break;
        case "<":
          if (A >= B) return SAT_Result.FAILURE;
          break;
        default:
          const NEVER: never = cstr.op;
      }
    }
  }

	return undecided ? SAT_Result.UNDECIDED : SAT_Result.SUCCESS;
}

export interface SAT_Problem {
  name: string;
	init_asg: SAT_Assignment;
	init_domains: SAT_Domain;
	constraints: SAT_Constraint[];
}

export function show(o: any) {
	return JSON.stringify(o);
}

export class SAT_Solver {
	steps = $state(0);
	csp: SAT_Problem;

	// these stacks represent the current search
	assignments = $state<SAT_Assignment[]>([]);
	domains = $state<SAT_Domain[]>([]);
	rejected = $state<SAT_Assignment[]>([]);
	rejected_domains = $state<SAT_Domain[]>([]);

	current_asg = $state<SAT_Assignment>();
	current_dom = $state<SAT_Domain>();

  current_variable: SAT_Variable = $state("<no variable>");
  choice_values = $state<number[]>([]);

	constructor(csp: SAT_Problem) {
		this.csp = csp;

		this.assignments = [{ ...csp.init_asg }];
		this.domains = [{ ...csp.init_domains }];
	}

	reject(asg: SAT_Assignment, dom: SAT_Domain) {
		this.rejected.push(asg);
		this.rejected_domains.push(dom);
	}

	push(asg: SAT_Assignment, dom: SAT_Domain) {
		this.assignments.push(asg);
		this.domains.push(dom);
	}

	pop(): [SAT_Assignment, SAT_Domain] {
		return [this.assignments.pop()!, this.domains.pop()!];
	}

	step() {
    this.current_variable = "<no variable>";
    this.choice_values = [];

		if (this.current_asg && this.check_all_constraints(this.current_asg) === SAT_Result.SUCCESS)
			return SAT_Result.SUCCESS;
		if (this.assignments.length === 0) return SAT_Result.FAILURE;

    [this.current_asg, this.current_dom] = this.pop();
    const res = this.check_all_constraints(this.current_asg);
    switch (res) {
      case SAT_Result.FAILURE:
        this.reject(this.current_asg, this.current_dom);
        return SAT_Result.UNDECIDED; // this branch is DEAD --> we should never have gone here!
      case SAT_Result.SUCCESS:
        return SAT_Result.SUCCESS;
      case SAT_Result.UNDECIDED:
        break; // checkout more options
    }
    
		if (this.steps === 0) {
			this.current_variable = this.select_first_unassigned_candidate(this.current_asg, this.current_dom);
		} else {
			this.current_variable = this.select_unassigned_candidate(this.current_asg, this.current_dom);
		}
    this.choice_values = this.order_domain_values(this.current_variable, this.current_asg, this.current_dom);
    
    const variable = this.current_variable;
		for (const value of this.choice_values) {
			const new_asg = { ...this.current_asg };
			const new_dom = copy_dom(this.current_dom);
			new_asg[variable] = value; // add { variable = value } to assignment
			new_dom[variable] = [value]; // narrow domain

			const infs = this.inference(new_asg, new_dom, variable, value);
			switch (infs) {
				case SAT_Result.FAILURE:
					this.reject(new_asg, new_dom);
					break; // do not add to options
				case SAT_Result.UNDECIDED:
				case SAT_Result.SUCCESS:
					// we could do an early out here, but then it wouldn't be truly depth first
					// add value to stack
					this.push(new_asg, new_dom);
					break;
				// // found solution by chance
				// this.current_asg = new_asg;
				// this.current_dom = new_dom;
				// return SAT_Result.SUCCESS;
			}
		}

		this.steps += 1;
		return SAT_Result.UNDECIDED;
	}

	// directly edits assignments & domain
	inference(asg: SAT_Assignment, dom: SAT_Domain, variable: string, value: number) {
		return this.restrict_domains(asg, dom, variable, value);
	}

  restrict_domains(asg: SAT_Assignment, dom: SAT_Domain, changed_variable: string, set_value: number) {
		for (const constraint of this.csp.constraints) {
			if (constraint.vars.includes(changed_variable)) {
        const variable_index = constraint.vars.indexOf(changed_variable);
				// the new variable is involved in the constraint
				for (const [ci, cvar] of constraint.vars.entries()) {
					if (cvar === changed_variable) continue;
					switch (constraint.op) {
						case '=':
							// values must be equal
							if (!dom[cvar].includes(set_value)) return SAT_Result.FAILURE;
							dom[cvar] = [set_value];
							asg[cvar] = set_value;
							break;
						case '≠':
              // values must be unequal
							if (asg[cvar] === set_value) return SAT_Result.FAILURE;
							cut_out_value(dom[cvar], set_value);
							if (dom[cvar].length <= 0) return SAT_Result.FAILURE;
							if (dom[cvar].length === 1) asg[cvar] = dom[cvar][0];
							break;
            case "<":
              // first value must be smaller or equal to second
              if (variable_index <= ci) {
                // cvar should be bigger than set value
                for (let i = 0; i < dom[cvar].length;) {
                  const cval = dom[cvar][i];
                  if (cval < set_value) dom[cvar].splice(i, 1);
                  else i++;
                }
              } else {
                // cvar should be smaller than set value
                for (let i = 0; i < dom[cvar].length;) {
                  const cval = dom[cvar][i];
                  if (cval > set_value) dom[cvar].splice(i, 1);
                  else i++;
                }
              }
              break;
            case "⊻":
            case "+":
              if (set_value > 0) {
                // we can discard all values greater 0 from dom
                for (let i = 0; i < dom[cvar].length;) {
                  const cval = dom[cvar][i];
                  if (cval > 0) dom[cvar].splice(i, 1);
                  else i++;
                }
                if (dom[cvar].length <= 0) return SAT_Result.FAILURE;
                if (dom[cvar].length === 1) asg[cvar] = dom[cvar][0];
              }
              break;
            default:
              const NEVER: never = constraint.op;
					}
				}
			}
		}
		return this.check_all_constraints(asg);
	}

  neighborhood_domain_size(variable: string, dom: SAT_Domain): number {
    let n = 0;
    for (const c of this.csp.constraints) {
      if (c.vars.includes(variable)) {
        for (const v of c.vars) {
          if (v === variable) continue;
          n += dom[v].length;
        }
      }
    }
    return n;
  }

	select_first_unassigned_candidate(fallback_asg: SAT_Assignment, fallback_dom: SAT_Domain): string {
		let variable_candidate: string | undefined = undefined;
		let number_of_constraints: number = 0;

		for (const v in this.csp.init_asg) {
			let n = 0;
			for (const c of this.csp.constraints) {
				if (c.vars.includes(v)) n++;
			}
			if (n > number_of_constraints) {
				number_of_constraints = n;
				variable_candidate = v;
			}
		}
		if (variable_candidate !== undefined) return variable_candidate;
		return this.select_unassigned_candidate(fallback_asg, fallback_dom);
	}

	select_unassigned_candidate(asg: SAT_Assignment, dom: SAT_Domain): string {
		let variable_candidate: string | undefined = undefined;
		let remaining_values = Infinity;
		// select for minimum remaining values
		for (const v in asg) {
			const r = dom[v].length;
			if (asg[v] === undefined && r < remaining_values) {
				remaining_values = r;
				variable_candidate = v;
			}
		}
		if (variable_candidate !== undefined) return variable_candidate;
		throw `No unassigned variable!`;
	}

	order_domain_values(variable: string, asg: SAT_Assignment, dom: SAT_Domain) {
		const dom_sizes_for_value: Record<number, number> = {};
    for (const value of dom[variable]) {
      const new_dom = copy_dom(dom);
      const new_asg = { ...asg };
      this.restrict_domains(new_asg, new_dom, variable, value);
      const size = this.neighborhood_domain_size(variable, new_dom);
      dom_sizes_for_value[value] = size;
		}

    const sorted_values = dom[variable].toSorted((a, b) => dom_sizes_for_value[a] - dom_sizes_for_value[b]);
    return sorted_values;
	}

	check_all_constraints(asg: SAT_Assignment): SAT_Result {
		let undecided = false;
		for (const cstr of this.csp.constraints) {
			const res = check_constraint(cstr, asg);
			switch (res) {
				case SAT_Result.FAILURE:
					return res;
				case SAT_Result.UNDECIDED:
					undecided = true;
					break;
				case SAT_Result.SUCCESS:
					break;
			}
		}
		if (!this.is_complete(asg) || undecided) return SAT_Result.UNDECIDED;
		return SAT_Result.SUCCESS;
	}

	is_complete(asg: SAT_Assignment): boolean {
		for (const variable in asg) {
			if (asg[variable] === undefined) return false;
		}
		return true;
	}
}

// setting up a simple problem
export const SIMPLE_PROBLEM: SAT_Problem = {
  name: "simple-problem",
	init_asg: {
		a: undefined,
		b: undefined,
		c: undefined,
		d: undefined
	},
	init_domains: {
		a: [0, 1],
		b: [0, 1],
		c: [0, 1],
		d: [0, 1]
	},
	constraints: [
		{ vars: ['a', 'b'], op: '≠' },
		{ vars: ['b', 'c'], op: '≠' },
		{ vars: ['c', 'd'], op: '≠' },
		{ vars: ['d', 'a'], op: '≠' }
	],
};

export const AUSTRALIA_PROBLEM: SAT_Problem = {
	name: "australia",
  init_asg: {
		WA: undefined,
		NT: undefined,
		V: undefined,
		T: undefined,
		SA: undefined,
		Q: undefined,
		NSW: undefined
	},
	init_domains: {
		WA: [1, 2, 3],
		NT: [1, 2, 3],
		V: [1, 2, 3],
		T: [1, 2, 3],
		SA: [1, 2, 3],
		Q: [1, 2, 3],
		NSW: [1, 2, 3]
	},
	constraints: [
    { vars: ['WA', 'NT'], op: '≠' },
		{ vars: ['WA', 'SA'], op: '≠' },
		{ vars: ['NT', 'Q'], op: '≠' },
		{ vars: ['NT', 'SA'], op: '≠' },
		{ vars: ['SA', 'Q'], op: '≠' },
		{ vars: ['SA', 'NSW'], op: '≠' },
		{ vars: ['SA', 'V'], op: '≠' },
		{ vars: ['Q', 'NSW'], op: '≠' }
	],
};

export const SUDOKU_PUZZLE: SAT_Problem = {
	name: "4x4 sudoku",
  init_asg: {
    F11: undefined,
    F12: undefined,
    F13: undefined,
    F14: 3,
    F21: undefined,
    F22: 2,
    F23: undefined,
    F24: undefined,
    F31: undefined,
    F32: undefined,
    F33: 3,
    F34: 2,
    F41: undefined,
    F42: undefined,
    F43: undefined,
    F44: undefined,
	},
	init_domains: {
    F11: [1, 2, 3, 4],
    F12: [1, 2, 3, 4],
    F13: [1, 2, 3, 4],
    F14: [3],
    F21: [1, 2, 3, 4],
    F22: [2],
    F23: [1, 2, 3, 4],
    F24: [1, 2, 3, 4],
    F31: [1, 2, 3, 4],
    F32: [1, 2, 3, 4],
    F33: [3],
    F34: [2],
    F41: [1, 2, 3, 4],
    F42: [1, 2, 3, 4],
    F43: [1, 2, 3, 4],
    F44: [1, 2, 3, 4],
	},
	constraints: [
    { vars: ["F11", "F12", "F13", "F14"], op: "≠" },
    { vars: ["F21", "F22", "F23", "F24"], op: "≠" },
    { vars: ["F31", "F32", "F33", "F34"], op: "≠" },
    { vars: ["F41", "F42", "F43", "F44"], op: "≠" },

    { vars: ["F11", "F21", "F31", "F41"], op: "≠" },
    { vars: ["F12", "F22", "F32", "F42"], op: "≠" },
    { vars: ["F13", "F23", "F33", "F43"], op: "≠" },
    { vars: ["F14", "F24", "F34", "F44"], op: "≠" },

    { vars: ["F11", "F21", "F12", "F22"], op: "≠" },
    { vars: ["F31", "F32", "F41", "F42"], op: "≠" },
    { vars: ["F13", "F23", "F14", "F24"], op: "≠" },
    { vars: ["F33", "F34", "F43", "F44"], op: "≠" },
	],
};

export const SORTING_LIST: SAT_Problem = {
  name: "sorting",
	init_asg: {
    V1: undefined,
    V2: undefined,
    V3: undefined,
    V4: undefined,
    V5: undefined,
    V6: undefined,
    V7: undefined,
	},
	init_domains: {
    V1: [7, 5, 2, 1, 4, 3, 6],
    V2: [7, 5, 2, 1, 4, 3, 6],
    V3: [7, 5, 2, 1, 4, 3, 6],
    V4: [7, 5, 2, 1, 4, 3, 6],
    V5: [7, 5, 2, 1, 4, 3, 6],
    V6: [7, 5, 2, 1, 4, 3, 6],
    V7: [7, 5, 2, 1, 4, 3, 6],
	},
	constraints: [
    {vars: ["V1", "V2", "V3", "V4", "V5", "V6", "V7"], op: "<"},
    {vars: ["V1", "V2", "V3", "V4", "V5", "V6", "V7"], op: "≠"}
	],
};

export const FOUR_ROOKS: SAT_Problem = {
  name: "four-rooks",
  init_asg: {
    F11: undefined,
    F12: undefined,
    F13: undefined,
    F14: undefined,
    F21: undefined,
    F22: undefined,
    F23: undefined,
    F24: undefined,
    F31: undefined,
    F32: undefined,
    F33: undefined,
    F34: undefined,
    F41: undefined,
    F42: undefined,
    F43: undefined,
    F44: undefined,
	},
  init_domains: {
    F11: [0, 1],
    F12: [0, 1],
    F13: [0, 1],
    F14: [0, 1],
    F21: [0, 1],
    F22: [0, 1],
    F23: [0, 1],
    F24: [0, 1],
    F31: [0, 1],
    F32: [0, 1],
    F33: [0, 1],
    F34: [0, 1],
    F41: [0, 1],
    F42: [0, 1],
    F43: [0, 1],
    F44: [0, 1],
	},
  constraints: [
    // rows have to have exactly one queen
    {vars: ["F11", "F12", "F13", "F14"], op: "⊻"},
    {vars: ["F21", "F22", "F23", "F24"], op: "⊻"},
    {vars: ["F31", "F32", "F33", "F34"], op: "⊻"},
    {vars: ["F41", "F42", "F43", "F44"], op: "⊻"},
    // columns have to have exactly one queen
    { vars: ["F11", "F21", "F31", "F41"], op: "⊻" },
    { vars: ["F12", "F22", "F32", "F42"], op: "⊻" },
    { vars: ["F13", "F23", "F33", "F43"], op: "⊻" },
    { vars: ["F14", "F24", "F34", "F44"], op: "⊻" },
    // diagonals can have up to one queen
    { vars: ["F12", "F21"], op: "+" },
    { vars: ["F13", "F22", "F31"], op: "+" },
    { vars: ["F14", "F23", "F32", "F41"], op: "+" },
    { vars: ["F24", "F33", "F42"], op: "+" },
    { vars: ["F34", "F43"], op: "+" },
    { vars: ["F13", "F24"], op: "+" },
    { vars: ["F12", "F23", "F34"], op: "+" },
    { vars: ["F11", "F22", "F33", "F44"], op: "+" },
    { vars: ["F21", "F32", "F43"], op: "+" },
    { vars: ["F31", "F42"], op: "+" },
  ]
}