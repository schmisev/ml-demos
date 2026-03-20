import { rand } from '$lib';
import { BF_Cmd, BF_OP_TO_SPEC, type BF_Program, type BF_TapeCell } from './brainfck';

export class BF_VM {
	tape: BF_TapeCell[] = $state([]);
	instr_ptr = $state(0);
	data_ptr = $state(0);
	program: BF_Program = $state({ cmds: [{ instr: BF_Cmd.END, data: 0 }] });
	output = $state('');
	input = $state('');
	in_error_state = $state(false);
	in_done_state = $state(false);
	in_cmd_mode = $state(false);

	on_done: () => void;

	constructor(program: BF_Program, init_input: string, on_done: () => void) {
		this.program = program;
		this.on_done = on_done;
		this.input = init_input;

		this.reset();
	}

	swap_mem() {
		const cell = this.tape[this.data_ptr];
		const data = cell.data;
		cell.data = cell.instr;
		cell.instr = data;
	}

	set_mem(value: number) {
		const cell = this.tape[this.data_ptr];
		value = value % 255;
		if (this.in_cmd_mode) {
			cell.instr = value;
		} else {
			cell.data = value;
		}
	}

	get_mem() {
		const cell = this.tape[this.data_ptr];
		if (this.in_cmd_mode) {
			return cell.instr;
		} else {
			return cell.data;
		}
	}

	get_data() {
		return this.tape[this.data_ptr].data;
	}

	get_cmd() {
		return this.tape[this.data_ptr].instr;
	}

	get_instr() {
		this.allocate_tape(this.instr_ptr);
		if (this.instr_ptr < 0) {
			this.output += `\nERROR: Instruction pointer tried to read out of bounds! ${this.instr_ptr} < 0\n`;
		}
		return this.tape[this.instr_ptr];
	}

	allocate_tape(value: number) {
		while (value >= this.tape.length) {
			this.tape.push({
				data: 0,
				instr: 0
			});
		}
	}

	set_instr_ptr(value: number) {
		if (value < 0) {
			this.output += `\nERROR: Instruction pointer is out of bounds! ${value} < 0\n`;
		}
		this.instr_ptr = value;
		this.allocate_tape(value);
	}

	set_data_ptr(value: number) {
		if (value < 0) {
			this.output += `\nERROR: Data pointer is out of bounds! ${value} < 0\n`;
		}
		this.data_ptr = value;
		this.allocate_tape(value);
	}

	load_tape() {
		this.tape = [];

		for (const cmd of this.program.cmds) {
			this.tape.push({ ...cmd });
		}

		this.tape.push({ instr: 0, data: 0 });
	}

	reset() {
		this.load_tape();
		this.instr_ptr = 0;
		this.data_ptr = this.program.cmds.length;
		this.in_error_state = false;
		this.in_done_state = false;
		this.in_cmd_mode = false;
		this.output = '';
	}

	execute() {
		while (!this.in_error_state && !this.in_done_state) {
			this._step();
		}
	}

	_step() {
		if (this.in_error_state || this.in_done_state) return;

		const curr_cmd = this.get_instr();

		switch (curr_cmd.instr) {
			case BF_Cmd.LEFT:
				this.data_ptr -= curr_cmd.data;
				if (this.data_ptr < 0) {
					this.output += '\nERROR: Tape pointer < 0\n';
					this.in_error_state = true;
				}
				break;
			case BF_Cmd.RIGHT:
				this.data_ptr += curr_cmd.data;
				this.allocate_tape(this.data_ptr);
				break;
			case BF_Cmd.INCR:
				this.set_mem(this.get_mem() + curr_cmd.data);
				break;
			case BF_Cmd.DECR:
				this.set_mem(this.get_mem() - curr_cmd.data);
				break;
			case BF_Cmd.PUT: {
				const char_code = this.get_mem();
				if (char_code < 0) {
					this.output += `\nERROR: '${char_code}' is not printable!`;
					this.in_error_state = true;
					break;
				}
				const char = String.fromCharCode(char_code);
				this.output += char;
				break;
			}
			case BF_Cmd.PUTINT: {
				const char = '' + this.get_mem();
				this.output += char;
				break;
			}
			case BF_Cmd.READ: {
				if (this.input.length === 0) {
					this.set_mem(0);
					break;
				}
				const char = this.input[0];
				this.input = this.input.slice(1);
				const value = char.charCodeAt(0);
				if (Number.isNaN(value)) {
					this.in_error_state = true;
					this.set_mem(0);
					break;
				}
				this.set_mem(value);
				break;
			}
			case BF_Cmd.LBRACKET: {
				const value = this.get_mem();
				if (value === 0) {
					this.set_instr_ptr(curr_cmd.data);
				}
				break;
			}
			case BF_Cmd.RBRACKET: {
				const value = this.get_data();
				if (value !== 0) {
					this.set_instr_ptr(curr_cmd.data);
				}
				break;
			}
			case BF_Cmd.SWAP:
				this.swap_mem();
				break;
			case BF_Cmd.RAND:
				if (rand(0, 1) > 0.5) {
					this.set_instr_ptr(curr_cmd.data);
				}
				break;
			case BF_Cmd.ENDRAND:
			case BF_Cmd.DEREF:
				this.set_data_ptr(this.get_mem());
				break;
			case BF_Cmd.REF:
				this.set_mem(this.data_ptr);
				break;
			case BF_Cmd.GOTO:
				this.set_instr_ptr(this.get_mem());
				return;
			case BF_Cmd.HERE:
				this.set_mem(this.instr_ptr);
				break;
			case BF_Cmd.TOGGLE:
				this.in_cmd_mode = !this.in_cmd_mode;
				break;
			case BF_Cmd.NOOP:
				break;
			case BF_Cmd.END:
				this.in_done_state = true;
				this.on_done();
				return;
			case BF_Cmd.LOAD:
				this.set_data_ptr(curr_cmd.data);
				break;
			default:
				break;
		}
		this.instr_ptr++;
	}
}
