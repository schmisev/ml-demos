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
  'safe & bad': `(safe, F, bad, E)
(safe, G, safe, G F)
(safe, G, safe, ~)
I = { <safe, G> }
lambda = { bad -> ERROR }
C = {<bad, E>}
phi = G(-ERROR)
`,
'safe & bad, simple': `(safe, F, bad, E F)
(safe, F, safe, F F)
(safe, F, return, F)
(return, F, return, ~)
(bad, E, bad, E)
I = { <safe, F> }
C = {<bad, E>}
`,
'safe & bad, infinite': `(safe, F, bad, E F)
(safe, F, safe, F F)
(safe, F, return, F)
(bad, E, return, ~)
(return, F, return, ~)
(return, E, return, ~)
I = { <safe, F> }
C = {<bad, E>}
`,
  'back and forth': `(1, 1, 2, 2 1)
(2, 2, 1, 1 2)
I = { <1, 1> }
C = { <1, (1 2)*> }
lambda = { 1 -> GET, 2 -> POST }
phi = G(GET -> F(POST))
`,
  'match brackets': `(1, Z, 1, A Z)
(1, A, 1, A A)
(1, Z, 2, Z)
(1, A, 2, A)
(2, A, 2, ~)
(2, Z, 3, Z)
I = { <1, Z> }
C = { <3, Z> }`,
  'from paper': `(2, 4, 2, 1 2)
(1, 5, 2, 4 3)
(1, 6, 1, ~)
I = { <1, 5>, <1, 6 5 5> }
C = { <2, 1 2 3> }
`,
  'roundabout': `(1, 4, 1, 1 2 3)
(1, 1, 2, ~)
(2, 2, 3, ~)
(3, 3, 1, 4)
I = { <1, 4> }
  `
}


export const LOC_COLOR_CODE: Record<string, string> = {
  "0": "gray",
  "1": "blue",
  "2": "green",
  "3": "orange",
  "4": "purple",
  "bad": "red",
  "safe": "green",
  "return": "purple"
}