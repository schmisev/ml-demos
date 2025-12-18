import { range } from '$lib';
import { DPLL, dpll, DPLL_Result } from './dpll.svelte';
import {
	and,
	copy_expr,
	impl,
	LogicContext,
	not,
	or,
	term,
	type CNF,
	type Literal,
	type LogicExpr
} from './resolution';

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

	field_var(person: number, room: number, time_slot: number, negate = false): Literal {
		const name = `P${person}_R${room}_T${time_slot}`;
		return this.lit(name, negate);
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
				for (let g1 = 0; g1 < this.people - 1; g1++) {
					for (let g2 = g1 + 1; g2 < this.people; g2++) {
						const G1 = this.field_var(g1, r, t);
						const G2 = this.field_var(g2, r, t);

						const sentence = not(and(G1, G2));
						kb.push(sentence);
					}
				}
			}
		}

		return kb;
	}

	single_visit_constraint(): LogicExpr[] {
		const kb: LogicExpr[] = [];

		for (let r = 0; r < this.rooms; r++) {
			for (let g = 0; g < this.people; g++) {
				const clauses: LogicExpr[] = [];
				for (let t = 0; t < this.time_slots; t++) {
					const rules: LogicExpr[] = [];
					for (let ts = 0; ts < this.time_slots; ts++) {
						if (t == ts) {
							rules.push(this.field_var(g, r, ts, false));
						} else {
							rules.push(this.field_var(g, r, ts, true));
						}
					}
					clauses.push(and(...rules));
				}
				kb.push(or(...clauses));
			}
		}

		return kb;
	}

	not_simul_constraint(): LogicExpr[] {
		const kb: LogicExpr[] = [];

		for (let g = 0; g < this.people; g++) {
			for (let t = 0; t < this.time_slots; t++) {
				const rules: LogicExpr[] = [];
				for (let r = 0; r < this.rooms; r++) {
					rules.push(this.field_var(g, r, t));
				}
				kb.push(not(and(...rules)));
			}
		}

		return kb;
	}

  unavailable_constraint(guest: number, time_slot: number): LogicExpr[] {
    const kb: LogicExpr[] = []
    for (let r = 0; r < this.rooms; r++) {
      kb.push(not(this.field_var(guest, r, time_slot)));
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

  initial_schedule(schedule: {person: number, room: number, time_slot: number}[]) {
    const kb: LogicExpr[] = [];
    for (let {person, room, time_slot} of schedule) {
      kb.push(this.field_var(person, room, time_slot));
    }

    return kb;
  }
}