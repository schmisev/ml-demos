<script lang="ts">
	import { MM1_CONSTANT, step_queue } from '$lib/queueing/queueing';
	let q = $state(MM1_CONSTANT());
</script>

<head>
	<title>Queueing</title>
</head>

<div class="flex flex-col gap-2 p-2">
	<div class="flex flex-row gap-5">
		<h1>Queueing | <a href="../">back</a></h1>
	</div>

	<div class="flex flex-col gap-2">
		<div>
			<button class="negative border" onclick={() => step_queue(q)}>Step</button>
		</div>

		<div class="flex flex-col gap-2">
			{#each q.service_queues as queue}
				<div class="flex flex-row gap-1">
					{#each queue.toReversed() as job}
						<div class="light-border">{job}</div>
					{/each}
				</div>
			{/each}
		</div>

		<table>
			<tbody>
				<tr>
					<td>Avg. wait time:</td>
					<td>{q.overall_wait_time / q.finished_jobs}</td>
				</tr>
				<tr>
					<td>Avg. fill:</td>
					<td>{q.overall_fill / (q.timestep * q.service_queues.length)}</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
