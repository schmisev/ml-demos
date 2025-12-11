<script lang="ts">
	import { Chart, type ChartConfiguration, type ChartDataset, type ChartItem } from 'chart.js/auto';
	import { onMount } from 'svelte';

	let {
		title,
		datasets,
		aspect_ratio = 1,
		y_scale,
		x_scale,
		labels = []
	}: {
		title: string;
		datasets: ChartDataset[];
		aspect_ratio: number;
		y_scale?: { min: number; max: number };
		x_scale?: { min: number; max: number };
		labels: string[];
	} = $props();

	/** reference for datasets
  [
    {
      label: 'MLE',
      data: [],
      pointRadius: 0,
      pointHoverRadius: 0
    },
    {
      label: 'MAP',
      data: [],
      pointRadius: 0,
      pointHoverRadius: 0
    },
    {
      label: 'Fully Bayesian',
      data: [],
      pointRadius: 0,
      pointHoverRadius: 0
    }
  ]
   */

	let canvas: HTMLCanvasElement;
	let chart: Chart;

	onMount(() => {
		chart = new Chart(canvas, {
			type: 'line',
			options: {
				responsive: true,
				plugins: {
					title: {
						text: title,
						display: true
					}
				},
				aspectRatio: aspect_ratio,
				maintainAspectRatio: false,
				scales: {
					y: y_scale,
					x: x_scale || undefined
				}
			},
			data: {
				labels: labels,
				datasets: datasets
			}
		});
	});

	export function reset_chart() {
		chart.data.labels = [];
		chart.data.datasets.forEach((dataset) => (dataset.data = []));
		chart.update();
	}

	export function update_chart(just_push: boolean, labels: any[], datasets: number[][]) {
		just_push ? chart.data.labels?.push(...labels) : (chart.data.labels = labels);

		chart.data.datasets.forEach((dataset, i) => {
			if (just_push) dataset.data.push(...datasets[i]);
			else dataset.data = datasets[i];
		});

		chart.update();
	}

	export function update_title(title: string) {
		chart.options.plugins!.title!.text = title;
		chart.update();
	}
</script>

<canvas bind:this={canvas}> </canvas>
