import { BuechiAutomaton } from '$lib/buechi.svelte';
import { RegexTokenKind, type RegexCharSet, type RegexNode } from './regex';

function set_join(A: Set<string>, B: Set<string>, ignore_empty_word = false, exclude = ["L"]) {
	const joined_set = new Set<string>();

	for (const a of A) {
		for (const b of B) {
      if (ignore_empty_word && (a === "" || b === "")) continue;
			joined_set.add(a + b);
		}
	}

	return joined_set;
}

function set_mult(A: Set<string>, B: Set<string>, ignore_empty_word = false) {
	const joined_set = new Set<string>();

	for (const a of A) {
		for (const b of B) {
      if (ignore_empty_word && (a === "" || b === "")) continue;
			joined_set.add(a + ":" + b);
		}
	}

	return joined_set;
}

const RECURSE = "↺";
const RETURN = "↑";
const LAMBDA = "λ";

export type PDFL = {
	P: Set<string>;
	D: Set<string>;
	F: Set<string>
	L: Set<string>;
}

export function find_pdfl(e: RegexNode): {
	P: Set<string>;
	D: Set<string>;
	F: Set<string>
	L: Set<string>;
} {
	let next = {
		P: new Set<string>(),
		D: new Set<string>(),
		F: new Set<string>(),
		L: new Set<string>()
	};

	switch (e.kind) {
		case 'STAR': {
			let { P, D, F, L } = find_pdfl(e.value);
			next.P = P.union(new Set(['']));
			next.D = D;
			next.F = F.union(set_mult(D, P));
			next.L = L;
      next.L.add('');
			break;
		}
		case 'PLUS': {
			let { P, D, F, L } = find_pdfl(e.value);
			next.P = P;
			next.D = D;
			next.F = F.union(set_mult(D, P));
      next.L = L;
			break;
		}
		case 'ANY':
		case 'CHAR':
			next.P.add(e.alias);
			next.D.add(e.alias);
			break;
    case 'SELF':
      next.P.add(RECURSE + e.alias)
      next.D.add(RETURN + e.alias)
      next.L.add(LAMBDA);
      break;
		case 'CHOICE':
			for (const opt of e.nodes) {
				let { P, D, F, L } = find_pdfl(opt);
				next.P = next.P.union(P);
				next.D = next.D.union(D);
				next.L = next.L.union(L);
				next.F = next.F.union(F);
			}
			break;
		case 'CONCAT':
			let left = find_pdfl(e.left);
			let right = find_pdfl(e.right);
			next.P = left.P.union(set_join(left.L, right.P));
			next.D = right.D.union(set_join(right.L, left.D));
			next.L = set_join(left.L, right.L);
			next.F = next.F.union(left.F).union(right.F).union(set_mult(left.D, right.P, true));
			break;
		case 'EMPTY':
			next.L.add('');
			break;
		default:
			const NEVER: never = e;
	}

	return next;
}

export function delambda(S: Set<string>, has_empty_word: boolean) {
  return new Set(
    has_empty_word 
    ? S.values().map(v => {
      if (v.includes(LAMBDA)) {
        return v.replaceAll(LAMBDA, "");
      } else {
        return v;
      }
    }) 
    : S.values().filter(v => !v.includes(LAMBDA))
  );
}

export function delambla_pdfl(pdfl: PDFL): PDFL {
  let has_empty_word = pdfl.L.size > 0;
  return {
    F: delambda(pdfl.F, has_empty_word),
    L: delambda(pdfl.L, has_empty_word),
    P: delambda(pdfl.P, has_empty_word),
    D: delambda(pdfl.D, has_empty_word),
  }
}

export function make_pdfl_automaton(M: Map<string, RegexCharSet>, pdfl: PDFL): BuechiAutomaton {
  const INIT = "init";
  const transitions = new Map<string, string[]>();
  const {P, D, F, L} = pdfl;

  for (const f of F) {
    const states = f.split(":");
    if (states.length !== 2) continue;

    const [from, to] = states;
    console.log(from, to);

    if (transitions.has(from)) {
      transitions.get(from)!.push(to);
    } else {
      transitions.set(from, [to]);
    }
  }

  const rules: [string, string, string][] = [];
  for (const [s1, s] of transitions.entries()) {
    for (const s2 of s) {
      if (s1[0] === RETURN) {
        for (const d of D) {
          rules.push([ d, s1, s1]);
        }
      }

      if (s2[0] === RECURSE) {
        rules.push([ s1, s2, INIT]);
      } else {
        const trigger = M.get(s2)?.trigger;
        if (!trigger) continue;
        rules.push([s1, trigger, s2]);
      }
    }
  }

  for (const p of P) {
    const trigger = M.get(p)?.trigger;
    if (!trigger) continue;
    rules.push([ INIT, trigger, p ]);
  }

  const accepted = [...D];
  if (L.size > 0) accepted.push(INIT);

  return new BuechiAutomaton(
    INIT,
    accepted,
    ...rules
  );
}