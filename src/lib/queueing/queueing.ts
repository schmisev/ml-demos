import { rand_poisson } from "$lib";

export type RateFunction = (queues: number, timestep: number) => number;
export type WaitTime = number;
export interface QueueingProcess {
  service_queues: WaitTime[][];
  arrival_rate: RateFunction;
  process_rate: RateFunction;
  timestep: number;
  finished_jobs: number;
  overall_wait_time: WaitTime;
  overall_fill: number;
}

function min_queue(q: QueueingProcess) {
  let min_waiting = Infinity;
  let min_queue_index = -1;

  for (let [i, queue] of q.service_queues.entries()) {
    if (queue.length < min_waiting) {
      min_waiting = queue.length;
      min_queue_index = i;
    }
  }

  return {
    min_queue_index, min_waiting
  }
}

export function step_queue(q: QueueingProcess) {
  const { min_waiting } = min_queue(q);
  const lambda = q.arrival_rate(min_waiting, q.timestep);
  const new_jobs = rand_poisson(lambda, 1000);

  // wait time update
  for (const queue of q.service_queues) {
    for (let i = 0; i < queue.length; i++) {
      queue[i]++;
    }
  }

  // adding jobs
  for (let job = 0; job < new_jobs; job++) {
    const { min_queue_index } = min_queue(q);
    q.service_queues[min_queue_index].push(0);
  }

  // finishing jobs
  for (const queue of q.service_queues) {
    const mu = q.process_rate(min_waiting, q.timestep);
    const done_jobs = rand_poisson(mu, 1000);
    for (let job = 0; job < mu; job++) {
      if (queue.length <= 0) break;
      const final_wait_time = queue.shift()!;
      q.finished_jobs += 1;
      q.overall_wait_time += final_wait_time;
    }

    q.overall_fill += queue.length;
  }
  q.timestep++;
}

export function CONSTANT_RATE(rate: number): RateFunction {
  return (queues, timestep) => {
    return rate;
  }
}

export function MM1_CONSTANT(): QueueingProcess {
  return {
    arrival_rate: CONSTANT_RATE(8),
    process_rate: CONSTANT_RATE(12),
    service_queues: [[]],
    timestep: 0,
    finished_jobs: 0,
    overall_fill: 0, 
    overall_wait_time: 0
  }
}