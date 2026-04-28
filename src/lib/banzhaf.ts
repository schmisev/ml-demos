


export function banzhaf_indeces(weights: number[], quorum: number) {
  const N = weights.length;
  const C = 2 ** N;
  const index: number[] = new Array<number>(N).fill(0);
  const coalitions = new Array<Set<number>>(C);

  for (let j = 0; j < N; j++) {
    for (let c = 0; c < C; c++) {
      coalitions[c] = new Set();

      let coal_sum = 0;
      let drop_out_sum = 0;
      for (let i = 0; i < N; i++) {
        const i_is_active = c & (1<<i);
        if (i_is_active) {
          const w = weights[i];
          coalitions[c].add(i);
          coal_sum += weights[i];
          if (i !== j) drop_out_sum += weights[i];
        }
      }

      // the election result has changed (it can only turn from success to failure)
      if (coal_sum >= quorum && drop_out_sum < quorum) index[j] += 1;
    }
  }

  // normalize
  const sum = index.reduce((a, b) => a+b, 0);

  return {
    index, 
    normalized: index.map((v) => v / sum),
    coalitions,
    sum,
    C, N
  }
}