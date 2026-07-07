import { rand_poisson } from "$lib";

export type RateFunction = (queues: number, timestep: number) => number;
export type WaitTime = number;
export interface Queue {
  slots: WaitTime[];
  last_added: number;
  last_done: number;
}
export interface QueueingProcess {
  service_queues: Queue[];
  arrival_rate: RateFunction;
  process_rate: RateFunction;
  timestep: number;
  finished_jobs: number;
  overall_wait_time: WaitTime;
  overall_fill: number;
  overall_throughput: number;
}

function min_queue(q: QueueingProcess) {
  let min_waiting = Infinity;
  let min_queue_index = -1;

  for (let [i, queue] of q.service_queues.entries()) {
    if (queue.slots.length < min_waiting) {
      min_waiting = queue.slots.length;
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
    queue.last_done = 0;
    queue.last_added = 0;
    for (let i = 0; i < queue.slots.length; i++) {
      queue.slots[i]++;
    }
  }

  // adding jobs
  q.overall_throughput += new_jobs;
  for (let job = 0; job < new_jobs; job++) {
    const { min_queue_index } = min_queue(q);
    q.service_queues[min_queue_index].slots.push(0);
    q.service_queues[min_queue_index].last_added += 1
  }

  // finishing jobs
  for (const queue of q.service_queues) {
    
    const mu = q.process_rate(min_waiting, q.timestep);
    const done_jobs = rand_poisson(mu, 1000);
    for (let job = 0; job < done_jobs; job++) {
      if (queue.slots.length <= 0) break;
      const final_wait_time = queue.slots.shift()!;
      q.finished_jobs += 1;
      q.overall_wait_time += final_wait_time;
      queue.last_done += 1;
    }

    q.overall_fill += queue.slots.length;
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
    service_queues: [{slots: [], last_added: 0, last_done: 0}],
    timestep: 0,
    finished_jobs: 0,
    overall_fill: 0, 
    overall_wait_time: 0,
    overall_throughput: 0
  }
}