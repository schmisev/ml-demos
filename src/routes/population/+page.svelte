<script lang="ts">
	import { get_keys } from '$lib';
	import {
		logistic,
		lotka_volterra,
		malthus,
		simulate_timestep,
		verhulstian,
		type PopModel,
		type PopRule
	} from '$lib/population/pop.svelte';
	import ApexCharts, { type ApexAxisChartSeries, type ApexOptions } from 'apexcharts';
	import {} from 'apexcharts';
	import { onMount } from 'svelte';

	let model: PopModel = $state({
		history: [[200, 100, 100]],
		pops: [
			{
        name: "Blorbos",
				type: 'prey',
				birth_rate: 1,
				birth_penalty: 0.001,
				death_penalty: 0.04,
				death_rate: 0.1,
				displacement: 0.0
			},
			{
        name: "Bubas",
				type: 'prey',
				birth_rate: 0.9,
				birth_penalty: 0.02,
				death_penalty: 0.001,
				death_rate: 0.1,
				displacement: 0.0
			},
			{
        name: "Griggies",
				type: 'predator',
				birth_rate: 0.01,
				birth_penalty: 0.007,
				death_penalty: 0.0009,
				death_rate: 0.8,
				displacement: 0.0
			}
		],
		times: [0]
	});

	let dt = $state(0.1);
	let rule: PopRule = logistic;
	const available_rules = {
		malthus: malthus,
		'lotka-volterra': lotka_volterra,
		verhulstian: verhulstian,
		logistic: logistic
	};

	function step() {
		simulate_timestep(model, rule, dt);
		chart.updateOptions(options);
	}

	let options: ApexOptions = $derived({
		chart: {
			type: 'line'
		},
		series: model.pops.map((p, i) => {
			return {
				name: p.name,
				data: model.history.map((h) => h[i])
			};
		}),
		xaxis: {
			type: 'numeric',
			categories: model.times,
      max: 10
		},
		yaxis: {
			type: 'numeric',
			decimalsInFloat: 0,
			min: 0,
      max: 2000
		}
	});

	let chart_div: HTMLDivElement;
	let chart: ApexCharts;

	onMount(() => {
		chart = new ApexCharts(chart_div, options);
		chart.render();
	});
</script>

<head>
	<title>Population simulation</title>
</head>

<div class="flex flex-col gap-2 p-2">
	<div class="flex flex-row gap-5">
		<h1>Population Simulation | <a href="../">back</a></h1>
	</div>

	<div class="flex flex-col gap-2">
		<div class="flex flex-row flex-wrap gap-2">
			<select bind:value={rule}>
				{#each Object.entries(available_rules) as [rule_name, rule]}
					<option value={rule}>{rule_name}</option>
				{/each}
			</select>
			<button class="border" onclick={step}>Step</button>
		</div>
		<div>
			<div bind:this={chart_div}></div>
		</div>
	</div>
</div>
