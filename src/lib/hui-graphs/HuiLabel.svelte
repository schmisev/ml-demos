<script lang="ts">
	import { onMount } from "svelte";
	import { makeLabel, type HuiEdge, type HuiNode } from "./hui-core";

    let {
        elem,
        labelPadding
    }: {
        elem: HuiEdge | HuiNode,
        labelPadding: number,
    } = $props();

    let container: HTMLDivElement;

    onMount(() => {
        container.appendChild(makeLabel(elem.def));
    })
</script>

<div bind:this={container} style="padding: {labelPadding}px;"></div>