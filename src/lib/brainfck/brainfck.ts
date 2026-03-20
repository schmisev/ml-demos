export enum BF_Cmd {
  END,
  NOOP,
  LEFT,
  RIGHT,
  INCR,
  DECR,
  PUT,
  PUTINT,
  READ,
  LBRACKET,
  RBRACKET,
  SWAP,
  RAND,
  ENDRAND,
  DEREF,
  REF,
  GOTO,
  HERE,
  TOGGLE,
  LOAD,
  ABSLOAD,
}

export type BF_Spec = {
  char: string,
  op: BF_Cmd,
  description: string,
  untypeable?: true,
}

export const BF_NAME_TO_SPEC: Record<string, BF_Spec> = {
  "<": { char:  "<", op: BF_Cmd.LEFT, description: "Moves <code><b>data_ptr</b></code> left, i.e. <code><b>data_ptr--</b></code>" },
  ">": { char:  ">", op: BF_Cmd.RIGHT, description: "Moves <code><b>data_ptr</b></code> right, i.e. <code><b>data_ptr++</b></code>" },
  "+": { char:  "+", op: BF_Cmd.INCR, description: "Adds 1 to value at <code><b>data_ptr</b></code>" },
  "-": { char:  "-", op: BF_Cmd.DECR, description: "Subtracts 1 from value at <code><b>data_ptr</b></code>" },
  ".": { char:  ".", op: BF_Cmd.PUT, description: "Prints value at <code><b>data_ptr</b></code> as character" },
  ":": { char:  ":", op: BF_Cmd.PUTINT, description: "Prints value at <code><b>data_ptr</b></code> as base-10 number" },
  ",": { char:  ",", op: BF_Cmd.READ, description: "Reads character code from input and writes it to <code><b>data_ptr</b></code>" },
  "[": { char:  "[", op: BF_Cmd.LBRACKET, description: "Jumps to address in its data field if value at <code><b>data_ptr</b></code> is 0. This address corresponds to the closing <code><b>]</b></code> after compilation." },
  "]": { char:  "]", op: BF_Cmd.RBRACKET, description: "Jumps to address in its data field if value at <code><b>data_ptr</b></code> is unequal to 0. This address corresponds to the opening <code><b>[</b></code> after compilation." },
  "~": { char:  "~", op: BF_Cmd.NOOP, description: "Does nothing and is passed over" },
  "ε": { char:  "ε", op: BF_Cmd.END, description: "Stops the program. New cells are initialized with this instruction" },
  "$": { char:  "$", op: BF_Cmd.SWAP, description: "Swaps data and instruction value of a cell" },
  "/": { char:  "/", op: BF_Cmd.TOGGLE, description: "Toggles between data write mode, where the <code><b>data_ptr</b></code> points at the data field of a cell, and the instruction write mode, where the <code><b>data_ptr</b></code> points at the instruction field of a cell." },
  "?": { char:  "?", op: BF_Cmd.RAND, description: "Jumps to address in its data field with a 50% chance. Is otherwise passed over. The address corresponds to matching ! after compilation." },
  "!": { char:  "!", op: BF_Cmd.ENDRAND, description: "Does nothing on its own. Marks end of sequence triggered by ?" },
  "*": { char:  "*", op: BF_Cmd.DEREF, description: "Dereference operator, sets <code><b>data_ptr</b></code> equal to value at <code><b>data_ptr</b></code>" },
  "&": { char:  "&", op: BF_Cmd.REF, description: "Reference operator, sets value at <code><b>data_ptr</b></code> equal to <code><b>data_ptr</b></code>" },
  "^": { char:  "^", op: BF_Cmd.GOTO, description: "Goto operator, sets <code><b>instr_ptr</b></code> to value at <code><b>data_ptr</b></code>" },
  "@": { char:  "@", op: BF_Cmd.HERE, description: "Here operator, sets value at <code><b>data_ptr</b></code> equal to <code><b>instr_ptr</b></code>" },
  "%": { char:  "%", op: BF_Cmd.LOAD, description: "Load operator, sets <code><b>data_ptr</b></code> to the data field of the instruction cell. Created automatically when using a-z to address cells offset from the end of the compiled instructions by 1-26. <code><b>%</b></code> alone jumps to offset 0. <code><b>ß</b></code> on the other hand will create a jump to the very first cell of the tape, i.e. the first compiled instruction. You can use this simple mnemonic: ßtart" },
}

export const BF_OP_TO_SPEC = new Map(Object.entries(BF_NAME_TO_SPEC).map(([name, spec]) => [spec.op, spec]));

export interface BF_TapeCell {
  instr: BF_Cmd;
  data: number;
}

export interface BF_Program {
	cmds: BF_TapeCell[];
}

export function compile(src: string, config: { compress_inputs: boolean }): BF_Program {
  const ptr_stack: number[] = [];
  const rnd_ptr_stack: number[] = [];
  let char_ptr: number = 0;
  let instr_ptr: number = 0;
  const chars = src.split("");
  let variable_index = 0;
  let variable_map = new Map<string, number>();

  const program: BF_Program = {
    cmds: []
  };

  function is_at(char: string) {
    return (chars[char_ptr] === char)
  }

  function at() {
    return chars[char_ptr];
  }

  function adv() {
    instr_ptr++;
    consume();
  }

  function consume() {
    char_ptr++;
  }

  while (char_ptr < chars.length) {
    const c = at();
    switch (c) {
      case "<":
      case ">":
      case "+":
      case "-":
      case ".": 
      case ",":
      case ":":
      case ";": {
        let count = 1;
        adv();
        while (config.compress_inputs && at() === c) {
          consume();
          count++;
        }

        program.cmds.push({
          instr: BF_NAME_TO_SPEC[c].op,
          data: count,
        });
        break;
      }
      case "[": {
        let data = -1; // unset
        ptr_stack.push(instr_ptr);
        adv();
        program.cmds.push({
          instr: BF_NAME_TO_SPEC[c].op,
          data
        });
        break;
      }
      case "]": {
        if (ptr_stack.length === 0) throw `Brackets do not match! One ] too many!`;
        let ptr_to_opening_bracket = ptr_stack.pop()!;
        // patching in ptr value
        program.cmds[ptr_to_opening_bracket].data = instr_ptr;
        
        adv();
        program.cmds.push({
          instr: BF_NAME_TO_SPEC[c].op,
          data: ptr_to_opening_bracket,
        });

        break;
      }
      case "~": {
        adv();
        program.cmds.push({
          instr: BF_NAME_TO_SPEC[c].op,
          data: 0
        })
        break;
      }
      case "/":
      case "$":
      case "*":
      case "&":
      case "@":
      case "^": {
        // reference & dereference
        adv();
        program.cmds.push({
          instr: BF_NAME_TO_SPEC[c].op,
          data: 0
        })
        break;
      }
      case "?": {
        let data = -1; // unset
        rnd_ptr_stack.push(instr_ptr);
        adv();
        program.cmds.push({
          instr: BF_NAME_TO_SPEC[c].op,
          data
        });
        break;
      }
      case "!": {
        if (rnd_ptr_stack.length === 0) throw `Brackets do not match. One ! too many!`;
        let ptr_to_question_mark = rnd_ptr_stack.pop()!;
        // patching in ptr value
        program.cmds[ptr_to_question_mark].data = instr_ptr;
        
        adv();
        program.cmds.push({
          instr: BF_NAME_TO_SPEC[c].op,
          data: ptr_to_question_mark,
        });
        break;
      }
      case "%": {
        adv();

        program.cmds.push({
          instr: BF_NAME_TO_SPEC[c].op,
          data: 0
        });
        break;
      }
      case "ß": {
        adv();

        program.cmds.push({
          instr: BF_Cmd.LOAD,
          data: -1
        });
        break;
      }
      default: {
        const var_index = "abcdefghijklmnopqrstuvwxyz".indexOf(c);
        if (var_index >= 0) {
          adv();

          program.cmds.push({
            instr: BF_Cmd.LOAD,
            data: var_index+1
          });

          break;
        }

        consume();
      }
    }
  }

  for (const cmd of program.cmds) {
    switch (cmd.instr) {
      case BF_Cmd.LOAD:
        if (cmd.data < 0) cmd.data = 0;
        else cmd.data += instr_ptr+1;
        break;
      default:
        break;
    }
  }

  program.cmds.push({instr: BF_Cmd.END, data: 0});
  if (ptr_stack.length > 0) throw `Unclosed [`;
  if (rnd_ptr_stack.length > 0) throw `Unclosed ?`;

  return program;
}

export const BF_HELLO_WORLD = `
++++++++++
[
>+++++++>++++++++++>+++>+<<<<-
]                       
>++.                    
>+.                     
+++++++.                
.                       
+++.                    
>++.                    
<<+++++++++++++++.      
>.                      
+++.                    
------.                 
--------.               
>+.
>.
+++.
`

