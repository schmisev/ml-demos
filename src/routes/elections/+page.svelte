<script lang="ts">
	import { banzhaf_indeces } from "$lib/banzhaf";

  let names = $state(["F", "D", "I", "B", "NL", "L"])
  let weights = $state([4, 4, 4, 2, 2, 1]);
  let quorum = $state(12);
  let banzhaf = $derived(banzhaf_indeces(weights, quorum));
</script>

<head>
  <title>Banzhaf</title>
</head>

<div class="flex flex-col gap-2 p-2">
	<h1>Banzhaf indices | <a href="../">back</a></h1>

  <div>
    <h3>Weights</h3>
    <div class="flex flex-row gap-1">
      <button class="border w-13" onclick={() => {weights.push(1); names.push("")}}>+</button>
      <button class="border w-13" onclick={() => {weights.pop(); names.pop()}}>-</button>
      {#each weights as w, i}
        <div class="flex flex-col gap-0">
        <input type="text" class="shrink w-20 bg-blue-200" bind:value={names[i]}>
        <input type="number" class="shrink w-20" bind:value={weights[i]}>
        </div>
      {/each}
    </div>
    <h3>Quorum</h3>
    <input type="number" class="w-20" bind:value={quorum}>
  </div>

  <div>
    <table>
      <tbody>
        <tr>
          <th>i</th>
          <th>w<sub>i</sub></th>
          <th>Banzhaf index</th>
          <th>Normalized</th>
        </tr>
        {#each new Array(banzhaf.N) as _, i}
          <tr>
            <td>S<sub>{i+1}</sub></td>
            <td>{weights[i]}</td>
            <td>{banzhaf.index[i]} / {banzhaf.sum}</td>
            <td>{banzhaf.normalized[i].toFixed(2)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div>
    <h3>Coalitions</h3>
    <table>
      <tbody>
        <tr>
          <th>c</th>
          <th>sum(T)</th>
          <th colspan={banzhaf.N}>T</th>
          {#each weights as w, i}
            {#if names[i]}
              <th>T\{names[i]}</th>
            {:else}
              <th>T\S<sub>{i}</sub></th>
            {/if}
          {/each}
        </tr>
        {#each banzhaf.coalitions as coal, c}
          {@const c_sum = coal.values().map(i => weights[i]).reduce((a, b) => a+b, 0)}
          <tr>
            <td>c<sub>{c}</sub></td>
            <td class="{c_sum >= quorum ? "bg-green-300" : "bg-red-300"}">{c_sum}</td>
            {#each coal as i}
              {#if names[i]}
                <td>{names[i]}</td>
              {:else}
                <td>S<sub>{i}</sub></td>
              {/if}
            {/each}
            {#if banzhaf.N - coal.size > 0}
              <td class="bg-gray-400" colspan={banzhaf.N - coal.size}></td>
            {/if}

            {#each weights as w, i}
              {#if coal.has(i)}
                {@const adj_sum = c_sum - w}
                {@const mismatch = (adj_sum >= quorum) !== (c_sum >= quorum)}
                <td class="{adj_sum >= quorum ? "bg-green-300" : mismatch ? "bg-blue-300" : "bg-red-300"}">{adj_sum} {mismatch ? "↺" : ""}</td>
              {:else}
                <td class="bg-black"></td>
              {/if}
              
            {/each}
          </tr>
        {/each}
        <tr>
          <th colspan={2 + banzhaf.N}>Reversed (↺):</th>
          {#each banzhaf.index as i}
            <td>{i}</td>
          {/each}
        </tr>
      </tbody>
    </table>
  </div>
</div>