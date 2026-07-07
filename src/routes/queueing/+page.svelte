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
			{#each q.service_queues as queue, i}
				<div class="flex flex-row gap-1 light-border flex-wrap">
          <div>Queue {i}:</div>
          <div class="bg-red-400 w-10 text-center">+{queue.last_added}</div>
          <div class="bg-green-400 w-10 text-center">-{queue.last_done}</div>
					{#each queue.slots.toReversed() as job}
						<div class="bg-black text-white pr-2 pl-2">{job}</div>
					{/each}
				</div>
			{/each}
		</div>

    <div>
      <table>
        <tbody>
        <tr>
            <td class="w-30">Jobs completed:</td>
            <td class="w-60">{q.finished_jobs}</td>
          </tr>
          <tr>
            <td class="w-30">Avg. wait time:</td>
            <td class="w-60">{q.overall_wait_time / q.finished_jobs}</td>
          </tr>
          <tr>
            <td>Avg. filling:</td>
            <td>{q.overall_fill / (q.timestep * q.service_queues.length)}</td>
          </tr>
          <tr>
            <td>Avg. throughput:</td>
            <td>{q.overall_throughput / q.timestep}</td>
          </tr>
          <tr>
            <td>Avg. dwelling:</td>
            <td>{(q.overall_fill / q.service_queues.length) / q.overall_throughput}</td>
          </tr>
        </tbody>
      </table>
    </div>
	</div>
</div>
