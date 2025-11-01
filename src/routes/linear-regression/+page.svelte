<script lang="ts">
	import { generate_linear_2d_samples, type Dataset2D } from '$lib/linreg';
	import { m_id, m_mat, m_vec, m_zeros, mmult, mprint, mscale, T, type Matrix } from '$lib/matrix';
	import { xml } from 'd3';
	import type p5 from 'p5';
	import { onMount } from 'svelte';
	import { ssrImportKey } from 'vite/module-runner';

	const data = generate_linear_2d_samples(200, 100, 1, 0, 10);

	const L = 400;
	const W = 400;
	const H = 300;

	const weights: Matrix = $state({
		r: 3,
		c: 1,
		$: [[1], [50], [-59]]
	});

	let canvas_container: HTMLDivElement;

	let data_model: p5.Geometry;
  let data_surface: p5.Geometry;

	onMount(async () => {
		const p5_module = await import('p5');
		const p5 = p5_module.default;

		const sketch = (sk: p5) => {
			const build_data = (data: Dataset2D) => {
				// @ts-ignore
				for (const sample of data.samples) {
					sk.push();
					sk.fill(
						255,
						255 * ((sample.y - data.y_min) / data.delta),
						255 * (1 - (sample.y - data.y_min) / data.delta)
					);
					sk.translate(sample.X.x * L, sample.X.y * W, sample.y);
					sk.box(5, 5, 5);
					sk.pop();
				}
			};

      const build_surface = (weights: Matrix) => {
        const step = 0.125;
        for (let x1 = -1; x1 <= 1; x1 += 0.125) {
          for (let x2 = -1; x2 <= 1; x2 += 0.125) {
            const X = m_mat([
              [1, 1, 1, 1], 
              [x1, x1+step, x1, x1+step], 
              [x2, x2, x2+step, x2+step]
            ])

            const y = mmult(T(weights), X);

            sk.push();
            sk.fill("blue");
            sk.quad(
              x1 * L, x2 * W, y.$[0][0],
              x1 * L, x2 * W, y.$[0][1],
              x1 * L, x2 * W, y.$[0][2],
              x1 * L, x2 * W, y.$[0][3],
            )
            sk.pop();
          }
        }
        
      }

      let cam: p5.Camera;

			sk.setup = () => {
				sk.createCanvas(400, 400, 'webgl');
				data_model = sk.buildGeometry(() => build_data(data));
        data_surface = sk.buildGeometry(() => build_surface(weights));
        cam = sk.createCamera();
			};

			sk.draw = () => {

				sk.rotateX(Math.PI / 2);
				sk.orbitControl();
				sk.background('lightblue');
				sk.model(data_model);
        sk.model(data_surface);

        sk.push();
        sk.stroke(255);
        sk.strokeWeight(2);
        sk.line(-1000, 0, 0, 1000, 0, 0);
        sk.line(0, -1000, 0, 0, 1000, 0);
        sk.line(0, 0, -1000, 0, 0, 1000);
        sk.pop();
			};
		};

		new p5(sketch, canvas_container);
	});
</script>

<div class="flex flex-col gap-2 p-2">
	<h1>2D Linear regression | <a href="../">back</a></h1>
	<div bind:this={canvas_container}></div>
	{#each weights.$.entries() as [i, r]}
		<label class="flex flex-row items-center gap-2">
			w{i} =
			<input
				type="range"
				min="-100"
				max="100"
				ondblclick={() => (weights.$[i][0] = 0)}
				bind:value={weights.$[i][0]}
			/>
			= {weights.$[i][0]}
		</label>
	{/each}
</div>
