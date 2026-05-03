<script lang="ts">
	import { onMount, untrack } from "svelte";
	import type { HuiGraph, HuiGraphDefinition } from "./hui-core";
	import { layoutELK } from "./hui-elk";
	import type { ELKConstructorArguments, ElkLayoutArguments } from "elkjs/lib/elk-api";
	import HuiRenderer from "./HuiRenderer.svelte";

    let {
        graphDef = {nodes: [], edges: []},
        settings = {},
        layoutSettings = {},
        name = "elk"
    }: {
        graphDef?: HuiGraphDefinition,
        settings?: ELKConstructorArguments,
        layoutSettings?: ElkLayoutArguments,
        name?: string,
    } = $props();

    const defaultSettings: ELKConstructorArguments = {
        defaultLayoutOptions: {
            "elk.spacing.nodeSelfLoop": "30",
        }
    }

    let graph: HuiGraph | undefined = $state();

    let id = 0;
    function genId() {
        return "" + id++; 
    }

    async function layout() {
        id = 0;
        graph = await layoutELK(graphDef, {...defaultSettings, ...settings}, layoutSettings, genId);
    }

    onMount(() => {
        layout();
    })  

    $effect(() => {
        $state.snapshot(graphDef);
        untrack(layout);
    })
</script>

{#if graph}
{#key graph}
    <HuiRenderer {name} { graph }>
    </HuiRenderer>
{/key}
{/if}