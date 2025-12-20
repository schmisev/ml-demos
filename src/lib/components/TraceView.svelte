<script lang="ts">
	import * as fmt from '$lib/fmt';
	import type { HiddenMarkovModel, HMM_Mode } from '$lib/hmm.svelte';
	import MatrixView from './MatrixView.svelte';
	import RightArrow from '$lib/images/right-arrow.svg';
  import UpCaret from '$lib/images/up-caret.svg';
  import DownCaret from '$lib/images/down-caret.svg';

	let {
		model
	}: {
		model: HiddenMarkovModel;
	} = $props();

  let container: HTMLDivElement;
  let N = $derived(model.f_trace.length);
	let f_MLE = $derived([...model.most_likely_f()]);
	let e_MLE = $derived([...model.most_likely_e()]);
  let s_MLE = $derived([...model.most_likely_s()]);

  function scroll_to_bottom() {
    container.scroll({left: container.scrollWidth, behavior: 'smooth'});
  }

  $effect(() => {
    $state.snapshot(N);
    scroll_to_bottom();
  })

  function mode_color_picker(mode: HMM_Mode) {
    switch (mode) {
      case 'filter':
        return "positive"
      case 'backward':
        return "special";
      case 'init':
      case 'predict':
        return ""
    }
    return "";
  }
</script>

<div bind:this={container} class="w-full overflow-x-scroll">
	<div class="flex flex-row items-center p-2">
		{#each new Array(N) as _, i}
			{#if i > 0}
				<div><img class="w-7 min-w-7" src={RightArrow} alt="→" /></div>
			{/if}
			<div class="min-w-max">
        <div>t = {i}</div>
				<div class="flex flex-col items-center gap-1 border { mode_color_picker(f_MLE[i].mode) }">
					<div>{f_MLE[i].name}</div>
					<div>p = {fmt.num(f_MLE[i].prob)}</div>
          {#if s_MLE[i]}
            <div class="flex flex-col items-center border special">
              {#if s_MLE[i].name !== f_MLE[i].name}
                <div>{s_MLE[i].name}</div>
              {/if}
							<div>p = {fmt.num(s_MLE[i].prob)}</div>
						</div>
          {/if}
					{#if e_MLE[i]}
            {#if e_MLE[i].mode === "predict"}
              <img class="w-5" alt="v" src={DownCaret}>
            {:else}
              <img class="w-5" alt="^" src={UpCaret}>
            {/if}
            <div class="flex flex-col items-center light-border">
							<div>{e_MLE[i].name}</div>
							<div>p = {fmt.num(e_MLE[i].prob)}</div>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
