<script lang="ts">
	import { Creature } from '$lib/gen-sim/gen-creature.svelte';
	import {
		codons_from_genome,
		codons_from_rna,
		END_CODONES,
		nucl_compl,
		rand_genome,
		START_CODONES
	} from '$lib/gen-sim/gen-sim';

	let genome = $state(rand_genome(5, 100, 500, 2));
	let codon_sequences = $derived(codons_from_genome(genome));
</script>

<head>
	<title>Genetic sim</title>
</head>

<div class="flex flex-col gap-2 p-2">
	<h1>Genetic sim | <a href="../">back</a></h1>

	<div class="font-mono">
		{#each genome as hom_group, h}
			<div class="light-border flex flex-col gap-1">
        <h2>Chromosome pair #{h+1}</h2>
				{#each hom_group as chromosome, c}
					<div class="rounded-md border-1 p-2">
						<div class="wrap-anywhere">
							{#each chromosome as nucleotide, n}
								{nucleotide}
							{/each}
						</div>
						<div class="border-t-1 p-2 flex flex-row gap-2 flex-wrap">
							{#each codon_sequences[h][c] as sequence, s}
								<div class="flex flex-row flex-wrap gap-1">
									<div class="flex flex-row overflow-hidden rounded-3xl border-1 pr-2 pl-2">
										{#each sequence.seq as cod, j}
											<div
												class={START_CODONES.includes(cod)
													? 'bg-green-300'
													: END_CODONES.includes(cod)
														? 'bg-red-300'
														: j % 2 === 0
															? 'bg-blue-200'
															: ''}
											>
												{cod}
											</div>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>
