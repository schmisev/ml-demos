<script lang="ts">
	import { Lexer } from '$lib/markup/frontend/lexer';
	import { TT } from '$lib/markup/frontend/tokens';

	let src = $state('<h1>Hello!</> Some text');
	let lexer = $derived(new Lexer(src));
</script>

<div class="p-2">
  <div>{lexer.errors}</div>
	<textarea class="h-50 w-full" bind:value={src}></textarea>
	<div class="flex flex-row flex-wrap gap-1">
		{#each lexer.tokens as token}
			<div class="flex flex-row flex-wrap border-2">
				<div class="pr-1 pl-1">{token.kind}</div>
				<div class="{token.kind === TT.NewLine ? "bg-red-400" : "bg-blue-300"} pr-1 pl-1 font-mono font-bold">{JSON.stringify(token.content)}</div>
			</div>
		{/each}
	</div>
</div>
