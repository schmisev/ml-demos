import { clamp, mod, rand, randint } from '$lib';

export type Nucleotide = 'A' | 'T' | 'C' | 'G';

export function nucl_compl(x: Nucleotide): Nucleotide {
	switch (x) {
		case 'A':
			return 'T';
		case 'T':
			return 'A';
		case 'C':
			return 'G';
		case 'G':
			return 'C';
	}
}

export function num_to_nucl(n: number): Nucleotide {
	switch (mod(n, 4)) {
		case 0:
			return 'A';
		case 1:
			return 'T';
		case 2:
			return 'C';
		case 3:
			return 'G';
		default:
			throw `Not reachable!`;
	}
}

export function nucl_to_num(n: Nucleotide): 0 | 1 | 2 | 3 {
	switch (n) {
		case 'A':
			return 0;
		case 'T':
			return 1;
		case 'C':
			return 2;
		case 'G':
			return 3;
	}
}

export function rand_nucl() {
	const n = randint(0, 4);
	return num_to_nucl(n);
}

export type RNA = Nucleotide[];

export function copy_RNA(rna: RNA, error_rate: number): RNA {
	const copy: RNA = [];
	error_rate = clamp(error_rate, 0, 1);

	for (const x of rna) {
		if (rand(0, 1) < error_rate) {
			copy.push(rand_nucl());
		} else {
			copy.push(x);
		}
	}
	return copy;
}

export function duplicate_RNA(rna: RNA, error_rate: number): [RNA, RNA] {
	const copy_A = copy_RNA(rna, error_rate);
	const copy_B = copy_RNA(rna, error_rate);
	return [copy_A, copy_B];
}

export type HomologousGroup = RNA[];
export type Genome = HomologousGroup[];

function split_genome(g: Genome, non_disjunction_rate: number): [Genome, Genome] {
	non_disjunction_rate = clamp(non_disjunction_rate, 0, 1);
	const A: Genome = [];
	const B: Genome = [];

	for (const group of g) {
		const A_group: HomologousGroup = [];
		const B_group: HomologousGroup = [];
		for (const [i, rna] of group.entries()) {
			// split along groups
			if (A_group.length == B_group.length || rand(0, 1) < non_disjunction_rate) {
				if (rand(0, 1) < 0.5) A_group.push(rna);
				else B_group.push(rna);
			} else if (A_group.length > B_group.length) {
				B_group.push(rna);
			} else {
				A_group.push(rna);
			}
		}
		A.push(A_group);
		B.push(B_group);
	}

	return [A, B];
}

function replicate_genome(g: Genome, error_rate: number): [Genome, Genome] {
	const A: Genome = [];
	const B: Genome = [];

	for (const group of g) {
		const A_group: HomologousGroup = [];
		const B_group: HomologousGroup = [];
		for (const rna of group) {
			const [rna_A, rna_B] = duplicate_RNA(rna, error_rate);
			A_group.push(rna_A);
			B_group.push(rna_B);
		}
	}

	return [A, B];
}

function meiosis(
	g: Genome,
	non_disjunction_rate: number,
	error_rate: number
): [Genome, Genome, Genome, Genome] {
	const [A, B] = split_genome(g, non_disjunction_rate);
	const [A1, A2] = replicate_genome(A, error_rate);
	const [B1, B2] = replicate_genome(B, error_rate);
	return [A1, A2, B1, B2];
}

// assortment of gene expression functions
export const NUCL_BASE_4 = (seg: RNA) => {
	let accum = 0;
	for (let i = 0; i < seg.length; i++) {
		accum += nucl_to_num(seg[i]) * 4 ** i;
	}
	return accum;
};

export const INV_NUCL_BASE_4 = (seg: RNA) => {
	let accum = 0;
	for (let i = 0; i < seg.length; i++) {
		accum += nucl_to_num(seg[i]) / 4 ** i;
	}
	return accum;
};

const GENETIC_COLORS_16 = [
	[0, 0, 0], // Black
	[255, 255, 255], // White
	[255, 0, 0], // Red
	[0, 255, 0], // Lime
	[0, 0, 255], // Blue
	[255, 255, 0], // Yellow
	[0, 255, 255], // Cyan
	[255, 0, 255], // Magenta
	[192, 192, 192], // Silver
	[128, 128, 128], // Gray
	[128, 0, 0], // Maroon
	[128, 128, 0], // Olive
	[0, 128, 0], // Green
	[128, 0, 128], // Purple
	[0, 128, 128], // Teal
	[0, 0, 128] // Navy
];

export function NUCL_COLOR(seg: RNA): [number, number, number] {
	if (seg.length === 0) return [0, 0, 0];
	if (seg.length === 1) {
		const lightness = (255 * NUCL_BASE_4(seg)) / 3;
		return [lightness, lightness, lightness];
	}
	if (seg.length === 2) {
		const index = NUCL_BASE_4(seg);
		return GENETIC_COLORS_16[index] as [number, number, number];
	}

	const color: [number, number, number] = [0, 0, 0];
	const color_exp = [0, 0, 0];
	for (let i = 0; i < seg.length; i++) {
		let c = mod(i, 3);
		color[c] += nucl_to_num(seg[i]) * 4 ** c;
		color_exp[c]++;
	}

	for (let c = 0; c < 3; c++) {
		const norm_factor = 4 ** color_exp[c] - 1;
		color[c] = (255 * color[c]) / norm_factor;
	}

	return color;
}

export const NUCL_COUNT = (seg: RNA) => {
	let accum = 0;
	for (const n of seg) {
		if (n === 'A' || n === 'T') {
			accum++;
		}
	}
	return accum;
};

export const INV_NUCL_COUNT = (seg: RNA) => {
	let accum = 0;
	for (const n of seg) {
		if (n !== 'A' && n !== 'T') {
			accum++;
		}
	}
	return accum;
};

export const NUCL_CMP_PREDICATE = (to_num: (rna: RNA) => number) => (seg: RNA) => {
	if (seg.length === 0) return false;
	if (seg.length === 1) return NUCL_BASE_4(seg) > 1;

	const l = Math.floor(seg.length / 2);
	const seg_A = seg.slice(0, l);
	const seg_B = seg.slice(l);

	return to_num(seg_A) > to_num(seg_B);
};

export function rand_rna(length: number): RNA {
	const rna: RNA = [];
	for (let i = 0; i < length; i++) {
		rna.push(rand_nucl());
	}
	return rna;
}

export function rand_genome(
	hom_groups: number,
	shortest_group: number,
	longest_group: number,
	chromosomes_per_group = 2
) {
	const new_genome: Genome = [];

	for (let h = 0; h < hom_groups; h++) {
		const group: HomologousGroup = [];
		const length = shortest_group + (longest_group - shortest_group) * rand(0, 1);
		for (let i = 0; i < chromosomes_per_group; i++) {
			group.push(rand_rna(length));
		}
		new_genome.push(group);
	}

	return new_genome;
}

export function rand_group_index(g: Genome) {
	return randint(0, g.length);
}

export function rand_group_seg(h: HomologousGroup): [number, number] {
	const a = randint(0, h[0].length);
	const b = randint(0, h[0].length);

	if (a > b) {
		return [b, a];
	} else {
		return [a, b];
	}
}

export const START_CODONES = [
  "ATG", "GTG", "TTG"
]

export const END_CODONES = [
  "TAA", "TAG", "TGA"
]

export type Codon = `${Nucleotide}${Nucleotide}${Nucleotide}`;

export interface CodonSequence {
  start: number,
  end: number,
  seq: string[],
  done: boolean,
}

export function codone(p1?: Nucleotide, p2?: Nucleotide, p3?: Nucleotide) {
  return `${p1 || ""}${p2 || ""}${p3 || ""}`;
}

export function codons_from_rna(rna: RNA): CodonSequence[] {
	let p1: undefined | Nucleotide = undefined;
	let p2: undefined | Nucleotide = undefined;
	let p3: undefined | Nucleotide = undefined;

  let sequences: CodonSequence[] = [];

	for (const [i, N] of rna.entries()) {
		// read nucleotide
		p1 = p2;
		p2 = p3;
		p3 = N;

    const c = codone(p1, p2, p3);

    if (START_CODONES.includes(c)) {
      sequences.push({start: i, end: i, seq: [], done: false});
    }

    for (const seq of sequences) {
      if ((i - seq.start) % 3 === 0 && !seq.done) {
        seq.seq.push(c);
        seq.end += 3;
      }

      if (END_CODONES.includes(c)) {
        seq.done = true;
      }
    }
	}

  return sequences;
}

export function codons_from_hom_group(group: HomologousGroup): CodonSequence[][] {
  const of_group: CodonSequence[][] = [];
  for (const rna of group) {
    of_group.push(codons_from_rna(rna));
  }

  return of_group;
}

export function codons_from_genome(genome: Genome): CodonSequence[][][] {
  const of_chromosome: CodonSequence[][][] = [];
  for (const group of genome) {
    of_chromosome.push(codons_from_hom_group(group));
  }

  return of_chromosome;
}