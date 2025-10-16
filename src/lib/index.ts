// place files you want to import through the `$lib` alias in this folder.
export function randint(from: number, to: number): number {
	return Math.floor(rand(from, to));
}

export function rand(from: number, to: number): number {
	return Math.random() * (to - from) + from;
}

export function euclid(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x1-x2)**2 + (y1-y2)**2);
}

export function weight(distance: number) {
  return Math.max(Math.min(100/distance, 1), 0.01);
}