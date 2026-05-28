import type { Configuration, Transition } from './pds.svelte';

type PDS_Definition = [Configuration[], Transition[]];

export const demo: PDS_Definition = [
	[
		{ loc: '1', w: ['5'] },
		{ loc: '2', w: ['4'] }
	],
	[
		['2', '4', '2', ['1', '2']],
		['1', '5', '2', ['4', '3']],
		['1', '6', '1', []]
	]
];

export const paper_1: PDS_Definition = [
	[{ loc: '1', w: ['1'] }],
	[
		['1', '1', '1', ['1', '1']],
		['1', '1', '2', ['2']],
		['2', '2', '1', []],
	]
];


export const PDS_EXAMPLES = {
  'back and forth': `(1, 1, 2, 2 1)
(2, 2, 1, 1 2)
I = { <1, 1> }
C = { <1, (1 2)*> }
`,
  'match brackets': `(1, Z, 1, A Z)
(1, A, 1, A A)
(1, Z, 2, Z)
(1, A, 2, A)
(2, A, 2, ~)
(2, Z, 3, Z)
I = { <1, Z> }
C = { <2, A*Z>, <1, A|Z> }`,
  'from paper': `(2, 4, 2, 1 2)
(1, 5, 2, 4 3)
(1, 6, 1, ~)
I = { <1, 5>, <1, 6 5 5> }
C = { <2, 1 2 3> }
`,
}