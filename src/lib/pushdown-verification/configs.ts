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
