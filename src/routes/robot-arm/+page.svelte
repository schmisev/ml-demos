<script lang="ts">
	import type { Robot, Workspace } from '$lib/robot';
	import { onMount } from 'svelte';

  const workspace: Workspace = {
    width: 500,
    height: 500,
    obstacles: []
  }

	const robot: Robot = $state({
		base: { x: workspace.width / 2, y: workspace.height },
		chain: [
			{
				j: { kind: 'ROT', init: 0, min: -Math.PI+Math.PI/6, max: -Math.PI/6, value: -Math.PI/4 },
				l: { length: 120, width: 20 }
			},
      {
				j: { kind: 'ROT', init: Math.PI / 5, min: -Math.PI/2, max: Math.PI/2, value: 0 },
				l: { length: 90, width: 15 }
			},
      {
				j: { kind: 'LIN', init: 0, min: 0, max: 100, value: 0 },
				l: { length: 50, width: 5 }
			},
		],
    hand: { radius: 10 }
	});

	// visuals
	let canvas: HTMLCanvasElement;
	onMount(() => {
		canvas.width = 1000;
		canvas.height = 1000;

    let last_time: number = 0;

    function draw(time: number) {
      if (!last_time) {
        last_time = time;
        window.requestAnimationFrame(draw);
      }
      const dt = last_time - time;

      const ctx = canvas.getContext('2d')!;
      ctx.reset();
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const w_buffer = (canvas.width - workspace.width) / 2;
      const h_buffer = (canvas.height - workspace.height) / 2;
      ctx.translate(w_buffer, h_buffer);

      // draw workspace
      ctx.save();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 5;
      ctx.strokeRect(0, 0, workspace.width, workspace.height);
      ctx.restore();

      // drawing base
      let {x, y} = robot.base;
      ctx.fillStyle = "red";
      ctx.fillRect(x-5, y-5, 10, 10);
      ctx.translate(x, y);

      // drawing links
      for (let {j, l} of robot.chain) {
        switch (j.kind) {
          case 'ROT':
            ctx.rotate(j.init);
            // draw cone
            ctx.save()
            ctx.rotate(j.min);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(l.length, 0);
            ctx.stroke();
            ctx.restore();

            ctx.save()
            ctx.rotate(j.max);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(l.length, 0);
            ctx.stroke();
            ctx.restore();

            ctx.rotate(j.value);
            ctx.fillStyle = "blue";
            ctx.fillRect(0, -l.width/2, l.length, l.width)
            ctx.fillStyle = "lightblue";
            ctx.beginPath();
            ctx.ellipse(0, 0, l.width/2 * 1.1, l.width/2 * 1.1, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.translate(l.length, 0);
            break
          case 'LIN':
            ctx.translate(j.init, 0);

            // draw reach
            ctx.save();
            ctx.translate(j.min, 0);
            ctx.beginPath();
            ctx.moveTo(0, -l.width*2);
            ctx.lineTo(0, l.width*2);
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(j.max, 0);
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.translate(j.max, 0);
            ctx.beginPath();
            ctx.moveTo(0, -l.width*2);
            ctx.lineTo(0, l.width*2);
            ctx.stroke();
            ctx.restore();

            ctx.fillStyle = "lightgreen";
            ctx.fillRect(0, -l.width/2, j.value, l.width)
            ctx.translate(j.value, 0);
            ctx.fillStyle = "green";
            ctx.fillRect(0, -l.width/2, l.length, l.width)
            ctx.translate(l.length, 0);
            break
          default:
            // const NEVER: never = j.kind;
        }
      }

      // draw hand
      let {radius} = robot.hand;
      ctx.fillStyle = "orange";
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius, 0, 0, Math.PI * 2);
      ctx.fill();

      window.requestAnimationFrame(draw);
    }

    window.requestAnimationFrame(draw);
	});
</script>

<head>
	<title>Robot Arm</title>
</head>

<div class="flex flex-col gap-2 p-2">
	<div class="flex flex-row items-center gap-5">
		<h1 class="grow">Motion Planning & Control | <a href="../">back</a></h1>
	</div>

  <div class="grid grid-cols-2">
  <div class="flex flex-col items-start">
    {#each robot.chain as {j, l}, i}
    <div class="light-border flex flex-row gap-2">
      <div>Joint {i} : {j.kind}</div>
      {#if j.kind === "ROT"}
        <input type="range" step="0.01" min={j.min} max={j.max} bind:value={j.value}>
      {:else}
        <input type="range" step="0.01" min={j.min} max={j.max} bind:value={j.value}>
      {/if}
      </div>
    {/each}
  </div>

	<canvas class="w-full" bind:this={canvas}></canvas>
  </div>
</div>
