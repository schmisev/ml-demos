import { range } from '$lib';
import { DPLL, dpll, DPLL_Result } from './dpll.svelte';
import {
	and,
	impl,
	LogicContext,
	not,
	or,
	term,
	type CNF,
	type Literal,
	type LogicExpr
} from './prop-logic';

export class SchedulingContext extends LogicContext {
	people: number;
	rooms: number;
	time_slots: number;

	constructor(people: number, rooms: number, time_slots: number) {
		super();
		this.people = people;
		this.time_slots = time_slots;
		this.rooms = rooms;
	}

  field_name(person: number, room: number, time_slot: number): string {
    return `P${person}_R${room}_T${time_slot}`;
  }

  field_var(person: number, room: number, time_slot: number, negate = false): Literal {
		return this.lit(this.field_name(person, room, time_slot), negate);
	}

  recover_field_values(signed_id: number): { person: number, room: number, time_slot: number } {
    const name = this.resolve_name(signed_id);
    const parts = name.split("_");

    return {
      person: parseInt(parts[0].slice(1)),
      room: parseInt(parts[1].slice(1)),
      time_slot: parseInt(parts[2].slice(1)),
    }
  }

	unique_slot_constraint(): LogicExpr[] {
		const kb: LogicExpr[] = [];

		for (let r = 0; r < this.rooms; r++) {
			for (let t = 0; t < this.time_slots; t++) {
        const variables: string[] = [];
        for (let g = 0; g < this.people; g++) {
          variables.push(this.field_name(g, r, t));
        }
        kb.push(...this.at_most_one_of(variables));
			}
		}

		return kb;
	}

  single_visit_constraint(): LogicExpr[] {
    const kb: LogicExpr[] = [];
    for (let r = 0; r < this.rooms; r++) {
      for (let g = 0; g < this.people; g++) {
        let names = new Array(this.time_slots);
        for (let t = 0; t < this.time_slots; t++) {
          names[t] = this.field_name(g, r, t);
        }

        kb.push(...this.one_of(names));
      }
    }
    return kb;
  }

	not_simul_constraint(): LogicExpr[] {
		const kb: LogicExpr[] = [];

		for (let g = 0; g < this.people; g++) {
			for (let t = 0; t < this.time_slots; t++) {
				const variables: string[] = [];
				for (let r = 0; r < this.rooms; r++) {
					variables.push(this.field_name(g, r, t));
				}
				kb.push(...this.at_most_one_of(variables));
			}
		}

		return kb;
	}

  unavailable_constraint(guest: number, time_slot: number): LogicExpr[] {
    const kb: LogicExpr[] = []
    for (let r = 0; r < this.rooms; r++) {
      kb.push(this.field_var(guest, r, time_slot, true));
    }

    return kb;
  }

  ordering_constraint(earlier_guest: number, later_guest: number) {
    const kb: LogicExpr[] = [];
    for (let r = 0; r < this.rooms; r++) {
      for (let early_slot = 0; early_slot < this.time_slots; early_slot++) {
        const assumption = this.field_var(earlier_guest, r, early_slot);
        const consequences: LogicExpr[] = [];
        for (let forbidden = 0; forbidden < early_slot+1; forbidden++) {
          consequences.push(not(this.field_var(later_guest, r, forbidden)));
        }

        kb.push(impl(assumption, and(...consequences)));
      }
    }

    return kb;
  }

  initial_schedule(schedule: (number | null)[][]) {
    const kb: LogicExpr[] = [];

    for (let room = 0; room < schedule.length; room++) {
      for (let time_slot = 0; time_slot < schedule[room].length; time_slot++) {
        const person = schedule[room][time_slot];
        if (person === null || person < 0 || person >= this.people || room >= this.rooms || time_slot >= this.time_slots)
          continue;
        kb.push(this.field_var(person, room, time_slot));
      }
    }

    return kb;
  }

  mutual_exclusion_constraint(guest_a: number, guest_b: number): LogicExpr[] {
    const kb: LogicExpr[] = [];

    for (let t = 0; t < this.time_slots; t++) {
      let vars_A: LogicExpr[] = [];
      let vars_B: LogicExpr[] = [];
      for (let r = 0; r < this.rooms; r++) {
        vars_A.push(this.field_var(guest_a, r, t));
        vars_B.push(this.field_var(guest_b, r, t));
      }
      kb.push(not(and(or(...vars_A), or(...vars_B))));
    }

    return kb;
  }

  consecutive_order_constraint(guest_a: number, guest_b: number) {
    const kb: LogicExpr[] = [];

    for (let r = 0; r < this.rooms; r++) {
      for (let t = 0; t < this.time_slots; t++) {
        const var_A = this.field_var(guest_a, r, t);

        const later_t = t+1;
        const earlier_t = t-1;

        const vars_B: LogicExpr[] = []
        if (later_t < this.time_slots)
            vars_B.push(this.field_var(guest_b, r, later_t))
        if (earlier_t >= 0)
            vars_B.push(this.field_var(guest_b, r, earlier_t))
    
        kb.push(impl(var_A, or(...vars_B)));
      }
    }

    return kb;
  }
}



