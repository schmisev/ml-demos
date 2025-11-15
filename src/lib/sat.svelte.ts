import { STANDARD_PHYSICS, type NetworkData } from './network';
import seedrandom from 'seedrandom';

export type SAT_Assignment = Record<string, number | undefined>;
export type SAT_Domain = Record<string, number[]>;
export type SAT_Constraint = SAT_BinaryConstraint;
export type SAT_Variable = '<no variable>' | string;

export interface SAT_BinaryConstraint {
	vars: string[];
	op: '=' | '≠' | '<' | '⊻' | '+';
}

export enum SAT_Result {
	FAILURE = 'FAILURE',
	UNDECIDED = 'UNDECIDED',
	SUCCESS = 'SUCCESS'
}

export enum SAT_ForwardCheckingMode {
  CONSTRAIN_ONCE,
  ASSIGN_DIRECTLY,
  RECURSIVE
}

export type SAT_ArcMask = {
	changed_var: string;
	exclude_var?: string;
};

function cut_out_value(arr: number[], value: number) {
	const i = arr.indexOf(value);
	if (i < 0) return [];
	return arr.splice(i, 1);
}

function copy_dom(dom: SAT_Domain): SAT_Domain {
	return JSON.parse(JSON.stringify(dom));
}

function is_constraint_dead(asg: SAT_Assignment, constraint: SAT_Constraint): boolean {
	for (const variable of constraint.vars) {
		if (asg[variable] === undefined) return false;
	}
	return true;
}

function get_unassigned(asg: SAT_Assignment): Set<string> {
	const unassigned = new Set<string>();
	for (const v in asg) {
		if (asg[v] == undefined) unassigned.add(v);
	}
	return unassigned;
}

// checking values pairwise
function check_constraint(cstr: SAT_Constraint, asg: SAT_Assignment): SAT_Result {
	let undecided = false;
	switch (cstr.op) {
		case '=':
		case '≠':
		case '<':
			break;
		case '⊻':
		case '+':
			let over_zero_count = 0;
			let undecided_count = 0;
			for (const v of cstr.vars) {
				if (asg[v] === undefined) undecided_count++;
				else if (asg[v] > 0) over_zero_count++;
			}
			if (over_zero_count > 1) return SAT_Result.FAILURE;
			if (undecided_count > 0) return SAT_Result.UNDECIDED;
			if (cstr.op === '⊻' && over_zero_count !== 1) return SAT_Result.FAILURE;
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
				case '<':
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
	name: SAT_ProblemName;
	init_asg: SAT_Assignment;
	init_domains: SAT_Domain;
	constraints: SAT_Constraint[];
}

export type SAT_ProblemGenerator = (seed: number) => SAT_Problem;

export function show(o: any) {
	return JSON.stringify(o);
}

export enum SAT_InferenceMode {
	NO_INFERENCE,
  ONLY_CHECK_CONSTRAINTS,
	FORWARD_CHECKING,
	RECURSIVE_FORWARD_CHECKING,
  FORWARD_CHECKING_WITH_DIRECT_ASSIGNMENT,
	ARC_CONSISTENCY
}

export enum SAT_VarSelectionMode {
	ANY,
	MRV,
	DEGREE,
	MRV_DEGREE,
	DEGREE_MRV
}

export enum SAT_ValueSelectionMode {
	ANY,
	LEAST_CONSTRAINING
}

export type SAT_VarSelector = (
	pick_from: Set<string>,
	asg: SAT_Assignment,
	dom: SAT_Domain,
	tiebreaker?: SAT_VarSelector
) => string;

export class SAT_Solver {
	steps = $state(0);
	last_result = $state(SAT_Result.UNDECIDED);
	csp: SAT_Problem;

	// these stacks represent the current search
	assignments = $state<SAT_Assignment[]>([]);
	domains = $state<SAT_Domain[]>([]);
	rejected = $state<SAT_Assignment[]>([]);
	rejected_domains = $state<SAT_Domain[]>([]);

	neighborhood: Record<string, Set<string>>;

	current_asg = $state<SAT_Assignment>();
	current_dom = $state<SAT_Domain>();

	current_variable: SAT_Variable = $state('<no variable>');
	choice_values = $state<number[]>([]);

	inference_mode = $state(SAT_InferenceMode.FORWARD_CHECKING);
	var_selection = $state(SAT_VarSelectionMode.MRV_DEGREE);
	value_selection = $state(SAT_ValueSelectionMode.LEAST_CONSTRAINING);
	arc_preprocessing = $state(false);

	constructor(
		csp: SAT_Problem,
		inference_mode: SAT_InferenceMode,
		var_selection: SAT_VarSelectionMode,
		value_selection: SAT_ValueSelectionMode,
		arc_preprocessing: boolean
	) {
		this.csp = csp;

		this.assignments = [{ ...csp.init_asg }];
		this.domains = [{ ...csp.init_domains }];

		this.inference_mode = inference_mode;
		this.var_selection = var_selection;
		this.value_selection = value_selection;
		this.arc_preprocessing = arc_preprocessing;

		// calculate neigborhood
		this.neighborhood = {};
		for (const v1 in this.csp.init_asg) {
			this.neighborhood[v1] = new Set();
			for (const c of this.csp.constraints) {
				if (!c.vars.includes(v1)) continue;
				for (const v2 of c.vars) {
					if (v1 !== v2) this.neighborhood[v1].add(v2);
				}
			}
		}
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
		if (this.last_result !== SAT_Result.UNDECIDED) return;
		this.last_result = this._step();
		this.steps += 1;
		return this.last_result;
	}

	_step() {
		this.current_variable = '<no variable>';
		this.choice_values = [];

		if (this.current_asg && this.check_all_constraints(this.current_asg) === SAT_Result.SUCCESS)
			return SAT_Result.SUCCESS;
		if (this.assignments.length === 0) return SAT_Result.FAILURE;

		[this.current_asg, this.current_dom] = this.pop();

		// do preprocessing in first step
		if (this.arc_preprocessing && this.steps === 0) {
			this.arc_consistency(this.current_asg, this.current_dom, '', -1, [
				...Object.keys(this.current_asg).map((v) => {
					return { changed_var: v };
				})
			]);
		}

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

		this.current_variable = this.select_unassigned_candidate(this.current_asg, this.current_dom);

		this.choice_values = this.order_domain_values(
			this.current_variable,
			this.current_asg,
			this.current_dom
		);

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

		return SAT_Result.UNDECIDED;
	}

	// directly edits assignments & domain
	inference(asg: SAT_Assignment, dom: SAT_Domain, variable: string, value: number): SAT_Result {
		switch (this.inference_mode) {
			case SAT_InferenceMode.NO_INFERENCE:
				return SAT_Result.UNDECIDED; // we do no inference
      case SAT_InferenceMode.ONLY_CHECK_CONSTRAINTS:
        return this.check_all_constraints(asg);
			case SAT_InferenceMode.FORWARD_CHECKING:
				return this.forward_checking(asg, dom, variable, value, SAT_ForwardCheckingMode.CONSTRAIN_ONCE);
      case SAT_InferenceMode.FORWARD_CHECKING_WITH_DIRECT_ASSIGNMENT:
				return this.forward_checking(asg, dom, variable, value, SAT_ForwardCheckingMode.ASSIGN_DIRECTLY);
			case SAT_InferenceMode.RECURSIVE_FORWARD_CHECKING:
				return this.forward_checking(asg, dom, variable, value, SAT_ForwardCheckingMode.RECURSIVE);
			case SAT_InferenceMode.ARC_CONSISTENCY:
				return this.arc_consistency(asg, dom, variable, value);
		}
	}

	arc_consistency(
		asg: SAT_Assignment, // only here so we can set fixed values directly
		dom: SAT_Domain,
		init_var: string, // this is just the initially changed variable
		set_value: number, // not needed
		overwrite_arcs?: SAT_ArcMask[]
	) {
		let arcs: SAT_ArcMask[];
		if (overwrite_arcs) arcs = overwrite_arcs;
		else arcs = [{ changed_var: init_var }];

		function save_and_splice(variable: string, exclude: string, i: number) {
			// if (!changed_vars.includes(variable))
			arcs.push({ changed_var: variable, exclude_var: exclude });
			const v = dom[variable].splice(i, 1);

			console.log('!!! removed:', v, 'from', variable);
		}

		function test_assign_stop(variable: string) {
			if (dom[variable].length === 0) {
				return true; // FAIL!
			}
			if (dom[variable].length === 1) {
				asg[variable] = dom[variable][0];
			}
			return false;
		}

		while (arcs.length > 0) {
			let { changed_var, exclude_var: exclude } = arcs.shift()!;

			let var_dom = dom[changed_var];
			let max_value = Math.max(...var_dom);
			let min_value = Math.min(...var_dom);

			for (const constraint of this.csp.constraints) {
				if (!constraint.vars.includes(changed_var)) continue;
				const variable_index = constraint.vars.indexOf(changed_var);

				for (const [constrained_index, constrained_var] of constraint.vars.entries()) {
					if (constrained_var === changed_var || (exclude && constrained_var == exclude)) continue;
					switch (constraint.op) {
						case '=':
							// the domains have to be equal, but we only test one way
							// i.e. we are masking dom[cvar] with var_dom
							for (let i = 0; i < dom[constrained_var].length; ) {
								if (!var_dom.includes(dom[constrained_var][i]))
									save_and_splice(constrained_var, changed_var, i);
								else i++;
							}
							if (test_assign_stop(constrained_var)) return SAT_Result.FAILURE;
							break;
						case '≠':
							// we can exclude values ONLY if var_dom contains only 1 value
							if (var_dom.length === 1) {
								for (let i = 0; i < dom[constrained_var].length; ) {
									if (dom[constrained_var][i] === var_dom[0])
										save_and_splice(constrained_var, changed_var, i);
									else i++;
								}
							}
							if (test_assign_stop(constrained_var)) return SAT_Result.FAILURE;
							break;
						case '<':
							// we exclude either values greater than the MAX
							// or lesser than the MIN depending on their position
							for (let i = 0; i < var_dom.length; ) {
								const cval = dom[constrained_var][i];
								if (variable_index <= constrained_index) {
									if (cval < min_value) save_and_splice(constrained_var, changed_var, i);
									else i++;
								} else {
									if (cval > max_value) save_and_splice(constrained_var, changed_var, i);
									else i++;
								}
							}
							if (test_assign_stop(constrained_var)) return SAT_Result.FAILURE;
							break;
						case '⊻':
							if (min_value > 0) {
								for (let i = 0; i < dom[constrained_var].length; ) {
									if (dom[constrained_var][i] > 0) save_and_splice(constrained_var, changed_var, i);
									else i++;
								}
							}
							if (test_assign_stop(constrained_var)) return SAT_Result.FAILURE;
							break;
						case '+':
							// we exclude all values that would overshoot one if added to the min_malue
							for (let i = 0; i < dom[constrained_var].length; ) {
								if (dom[constrained_var][i] + min_value > 1)
									save_and_splice(constrained_var, changed_var, i);
								else i++;
							}
							if (test_assign_stop(constrained_var)) return SAT_Result.FAILURE;
							break;
					}
				}
			}
		}
		return this.check_all_constraints(asg);
	}

	make_consistent(
		asg: SAT_Assignment,
		dom: SAT_Domain,
		constraint: SAT_Constraint,
		changed_var: string,
		set_value: number
	) {
		const variable_index = constraint.vars.indexOf(changed_var);
		for (const [ci, cvar] of constraint.vars.entries()) {
			if (cvar === changed_var) continue;
			switch (constraint.op) {
				case '=':
					// values must be equal
					if (!dom[cvar].includes(set_value)) return SAT_Result.FAILURE;
					dom[cvar] = [set_value];
					// asg[cvar] = set_value;
					break;
				case '≠':
					// values must be unequal
					if (asg[cvar] === set_value) return SAT_Result.FAILURE;
					cut_out_value(dom[cvar], set_value);
					if (dom[cvar].length <= 0) return SAT_Result.FAILURE;
					// if (dom[cvar].length === 1) asg[cvar] = dom[cvar][0];
					break;
				case '<':
					// first value must be smaller or equal to second
					if (variable_index <= ci) {
						// cvar should be bigger than set value
						for (let i = 0; i < dom[cvar].length; ) {
							const cval = dom[cvar][i];
							if (cval < set_value) dom[cvar].splice(i, 1);
							else i++;
						}
					} else {
						// cvar should be smaller than set value
						for (let i = 0; i < dom[cvar].length; ) {
							const cval = dom[cvar][i];
							if (cval > set_value) dom[cvar].splice(i, 1);
							else i++;
						}
					}
					break;
				case '⊻':
				case '+':
					if (set_value > 0) {
						// we can discard all values greater 0 from dom
						for (let i = 0; i < dom[cvar].length; ) {
							const cval = dom[cvar][i];
							if (cval > 0) dom[cvar].splice(i, 1);
							else i++;
						}
						if (dom[cvar].length <= 0) return SAT_Result.FAILURE;
						// if (dom[cvar].length === 1) asg[cvar] = dom[cvar][0];
					}
					break;
				default:
					const NEVER: never = constraint.op;
			}
		}
		return SAT_Result.SUCCESS;
	}

	forward_checking(
		asg: SAT_Assignment,
		dom: SAT_Domain,
		changed_variable: string,
		set_value: number, // not needed
    mode: SAT_ForwardCheckingMode,
	) {
		const candidates: string[] = [changed_variable];

		function set_and_save(variable: string) {
      if (asg[variable] === undefined && dom[variable].length === 1) {
        switch (mode) {
          case SAT_ForwardCheckingMode.CONSTRAIN_ONCE:
            break; // does nothing
          case SAT_ForwardCheckingMode.RECURSIVE:
            if (!candidates.includes(variable)) {
              candidates.push(variable);
            }
          case SAT_ForwardCheckingMode.ASSIGN_DIRECTLY:
            asg[variable] = dom[variable][0];
            break;
          default:
            const NEVER: never = mode;
        }
      }
		}

		while (candidates.length > 0) {
			const current_variable = candidates.shift()!;
			const current_value = asg[current_variable];

			if (current_value === undefined) throw `Set undefined value?`;

			for (const constraint of this.csp.constraints) {
				if (constraint.vars.includes(current_variable)) {
					// the new variable is involved in the constraint
					const variable_index = constraint.vars.indexOf(current_variable);
					for (const [ci, cvar] of constraint.vars.entries()) {
						if (cvar === current_variable) continue;
						switch (constraint.op) {
							case '=':
								// values must be equal
								if (!dom[cvar].includes(current_value)) return SAT_Result.FAILURE;
								dom[cvar] = [current_value];
								set_and_save(cvar);
								break;
							case '≠':
								// values must be unequal
								if (asg[cvar] === current_value) {
									console.log(constraint);
									console.log(cvar, '=', asg[cvar], ';', current_variable, '=', current_value);
									return SAT_Result.FAILURE;
								}
								cut_out_value(dom[cvar], current_value);
								if (dom[cvar].length <= 0) return SAT_Result.FAILURE;
								set_and_save(cvar);
								break;
							case '<':
								// first value must be smaller or equal to second
								if (variable_index <= ci) {
									// cvar should be bigger than set value
									for (let i = 0; i < dom[cvar].length; ) {
										const cval = dom[cvar][i];
										if (cval < current_value) dom[cvar].splice(i, 1);
										else i++;
									}
								} else {
									// cvar should be smaller than set value
									for (let i = 0; i < dom[cvar].length; ) {
										const cval = dom[cvar][i];
										if (cval > current_value) dom[cvar].splice(i, 1);
										else i++;
									}
								}
								set_and_save(cvar);
								break;
							case '⊻':
							case '+':
								if (current_value > 0) {
									// we can discard all values greater 0 from dom
									for (let i = 0; i < dom[cvar].length; ) {
										const cval = dom[cvar][i];
										if (cval > 0) dom[cvar].splice(i, 1);
										else i++;
									}
									if (dom[cvar].length <= 0) return SAT_Result.FAILURE;
									set_and_save(cvar);
								}
								break;
							default:
								const NEVER: never = constraint.op;
						}
					}
				}
			}
		}
		return this.check_all_constraints(asg);
	}

	/*
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
    */

	neighborhood_real_domain_size(variable: string, dom: SAT_Domain): number {
		let n = 0;
		for (const v of this.neighborhood[variable]) {
			n += dom[v].length;
		}
		return n;
	}

	neighborhood_unset_degree(variable: string, asg: SAT_Assignment): number {
		let n = 0;
		for (const v of this.neighborhood[variable]) {
			if (asg[v] === undefined) n++;
		}
		return n;
	}

	// SELECT NEXT CANDIDATE
	select_unassigned_candidate(asg: SAT_Assignment, dom: SAT_Domain): string {
		switch (this.var_selection) {
			case SAT_VarSelectionMode.ANY:
				return this.select_any_unassigned_candidate(get_unassigned(asg), asg, dom);
			case SAT_VarSelectionMode.MRV_DEGREE:
				return this.select_MRV_candidate(
					get_unassigned(asg),
					asg,
					dom,
					this.select_highest_degree_candidate.bind(this)
				);
			case SAT_VarSelectionMode.DEGREE_MRV:
				return this.select_highest_degree_candidate(
					get_unassigned(asg),
					asg,
					dom,
					this.select_MRV_candidate.bind(this)
				);
			case SAT_VarSelectionMode.MRV:
				return this.select_MRV_candidate(get_unassigned(asg), asg, dom);
			case SAT_VarSelectionMode.DEGREE:
				return this.select_highest_degree_candidate(get_unassigned(asg), asg, dom);
		}
	}

	// SELECTION MECHANISMS
	select_any_unassigned_candidate(
		pick_from: Set<string>,
		asg: SAT_Assignment,
		dom: SAT_Domain
	): string {
		return [...pick_from][0];
	}

	select_highest_degree_candidate(
		pick_from: Set<string>,
		asg: SAT_Assignment,
		dom: SAT_Domain,
		tiebreaker?: SAT_VarSelector
	): string {
		let candidates: Set<string> = new Set();
		let number_of_constraints: number = 0;
		// select from highest degree values
		for (const v of pick_from) {
			let n = this.neighborhood_unset_degree(v, asg);
			if (n >= number_of_constraints) {
				if (n > number_of_constraints) {
					candidates.clear();
				}
				candidates.add(v);
				number_of_constraints = n;
			}
		}

		if (candidates.size == 1) return [...candidates][0]; // eject only value
		if (candidates.size > 1) {
			if (tiebreaker) return tiebreaker(candidates, asg, dom);
			else return this.select_any_unassigned_candidate(candidates, asg, dom);
		}

		throw `No unassigned variables!`;
	}

	select_MRV_candidate(
		pick_from: Set<string>,
		asg: SAT_Assignment,
		dom: SAT_Domain,
		tiebreaker?: SAT_VarSelector
	): string {
		let candidates: Set<string> = new Set();
		let remaining_values = Infinity;
		// select for minimum remaining values
		for (const v of pick_from) {
			const r = dom[v].length;
			if (asg[v] === undefined && r <= remaining_values) {
				if (r < remaining_values) {
					candidates.clear();
				}
				candidates.add(v);
				remaining_values = r;
			}
		}

		if (candidates.size == 1) return [...candidates][0]; // eject only value
		if (candidates.size > 1) {
			if (tiebreaker) return tiebreaker(candidates, asg, dom);
			else return this.select_any_unassigned_candidate(candidates, asg, dom);
		}

		throw `No unassigned variables!`;
	}

	// ORDERING DOMAIN VALUES
	order_domain_values(variable: string, asg: SAT_Assignment, dom: SAT_Domain) {
		switch (this.value_selection) {
			case SAT_ValueSelectionMode.ANY:
				return this.order_domain_values_by_occurence(variable, asg, dom);
			case SAT_ValueSelectionMode.LEAST_CONSTRAINING:
				return this.order_domain_values_by_LRV(variable, asg, dom);
		}
	}

	// ORDERING METHODS
	order_domain_values_by_occurence(variable: string, asg: SAT_Assignment, dom: SAT_Domain) {
		const values: number[] = [];
		for (const value of dom[variable]) {
			values.push(value);
		}
		return values;
	}

	order_domain_values_by_LRV(variable: string, asg: SAT_Assignment, dom: SAT_Domain) {
		const dom_sizes_for_value: Record<number, number> = {};
		for (const value of dom[variable]) {
			const new_dom = copy_dom(dom);
			const new_asg = { ...asg };
			new_asg[variable] = value;
			new_dom[variable] = [value];
			this.forward_checking(new_asg, new_dom, variable, value, SAT_ForwardCheckingMode.CONSTRAIN_ONCE);
			const size = this.neighborhood_real_domain_size(variable, new_dom);
			dom_sizes_for_value[value] = size;
		}

		const sorted_values = dom[variable].toSorted(
			(a, b) => dom_sizes_for_value[a] - dom_sizes_for_value[b]
		);
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

export function csp_to_network(csp: SAT_Problem) {
	let node_id = 0;
	let link_id = 0;
	const network: NetworkData = {
		links: [],
		nodes: [],
		physics: { ...STANDARD_PHYSICS, center_pull: 4, node_charge: 6000, spring_stiffness: 1.4 }
	};

	const node_ref: Record<string, number> = {};

	for (const variable in csp.init_asg) {
		const new_node_id = node_id++;
		node_ref[variable] = new_node_id;
		network.nodes.push({ id: new_node_id, name: variable });
	}

	for (const c of csp.constraints) {
		for (const [i, v1] of Object.entries(c.vars)) {
			for (const [j, v2] of Object.entries(c.vars)) {
				if (j >= i) break;
				network.links.push({
					id: link_id++,
					source: node_ref[v1],
					target: node_ref[v2],
					weight: 100
				});
			}
		}
	}

	return network;
}

export type SAT_ProblemName =
	| 'australia'
	| 'NxN sudoku'
	| 'sorting'
	| 'N queens'
	| 'simple problem';

// setting up a simple problem
export const SIMPLE_PROBLEM: SAT_Problem = {
	name: 'simple problem',
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
	]
};

export const simple_problem_generator: SAT_ProblemGenerator = (seed) => SIMPLE_PROBLEM;

export const AUSTRALIA_PROBLEM: SAT_Problem = {
	name: 'australia',
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
		{ vars: ['NSW', 'V'], op: '≠' },
		{ vars: ['Q', 'NSW'], op: '≠' }
	]
};

export const australia_problem_generator: SAT_ProblemGenerator = (seed) => AUSTRALIA_PROBLEM;

export const SUDOKU_CONSTRAINTS: SAT_Constraint[] = [
	{ vars: ['F11', 'F12', 'F13', 'F14'], op: '≠' },
	{ vars: ['F21', 'F22', 'F23', 'F24'], op: '≠' },
	{ vars: ['F31', 'F32', 'F33', 'F34'], op: '≠' },
	{ vars: ['F41', 'F42', 'F43', 'F44'], op: '≠' },

	{ vars: ['F11', 'F21', 'F31', 'F41'], op: '≠' },
	{ vars: ['F12', 'F22', 'F32', 'F42'], op: '≠' },
	{ vars: ['F13', 'F23', 'F33', 'F43'], op: '≠' },
	{ vars: ['F14', 'F24', 'F34', 'F44'], op: '≠' },

	{ vars: ['F11', 'F21', 'F12', 'F22'], op: '≠' },
	{ vars: ['F31', 'F32', 'F41', 'F42'], op: '≠' },
	{ vars: ['F13', 'F23', 'F14', 'F24'], op: '≠' },
	{ vars: ['F33', 'F34', 'F43', 'F44'], op: '≠' }
];

export const SUDOKU_PUZZLE: SAT_Problem = {
	name: 'NxN sudoku',
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
		F44: undefined
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
		F44: [1, 2, 3, 4]
	},
	constraints: SUDOKU_CONSTRAINTS
};

export function sudoku_puzzle_generator(seed: number, n: number): SAT_Problem {
	const rng = seedrandom(`${seed}`);
	const puzzle: SAT_Problem = {
		name: 'NxN sudoku',
		init_asg: {},
		init_domains: {},
		constraints: []
	};

	const L = n;
	const M = Math.round(Math.sqrt(L));

	const row_constraints: Record<number, string[]> = {};
	const col_constraints: Record<number, string[]> = {};
	const box_constraints: Record<number, string[]> = {};

	for (let i = 0; i < L; i++) {
		for (let j = 0; j < L; j++) {
			const name = `F${i + 1}${j + 1}`;

			if (!row_constraints[j]) row_constraints[j] = [];
			row_constraints[j].push(name);

			if (!col_constraints[i]) col_constraints[i] = [];
			col_constraints[i].push(name);

			const box_num = Math.floor(i / M) * M + Math.floor(j / M);

			if (!box_constraints[box_num]) box_constraints[box_num] = [];
			box_constraints[box_num].push(name);

			if (rng() > 0.9) {
				// we place a number
				const num = Math.ceil(rng() * L);
				puzzle.init_asg[name] = num;
				puzzle.init_domains[name] = [num];
			} else {
				// we leave it free
				puzzle.init_asg[name] = undefined;
				puzzle.init_domains[name] = [...Array(L)].map((v, i) => i + 1);
			}
		}
	}

	for (const values of Object.values(row_constraints)) {
		puzzle.constraints.push({ op: '≠', vars: values });
	}
	for (const values of Object.values(col_constraints)) {
		puzzle.constraints.push({ op: '≠', vars: values });
	}
	for (const values of Object.values(box_constraints)) {
		puzzle.constraints.push({ op: '≠', vars: values });
	}

	return puzzle;
}

export const SORTING_LIST: SAT_Problem = {
	name: 'sorting',
	init_asg: {
		V1: undefined,
		V2: undefined,
		V3: undefined,
		V4: undefined,
		V5: undefined,
		V6: undefined,
		V7: undefined
	},
	init_domains: {
		V1: [7, 5, 2, 1, 4, 3, 6],
		V2: [7, 5, 2, 1, 4, 3, 6],
		V3: [7, 5, 2, 1, 4, 3, 6],
		V4: [7, 5, 2, 1, 4, 3, 6],
		V5: [7, 5, 2, 1, 4, 3, 6],
		V6: [7, 5, 2, 1, 4, 3, 6],
		V7: [7, 5, 2, 1, 4, 3, 6]
	},
	constraints: [
		{ vars: ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7'], op: '<' },
		{ vars: ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7'], op: '≠' }
	]
};

export const sorting_list_generator: SAT_ProblemGenerator = (seed) => {
	return SORTING_LIST;
};

export const FOUR_QUEENS: SAT_Problem = {
	name: 'N queens',
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
		F44: undefined
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
		F44: [0, 1]
	},
	constraints: [
		// rows have to have exactly one queen
		{ vars: ['F11', 'F12', 'F13', 'F14'], op: '⊻' },
		{ vars: ['F21', 'F22', 'F23', 'F24'], op: '⊻' },
		{ vars: ['F31', 'F32', 'F33', 'F34'], op: '⊻' },
		{ vars: ['F41', 'F42', 'F43', 'F44'], op: '⊻' },
		// columns have to have exactly one queen
		{ vars: ['F11', 'F21', 'F31', 'F41'], op: '⊻' },
		{ vars: ['F12', 'F22', 'F32', 'F42'], op: '⊻' },
		{ vars: ['F13', 'F23', 'F33', 'F43'], op: '⊻' },
		{ vars: ['F14', 'F24', 'F34', 'F44'], op: '⊻' },
		// diagonals can have up to one queen
		{ vars: ['F12', 'F21'], op: '+' },
		{ vars: ['F13', 'F22', 'F31'], op: '+' },
		{ vars: ['F14', 'F23', 'F32', 'F41'], op: '+' },
		{ vars: ['F24', 'F33', 'F42'], op: '+' },
		{ vars: ['F34', 'F43'], op: '+' },
		{ vars: ['F13', 'F24'], op: '+' },
		{ vars: ['F12', 'F23', 'F34'], op: '+' },
		{ vars: ['F11', 'F22', 'F33', 'F44'], op: '+' },
		{ vars: ['F21', 'F32', 'F43'], op: '+' },
		{ vars: ['F31', 'F42'], op: '+' }
	]
};

export function n_queens_generator(seed: number, n: number): SAT_Problem {
	const problem: SAT_Problem = {
		name: 'N queens',
		init_domains: {},
		init_asg: {},
		constraints: []
	};

	const L = n;

	// rows
	for (let i = 0; i < L; i++) {
		const only_one_per_row: SAT_Constraint = {
			vars: [],
			op: '⊻'
		};

		for (let j = 0; j < L; j++) {
			const field = `F${i + 1}${j + 1}`;
			problem.init_asg[field] = undefined;
			problem.init_domains[field] = [0, 1];

			only_one_per_row.vars.push(field);
		}

		problem.constraints.push(only_one_per_row);
	}

	// columns
	for (let i = 0; i < L; i++) {
		const only_one_per_column: SAT_Constraint = {
			vars: [],
			op: '⊻'
		};

		for (let j = 0; j < L; j++) {
			const field = `F${j + 1}${i + 1}`;
			only_one_per_column.vars.push(field);
		}

		problem.constraints.push(only_one_per_column);
	}

	// diagonals
	for (let diag = 1; diag < 2 * L - 2; diag++) {
		const left_top_diag: SAT_Constraint = {
			vars: [],
			op: '+'
		};

		const right_top_diag: SAT_Constraint = {
			vars: [],
			op: '+'
		};

		const offset = diag + 1 - L;

		for (let i = 0; i < L; i++) {
			for (let j = 0; j < L; j++) {
				const field = `F${j + 1}${i + 1}`;

				const local_offset = i - j;
				const local_diag = i + j;

				if (local_offset === offset) right_top_diag.vars.push(field);
				if (local_diag === diag) left_top_diag.vars.push(field);
			}
		}

		problem.constraints.push(right_top_diag, left_top_diag);
	}

	return problem;
}
