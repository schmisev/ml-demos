import { rand, randint } from '$lib';
import { DPLL } from './dpll.svelte';
import { and, bicond, convert_CNF_to_AND, convert_to_CNF, impl, LogicContext, not, or, resolution, type AndExpr, type CNF, type Literal, type LogicExpr } from './resolution';
import { vadd, vclamp, type Vec2D } from './vector';

export interface WumpusCell {
	Stench: boolean; // stench
	Breeze: boolean; // breeze
	Glitter: boolean; // glitter
	Wumpus: boolean; // wumpus
	Pit: boolean; // pit
	Treasure: boolean; // treasure
}

export interface KnowledgeCell extends WumpusCell {
	discovered: boolean;
	rules: LogicExpr;
	state: AndExpr;
}

export class WumpusContext extends LogicContext {
  cell_var(prop: WumpusProp, x: number, y: number, negate = false) {
    const prefix = prop[0];
    return this.lit(`${prefix}${x}${y}`, negate);
  }
}

export type WumpusProp = keyof WumpusCell;

export class WumpusWorld {
	size = $state(5);
	grid = $state<KnowledgeCell[][]>([]);
	ctx = $state(new WumpusContext());

  full_kb: AndExpr = $state({kind: "AND", symbols: []});
  full_cnf: CNF = $state({kind: "CNF", clauses: []});
  solution = $derived(new DPLL(this.full_cnf, []).solve());

	hero: Vec2D = $state({ x1: 0, x2: 0 });

  treasure_collected: boolean = $state(false);
  fell_in_hole: boolean = $state(false);
  died_to_wumpus: boolean = $state(false);

  get is_dead(): boolean {
    return this.fell_in_hole || this.died_to_wumpus;
  }

  set is_dead(v: boolean) {
    if (!v) {
      this.fell_in_hole = v;
      this.died_to_wumpus = v;
    }
  }

	local_cell = $derived(this.get_cell(this.hero.x1, this.hero.x2)!);

	constructor(size: number) {
		this.size = size;

		const wumpus_x = randint(0, size);
		const wumpus_y = randint(0, size);

		let gold_x = randint(0, size);
		let gold_y = randint(0, size);

		if (gold_x === wumpus_x && gold_y === wumpus_y) {
			if (rand(0, 1) > 0.5) {
				gold_x += 1 - randint(0, 1) * 2;
			} else {
				gold_y += 1 - randint(0, 1) * 2;
			}
		}

		// set world
		for (let x = 0; x < size; x++) {
			this.grid.push([]);
			for (let y = 0; y < size; y++) {
				this.grid[x].push({
					Wumpus: x === wumpus_x && y === wumpus_y,
					Treasure: x === gold_x && y === gold_y,
					Pit: x !== wumpus_x && y !== wumpus_y && x !== gold_x && y !== gold_y && rand(0, 1) > 0.6,
					Glitter: false,
					Breeze: false,
					Stench: false,
					rules: and(),
					state: and(),
					discovered: false
				});
			}
		}

		// set senses
		for (let x = 0; x < size; x++) {
			for (let y = 0; y < size; y++) {
				if (this.grid[x][y].Wumpus) {
					this.set_adjacent(x, y, 'Stench', true);
				} else if (this.grid[x][y].Pit) {
					this.set_adjacent(x, y, 'Breeze', true);
				} else if (this.grid[x][y].Treasure) {
					this.set_adjacent(x, y, 'Glitter', true);
				}
			}
		}

		// create KB
		for (let x = 0; x < size; x++) {
			for (let y = 0; y < size; y++) {
				const cell = this.get_cell(x, y)!;
				const rules: LogicExpr[] = [];
				const state: LogicExpr[] = [];

				// rules.push(this.create_adjacent_rule("Breeze", "Pit", x, y, or)); // breezes
        // rules.push(this.create_adjacent_rule("Glitter", "Treasure", x, y, or)); // glimmers
        // rules.push(this.create_adjacent_rule("Stench", "Wumpus", x, y, or)); // stenches

        rules.push(this.create_adjacent_rule("Pit", "Breeze", x, y, and)); // breezes
        rules.push(this.create_adjacent_rule("Treasure", "Glitter", x, y, and)); // glimmers
        rules.push(this.create_adjacent_rule("Wumpus", "Stench", x, y, and)); // stenches
        

				// included info
				state.push(this.ctx.cell_var("Breeze", x, y, !cell.Breeze));
				state.push(this.ctx.cell_var("Stench", x, y, !cell.Stench));
				state.push(this.ctx.cell_var("Glitter", x, y, !cell.Glitter));
        state.push(this.ctx.cell_var("Pit", x, y, !cell.Pit));
				state.push(this.ctx.cell_var("Wumpus", x, y, !cell.Wumpus));
				state.push(this.ctx.cell_var("Treasure", x, y, !cell.Treasure));

				this.grid[x][y].rules = and(...rules);
				this.grid[x][y].state = and(...state);

        this.full_kb.symbols.push(...rules);
			}
		}

		// randomly place hero
		for (let tries = 0; tries < 1000; tries++) {
			const x = randint(0, size);
			const y = randint(0, size);

			const cell = this.get_cell(x, y)!;

			if (cell.Wumpus || cell.Treasure || cell.Pit || cell.Breeze || cell.Stench) continue;
			this.hero.x1 = x;
			this.hero.x2 = y;
		}

    // observe first cell
    this.observe();
	}

  create_adjacent_rule(prop: WumpusProp, target_prop: WumpusProp, x: number, y: number, adj_op: typeof and | typeof or) {
      const X = this.ctx.cell_var(prop, x, y);
			const adj: Literal[] = [];

      if (x > 0) adj.push(this.ctx.cell_var(target_prop, x-1, y));
      if (x < this.size - 1) adj.push(this.ctx.cell_var(target_prop, x+1, y));
      if (y > 0) adj.push(this.ctx.cell_var(target_prop, x, y-1));
      if (y < this.size - 1) adj.push(this.ctx.cell_var(target_prop, x, y+1));

      return impl(X, adj_op(...adj))
  }

  observe() {
    const cell = this.get_cell(this.hero.x1, this.hero.x2)!;
    cell.discovered = true;

    if (cell.Wumpus) this.died_to_wumpus = true;
    if (cell.Pit) this.fell_in_hole = true;
    if (cell.Treasure) this.treasure_collected = true;
    
    this.full_kb.symbols.push(...this.local_cell.state.symbols);
    this.full_cnf = convert_to_CNF(this.full_kb);
    this.full_kb = convert_CNF_to_AND(this.full_cnf);
  }

  leave() {
    const cell = this.get_cell(this.hero.x1, this.hero.x2)!;
    
    if (cell.Treasure) { cell.Treasure = false; };
  }

	move(x: -1 | 0 | 1, y: -1 | 0 | 1) {
    if (this.is_dead) return; // no more moves

    this.leave();
		this.hero = vclamp(vadd(this.hero, { x1: x, x2: y }), 0, this.size - 1, 0, this.size - 1);
    this.observe();
	}

	move_left() {
		this.move(-1, 0);
	}

	move_right() {
		this.move(1, 0);
	}

	move_up() {
		this.move(0, -1);
	}

	move_down() {
		this.move(0, 1);
	}

	set_adjacent(x: number, y: number, prop: WumpusProp, value: boolean) {
		for (const xadj of [x - 1, x + 1]) {
			const cell = this.get_cell(xadj, y);
			if (!cell) continue;
			cell[prop] = value;
		}
		for (const yadj of [y - 1, y + 1]) {
			const cell = this.get_cell(x, yadj);
			if (!cell) continue;
			cell[prop] = value;
		}
	}

	get_cell(x: number, y: number): KnowledgeCell | undefined {
		if (x < 0 || y < 0) return undefined;
		const col = this.grid.at(x);
		if (col === undefined) return undefined;
		const cell = col.at(y);
		if (cell === undefined) undefined;
		return cell;
	}

  ask(query: Literal): { result: boolean; cnf: CNF; } {
    const res = resolution(this.full_kb, query);
    return res;
  }
}
