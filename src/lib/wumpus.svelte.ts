import { rand, randint } from '$lib';
import { LogicContext, type LogicExpr } from './resolution';
import * as PL from './resolution';
import { vadd, vclamp, type Vector2 } from './vector';

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
	state: PL.AndExpr;
}

export type WumpusProp = keyof WumpusCell;

export class WumpusWorld {
	size = $state(5);
	grid = $state<KnowledgeCell[][]>([]);
	ctx = $state(new LogicContext());

	hero: Vector2 = $state({ x: 0, y: 0 });
	hero_kb: PL.AndExpr = $state({ kind: 'AND', symbols: [] });
	hero_kb_text: string = $derived(this.ctx.format_expr(this.hero_kb));

	local_cell = $derived(this.get_cell(this.hero.x, this.hero.y)!);
	local_rule = $derived(this.ctx.format_expr(this.local_cell.rules));
	local_state = $derived(this.ctx.format_expr(this.local_cell.state));

	local_cnf = $derived(
		this.ctx.format_expr(
			this.ctx.expand_to_CNF(PL.and(this.local_cell.rules, this.hero_kb))
		)
	);

  test_literals: string[] = $derived(this.get_adjacent_literals(this.hero.x, this.hero.y));

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
					rules: PL.and(),
					state: PL.and(),
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

				rules.push(this.create_adjacent_rule("B", "P", x, y)); // breezes
        rules.push(this.create_adjacent_rule("G", "T", x, y)); // breezes
        rules.push(this.create_adjacent_rule("S", "W", x, y)); // breezes

				// included info
				state.push(this.ctx.lit(`B${x}${y}`, !cell.Breeze));
				state.push(this.ctx.lit(`S${x}${y}`, !cell.Stench));
				state.push(this.ctx.lit(`G${x}${y}`, !cell.Glitter));

				this.grid[x][y].rules = PL.and(...rules);
				this.grid[x][y].state = PL.and(...state);
			}
		}

		// randomly place hero
		for (let tries = 0; tries < 1000; tries++) {
			const x = randint(0, size);
			const y = randint(0, size);

			const cell = this.get_cell(x, y)!;

			if (cell.Wumpus || cell.Treasure || cell.Pit || cell.Breeze || cell.Stench) continue;
			this.hero.x = x;
			this.hero.y = y;
		}

    // observe first cell
    this.observe();
	}

  create_adjacent_rule(origin_prefix: string, target_prefix: string, x: number, y: number) {
      const X = this.ctx.lit(`${origin_prefix}${x}${y}`);
			const adj: PL.Literal[] = [];

      if (x > 0) adj.push(this.ctx.lit(`${target_prefix}${x - 1}${y}`));
      if (x < this.size - 1) adj.push(this.ctx.lit(`${target_prefix}${x + 1}${y}`));
      if (y > 0) adj.push(this.ctx.lit(`${target_prefix}${x}${y - 1}`));
      if (y < this.size - 1) adj.push(this.ctx.lit(`${target_prefix}${x}${y + 1}`));

      return PL.bicond(X, PL.or(...adj))
  }

  observe() {
    const cell = this.get_cell(this.hero.x, this.hero.y)!;
    cell.discovered = true;
    this.hero_kb.symbols.push(...this.local_cell.state.symbols)

    this.hero_kb = this.ctx.expand_to_AND(this.hero_kb);
  }

	move(x: -1 | 0 | 1, y: -1 | 0 | 1) {
		this.hero = vclamp(vadd(this.hero, { x, y }), 0, this.size - 1, 0, this.size - 1);
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

  get_adjacent_literals(x: number, y: number) {
    const names: string[] = [];
    return names;
  }
}
