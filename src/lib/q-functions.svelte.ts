import { rand_order, randint } from '$lib';
import { SvelteMap } from 'svelte/reactivity';

export interface Q_Cell {
	x: number;
	y: number;
	is_accesible: boolean;
	moves: SvelteMap<string, number>;
  next_moves: SvelteMap<string, number>;
	reward: number;
}

export interface Q_Bot {
  x: number;
  y: number;
}

export class Q_World {
  width: number;
  height: number;
	grid: Q_Cell[][] = $state([]);
	learning_rate: number = $state(0.1);
	discount_factor: number = $state(0.6);
  bot: Q_Bot = $state({x: 0, y: 0});

	constructor(
		width: number,
		height: number,
		learning_rate: number,
		discount_factor: number,
		init_Q: number,
    move_penalty: number,
	) {
    this.width = width;
    this.height = height;
		this.learning_rate = learning_rate;
		this.discount_factor = discount_factor;

		this.grid = [];
		for (let y = 0; y < height; y++) {
			this.grid.push([]);
			for (let x = 0; x < width; x++) {
				this.grid[y].push({
					x,
					y,
					is_accesible: true,
					moves: new SvelteMap([
						['left',  init_Q],
						['right', init_Q],
						['up',    init_Q],
						['down',  init_Q]
					]),
          next_moves: new SvelteMap([]),
					reward: -move_penalty
				});
			}
		}

    const x = randint(0, width);
		const y = randint(0, height);

    this.grid[y][x].reward = 1;

    this.bot = {
      x: randint(0, width),
      y: randint(0, height),
    }
	}

  reset_Q(value: number) {
    for (const [y, row] of this.grid.entries()) {
			for (const [x, cell] of row.entries()) {
				for (const [move, Q] of cell.moves.entries()) {
          cell.moves.set(move, value);
        }
			}
		}
  }

  reset_R(value: number) {
    for (const [y, row] of this.grid.entries()) {
			for (const [x, cell] of row.entries()) {
				for (const [move, Q] of cell.moves.entries()) {
          cell.reward = value;
        }
			}
		}
  }

	cell_step(x: number, y: number) {
		const cell = this.grid[y][x];
    cell.next_moves.clear();
    if (!cell.is_accesible) return;
		for (const [move, old_Q] of cell.moves.entries()) {
			const next_cell = this.get_cell_by_move(x, y, move);
			if (next_cell === 'fail') continue;
			const R = next_cell.reward;
			let max_next_Q = -Infinity;
			for (const [second_move, next_Q] of next_cell.moves.entries()) {
				if (next_Q > max_next_Q) max_next_Q = next_Q;
			}
			const new_Q =
				(1 - this.learning_rate) * old_Q +
				this.learning_rate * (R + this.discount_factor * max_next_Q);
			
      cell.next_moves.set(move, new_Q);
		}
	}

  set_new_moves() {
    for (const [y, row] of this.grid.entries()) {
			for (const [x, cell] of row.entries()) {
				for (const [move, Q] of cell.next_moves.entries()) {
          cell.moves.set(move, Q);
        }
			}
		}
  }

	full_step() {
		for (const [y, row] of this.grid.entries()) {
			for (const [x, cell] of row.entries()) {
				this.cell_step(x, y);
			}
		}
    this.set_new_moves();
	}

	stochastic_step(number_of_updates: number) {
		const height = this.grid.length;
		if (height === 0) return;
		const width = this.grid[0].length;
		if (width === 0) return;

		for (let n = 0; n < number_of_updates; n++) {
			const x = randint(0, width);
			const y = randint(0, height);

			this.cell_step(x, y);
		}
    this.set_new_moves();
	}

	get_cell(x: number, y: number): 'fail' | Q_Cell {
		const row = this.grid[y];
		if (!row) return 'fail';
		const cell = row[x];
		if (!cell) return 'fail';
    if (!cell.is_accesible) return "fail";
		return cell;
	}

	get_cell_by_move(x: number, y: number, move: string): 'fail' | Q_Cell {
		switch (move) {
			case 'left':
				return this.get_cell(x - 1, y);
			case 'right':
				return this.get_cell(x + 1, y);
			case 'up':
				return this.get_cell(x, y - 1);
			case 'down':
				return this.get_cell(x, y + 1);
		}
		return 'fail';
	}

  put_bot(x: number, y: number) {
    const cell = this.get_cell(x, y);
    if (cell === "fail") return;
    this.put_bot_on_cell(cell);
  }

  put_bot_on_cell(cell: Q_Cell) {
    this.bot.x = cell.x;
    this.bot.y = cell.y;
  }

  bot_step() {
    const cell = this.get_cell(this.bot.x, this.bot.y);
    if (cell === "fail") return;
    
    let best_moves: string[] = [];
    let best_Q: number = -Infinity;

    for (let [move, Q] of cell.moves.entries()) {
      if (Q > best_Q) {
        best_moves = [move];
        best_Q = Q;
      }
      if (Q === best_Q) {
        best_moves.push(move);
      }
    }

    for (const move of rand_order(best_moves)) {
      const next_cell = this.get_cell_by_move(this.bot.x, this.bot.y, move);
      if (next_cell === "fail") continue;
      this.put_bot_on_cell(next_cell);
      break;
    }
  }
}
