export type Attachor = Base | Link;
export type Attachment = Hand | Link;

export interface Base {
	x: number;
	y: number;
}

export interface Link {
	length: number;
	width: number;
}

export interface Hand {
	radius: number;
}

export type Joint = RotJoint | LinJoint;

export interface RotJoint {
	kind: 'ROT';
	init: number;
	value: number;
	min: number;
	max: number;
}

export interface LinJoint {
	kind: 'LIN';
	init: number;
	value: number;
	min: number;
	max: number;
}

export interface Robot {
	base: Base;
	chain: { j: Joint; l: Link }[];
	hand: Hand;
}

export interface Obstacle {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

export interface Workspace {
	width: number;
	height: number;
	obstacles: Obstacle[];
}