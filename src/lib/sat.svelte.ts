export type SAT_Assignment = Record<string, number | undefined>;
export type SAT_Domain = Record<string, number[]>;
export type SAT_Constraint = SAT_BinaryConstraint;

export interface SAT_BinaryConstraint {
	vars: [string, string];
	op: '==' | '!=';
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

function test_constraint(cstr: SAT_Constraint, asg: SAT_Assignment): SAT_Result {
	if (!(asg[cstr.vars[0]] !== undefined && asg[cstr.vars[1]] !== undefined))
		return SAT_Result.UNDECIDED; // values are not assigned
	const A = asg[cstr.vars[0]];
	const B = asg[cstr.vars[1]];
	switch (cstr.op) {
		case '==':
			return A === B ? SAT_Result.SUCCESS : SAT_Result.FAILURE;
		case '!=':
			return A !== B ? SAT_Result.SUCCESS : SAT_Result.FAILURE;
	}
	return SAT_Result.UNDECIDED;
}

export interface SAT_Problem {
	init_asg: SAT_Assignment;
	init_domains: SAT_Domain;
	constraints: SAT_Constraint[];
}

export function show(o: any) {
	return JSON.stringify(o);
}

export class SAT_Solver {
	csp: SAT_Problem;

	// these stacks represent the current search
	assignments = $state<SAT_Assignment[]>([]);
	domains = $state<SAT_Domain[]>([]);
	rejected = $state<SAT_Assignment[]>([]);

	current_asg = $state<SAT_Assignment>();
	current_dom = $state<SAT_Domain>();

	constructor(csp: SAT_Problem) {
		this.csp = csp;

		this.assignments = [{ ...csp.init_asg }];
		this.domains = [{ ...csp.init_domains }];

		this.current_asg = this.assignments[0];
		this.current_dom = this.domains[0];
	}

	step() {
		if (this.current_asg && this.test_all_constraints(this.current_asg) === SAT_Result.SUCCESS)
			return SAT_Result.SUCCESS;
		if (this.assignments.length === 0) return SAT_Result.FAILURE;
		this.current_asg = this.assignments.pop()!;
		this.current_dom = this.domains.pop()!;
		const res = this.test_all_constraints(this.current_asg);

		switch (res) {
			case SAT_Result.FAILURE:
				this.rejected.push(this.current_asg);
				return SAT_Result.UNDECIDED; // this branch is DEAD!
			case SAT_Result.SUCCESS:
				return SAT_Result.SUCCESS;
			case SAT_Result.UNDECIDED:
				break; // checkout more options
		}

		const variable = this.select_unassigned_candidate(this.current_asg);
		for (const value of this.order_domain_values(variable, this.current_dom)) {
			const new_asg = { ...this.current_asg };
			const new_dom = copy_dom(this.current_dom);
			new_asg[variable] = value; // add { variable = value } to assignment
			new_dom[variable] = [value]; // narrow domain

			const infs = this.inference(new_asg, new_dom, variable, value);
			switch (infs) {
				case SAT_Result.FAILURE:
					this.rejected.push(new_asg);
					break; // do not add to options
				case SAT_Result.UNDECIDED:
				case SAT_Result.SUCCESS:
					// we could do an early out here, but then it wouldn't be truly depth first
					// add value to stack
					this.assignments.push(new_asg);
					this.domains.push(new_dom);
					break;
				// // found solution by chance
				// this.current_asg = new_asg;
				// this.current_dom = new_dom;
				// return SAT_Result.SUCCESS;
			}
		}

		return SAT_Result.UNDECIDED;
	}

	// directly edits assignments & domain
	inference(asg: SAT_Assignment, dom: SAT_Domain, variable: string, value: number) {
    console.log(`Starting inference with ${variable} = ${value}`);
    for (const constraint of this.csp.constraints) {
      if (constraint.vars.includes(variable)) {
        console.log(`Looking at constraint`, constraint)
        // the new variable is involved in the constraint
        for (const cvar of constraint.vars) {
          if (cvar === variable) continue;
          switch (constraint.op) {
            case "==":
              // values must be equal
              if (!dom[cvar].includes(value)) return SAT_Result.FAILURE;
              dom[cvar] = [value];
              asg[cvar] = value;
              break;
            case "!=":
              console.log(`${variable} = ${value} // != // ${cvar} = ${asg[cvar]}`)
              if (asg[cvar] === value) return SAT_Result.FAILURE;
              cut_out_value(dom[cvar], value);
              console.log(`Searching`, value, `-- After cut`, dom[cvar]);
              if (dom[cvar].length <= 0) return SAT_Result.FAILURE; 
              if (dom[cvar].length === 1) asg[cvar] = dom[cvar][0];
              break;
          }
        }
      }
    }
    
		return this.test_all_constraints(asg);
	}

	select_unassigned_candidate(asg: SAT_Assignment): string {
		for (const variable in asg) {
			// TODO: reordering!
			if (asg[variable] === undefined) return variable;
		}
		throw `No unassigned variable!`;
	}

	*order_domain_values(variable: string, dom: SAT_Domain) {
		for (const value of dom[variable]) {
			// TODO: ordering
			yield value;
		}
	}

	test_all_constraints(asg: SAT_Assignment): SAT_Result {
		let undecided = false;
		for (const cstr of this.csp.constraints) {
			const res = test_constraint(cstr, asg);
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
    { vars: ['a', 'b'], op: '!=' },
    { vars: ['b', 'c'], op: '!=' },
    { vars: ['c', 'd'], op: '!=' },
    { vars: ['d', 'a'], op: '!=' },
	]
};

export const AUSTRALIA_PROBLEM: SAT_Problem = {
	init_asg: {
		WA: undefined,
		NT: undefined,
		SA: undefined,
		Q: undefined,
		NSW: undefined,
		V: undefined,
		T: undefined
	},
	init_domains: {
		WA: [1, 2, 3],
		NT: [1, 2, 3],
		SA: [1, 2, 3],
		Q: [1, 2, 3],
		NSW: [1, 2, 3],
		V: [1, 2, 3],
		T: [1, 2, 3]
	},
	constraints: [
    { vars: ['WA', 'NT'], op: '!=' },
    { vars: ['WA', 'SA'], op: '!=' },
    { vars: ['NT', 'Q'], op: '!=' },
    { vars: ['NT', 'SA'], op: '!=' },
    { vars: ['SA', 'Q'], op: '!=' },
    { vars: ['SA', 'NSW'], op: '!=' },
    { vars: ['SA', 'V'], op: '!=' },
    { vars: ['Q', 'NSW'], op: '!=' },
	]
};
