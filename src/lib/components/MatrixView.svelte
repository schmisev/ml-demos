<script lang="ts">
	import { tex } from '$lib/mathjax';
	import type { MatrixND } from '$lib/matrix2';
  import * as fmt from "$lib/fmt";

	let {
		name,
		row_label,
		col_label,
		step_label: transform_index,
    title,
		matrix
	}: {
		name?: string;
		row_label?: string;
		col_label?: string;
		step_label?: string;
    title?: string;
		matrix: MatrixND;
	} = $props();
</script>

<div class="flex flex-col gap-2">
  {#if title}
    <div><h3>{title}</h3></div>
  {/if}

<div class="flex flex-row items-center">
	{#if name}
		{@html tex(name + '=')}
	{/if}

	<table>
		<tbody>
			{#if col_label}
				<tr>
					{#each new Array(matrix.cols) as c, i}
						<td class="bare text-center">
							{#if i >= 0}
								<div class="">
									{col_label}{#if transform_index !== undefined}
										<sub>{transform_index},</sub>
									{/if}{#if matrix.cols > 1}
                    <sub>{i}</sub>
                  {/if}
								</div>
							{:else}
								<div></div>
							{/if}
						</td>
					{/each}
				</tr>
			{/if}
			{#each new Array(matrix.rows) as r, i}
				<tr>
					{#each matrix.row_at(i) as value, j}
						<td class="bare">
							<div
								class="pr-3 pl-3 font-bold text-center"
								class:border-l-2={j === 0}
								class:border-r-2={j === matrix.cols - 1}
								class:rounded-tl-xl={i === 0 && j === 0}
								class:rounded-tr-xl={i === 0 && j === matrix.cols - 1}
								class:rounded-bl-xl={i === matrix.rows - 1 && j === 0}
								class:rounded-br-xl={i === matrix.rows - 1 && j === matrix.cols - 1}
							>
								{fmt.num(value)}
							</div>
						</td>
					{/each}
          {#if row_label}
						<td class="bare"
							>{row_label}{#if transform_index !== undefined}
								<sub>{transform_index}+1,</sub>
							{/if}{#if matrix.rows > 1}
                <sub>{i}</sub>
              {/if}</td
						>
					{/if}
				</tr>
			{/each}
      {#if col_label}
        <tr><td class="bare">&nbsp;</td></tr>
      {/if}
		</tbody>
	</table>
</div>
</div>