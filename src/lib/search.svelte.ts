import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import type { GraphLink, GraphNode } from './network';
import { geo_distance, link_weight, no_weight, straight_line_minutes, uniform_heuristic, type SearchHeuristic, type SearchWeight } from './search-heuristics';

export enum SearchResult {
	FAILURE,
	SUCCESS,
	CONTINUE,
	CUTOFF
}

export enum SortSetting {
	NONE,
	SORT,
	SORT_REVERSE
}

interface SearchNode {
	state: GraphNode;
	action: GraphLink | null;
	parent: SearchNode | null;
  real_path_cost: number;
	path_cost: number;
	heuristic: number;
	depth: number;
}

interface BranchNode extends SearchNode {
	branching_factor: number;
}

export abstract class Search {
	reached: SvelteMap<number, SearchNode> = $state(new SvelteMap());
	frontier: Array<SearchNode> = $state([]);
  discovered: Set<number> = new Set();
	branch_roots: SvelteMap<number, BranchNode> = $state(new SvelteMap());

	full_path: Array<SearchNode> = $state([]);
	node_path: Array<number> = $state([]);
	link_path: Array<number> = $state([]);

	init: GraphNode | undefined = $state();
	goal: GraphNode | undefined = $state();
	current: SearchNode | undefined = $state();

	step_count: number = $state(0);
	frontier_size: number = $state(0);
	reached_size: number = $state(0);

	heuristic: SearchHeuristic = $state(uniform_heuristic);
  weight: SearchWeight = $state(link_weight);

	prune(node: SearchNode) {
		while (node) {
			const branch_node = this.branch_roots.get(node.state.node.id);
			if (branch_node) {
				branch_node.branching_factor--;
				if (branch_node.branching_factor <= 1) this.branch_roots.delete(node.state.node.id);
				return; // we stop here
			}
			this.reached.set(node.state.node.id, node);
			if (!node.parent) return;
			node = node.parent;
		}
	}

	frontier_is_empty(): boolean {
		return this.frontier.length <= 0;
	}

	is_in_frontier(id: number): boolean {
		for (const f of this.frontier) {
			if (f.state.node.id === id) return true;
		}
		return false;
	}

	is_in_cycle(id: number): boolean {
		let node = this.current;
		if (!node) throw `No current node!`;
		while (node) {
			if (node.state.node.id === id) return true;
			if (!node.parent) return false;
			node = node.parent;
		}
		return false;
	}

	pop_frontier(): SearchNode {
		const n = this.frontier.shift();
		if (!n) throw `Unchecked, empty frontier!`;
		return n;
	}

	shift_frontier(): SearchNode {
		const n = this.frontier.pop();
		if (!n) throw `Unchecked, empty frontier!`;
		return n;
	}

  push_frontier(node: SearchNode): void {
    this.frontier.push(node);
    this.discovered.add(node.state.node.id);
  }

	is_goal(id: number): boolean {
		return !!this.goal && id === this.goal.node.id;
	}

	// f(n) = g(n) + h(n)
	total_cost(node: SearchNode): number {
		return node.path_cost + node.heuristic;
	}

  real_total_cost(node: SearchNode): number {
    return node.real_path_cost;
  }

	// w + h(x)
	local_cost(link: GraphLink): number {
		return this.weight(link) + this.heuristic(link.to.node, this.goal!.node);
	}

	*expand(presort: SortSetting = SortSetting.NONE): Generator<SearchNode, void, unknown> {
		if (!this.current) throw `Current node is not initialized!`;
		const n = this.current.state;

		let used_links;
		if (presort === SortSetting.SORT) {
			used_links = n.links.toSorted((a, b) => this.local_cost(a) - this.local_cost(b));
		} else if (presort === SortSetting.SORT_REVERSE) {
			used_links = n.links.toSorted((a, b) => this.local_cost(b) - this.local_cost(a));
		} else {
			used_links = n.links;
		}

		for (const link of used_links) {
			yield {
				state: link.to,
				action: link,
				parent: this.current,
				path_cost: this.current.path_cost + this.weight(link),
        real_path_cost: this.current.real_path_cost + link.weight,
				depth: this.current.depth + 1,
				heuristic: this.heuristic(link.to.node, this.goal!.node)
			} satisfies SearchNode;
		}
	}

	start(init_node: GraphNode, goal_node: GraphNode, clear_reached = true): SearchResult {
		this.init = init_node;
		this.current = {
			state: init_node,
			action: null,
			parent: null,
			path_cost: 0,
      real_path_cost: 0,
			depth: 0,
			heuristic: 0
		};
		this.goal = goal_node;
		
    if (clear_reached) {
			this.reached.clear();
			this.step_count = 0;
			this.frontier_size = 0;
			this.reached_size = 0;
		}

		this.reached.set(this.init.node.id, this.current);
		this.frontier = [this.current];
    this.discovered = new Set([this.current.state.node.id]);

		if (this.is_goal(this.current.state.node.id)) return SearchResult.SUCCESS; // solution found
		return SearchResult.CONTINUE;
	}

	trace_path() {
		this.full_path = [];
		this.node_path = [];
		this.link_path = [];

		let node = this.current;

		while (node) {
			this.full_path.push(node);
			this.node_path.push(node.state.node.id);
			if (node.action) {
				this.link_path.push(node.action.link_id);
			}
			if (node.parent) {
				node = node.parent;
			} else break;
		}
	}

	solve(): SearchResult {
		for (let i = 0; i < 10 ** 5; i++) {
			const res = this.step();
			if (res === SearchResult.CONTINUE || res === SearchResult.CUTOFF) continue;
			return res;
		}
		return SearchResult.FAILURE;
	}

	step() {
		const ret = this._step();
		switch (ret) {
			case SearchResult.CONTINUE:
			case SearchResult.CUTOFF:
				this.step_count++;
				break;
			case SearchResult.FAILURE:
			case SearchResult.SUCCESS:
				break;
		}
		if (this.frontier.length > this.frontier_size) this.frontier_size = this.frontier.length;
		if (this.reached.size > this.reached_size) this.reached_size = this.reached.size;
		return ret;
	}

	// to be implemented in algorithm
	abstract _step(): SearchResult;
}

export class BreadthFirstSearch extends Search {
	_step(): SearchResult {
		if (!this.current) throw `No current node selected!`;
		if (this.is_goal(this.current.state.node.id)) return SearchResult.SUCCESS;
		if (this.frontier_is_empty()) return SearchResult.FAILURE;
		this.current = this.pop_frontier();
		for (const child of this.expand()) {
			const state = child.state.node.id;
			if (!this.reached.has(state)) {
				this.reached.set(state, child);
				this.push_frontier(child);
			}
		}
		return SearchResult.CONTINUE;
	}
}

export class DepthFirstSearch extends Search {
	_step(): SearchResult {
		if (!this.current) throw `No current node selected!`;
		if (this.is_goal(this.current.state.node.id)) return SearchResult.SUCCESS;
		if (this.frontier_is_empty()) return SearchResult.FAILURE;
		this.current = this.shift_frontier();
		for (const child of this.expand()) {
			const state = child.state.node.id;
			if (!this.is_in_cycle(state)) {
				// this.reached.set(state, child); // not needed!
				this.push_frontier(child);
			}
		}
		return SearchResult.CONTINUE;
	}
}

export class IterativeDeepeningSearch extends Search {
	until_depth: number = $state(1);
	max_depth: number = Infinity;

	deepen(): SearchResult {
		this.until_depth += 1;
		return super.start(this.init!, this.goal!, false);
	}

	start(init_node: GraphNode, goal_node: GraphNode): SearchResult {
		this.until_depth = 1;
		return super.start(init_node, goal_node);
	}

	_step(): SearchResult {
		if (!this.current) throw `No current node selected!`;
		if (this.is_goal(this.current.state.node.id)) return SearchResult.SUCCESS;
		if (this.frontier_is_empty()) return this.deepen();
		this.current = this.shift_frontier();
		if (this.current.depth >= this.until_depth) return SearchResult.CONTINUE;
		for (const child of this.expand()) {
			const state = child.state.node.id;
			if (!this.is_in_cycle(state)) {
				// this.reached.set(state, child); // not needed!
				this.push_frontier(child);
			}
		}
		return SearchResult.CONTINUE;
	}
}

export class OptimisticLookaheadSearch extends IterativeDeepeningSearch {
	_step(): SearchResult {
		if (!this.current) throw `No current node selected!`;
		if (this.is_goal(this.current.state.node.id)) return SearchResult.SUCCESS;
		if (this.frontier_is_empty()) return this.deepen();
		this.current = this.shift_frontier();
		if (this.current.depth >= this.until_depth) return SearchResult.CONTINUE;
		for (const child of this.expand(SortSetting.SORT_REVERSE)) {
			const state = child.state.node.id;
			if (!this.is_in_cycle(state)) {
				// this.reached.set(state, child); // not needed!
				this.push_frontier(child);
			}
		}
		return SearchResult.CONTINUE;
	}
}

export class OptimisticHeuristicSearch extends OptimisticLookaheadSearch {
	heuristic: SearchHeuristic = geo_distance;
}

export class GreedyHeuristicSearch extends OptimisticHeuristicSearch {
  heuristic: SearchHeuristic = geo_distance;
  weight: SearchWeight = no_weight;
}

export class DeadBranchPruningSearch extends IterativeDeepeningSearch {
	start(init_node: GraphNode, goal_node: GraphNode): SearchResult {
		this.branch_roots.clear();
		return super.start(init_node, goal_node);
	}

	_step(): SearchResult {
		if (!this.current) throw `No current node selected!`;
		if (this.is_goal(this.current.state.node.id)) return SearchResult.SUCCESS;
		if (this.frontier_is_empty()) return this.deepen();
		this.current = this.shift_frontier();
		if (this.current.depth >= this.until_depth) return SearchResult.CUTOFF;
		let child_count = 0;
		for (const child of this.expand(SortSetting.SORT_REVERSE)) {
			const state = child.state.node.id;
			if (!this.is_in_cycle(state) && !this.reached.has(state)) {
				this.push_frontier(child);
				child_count++;
			}
		}
		if (child_count > 1)
			this.branch_roots.set(this.current.state.node.id, {
				...this.current,
				branching_factor: child_count
			});
		else if (child_count === 0) this.prune(this.current);
		return SearchResult.CONTINUE;
	}
}

export class BestFirstSearch extends Search {
	_step(): SearchResult {
		if (!this.current) throw `No current node selected!`;
		if (this.is_goal(this.current.state.node.id)) return SearchResult.SUCCESS;
		if (this.frontier_is_empty()) return SearchResult.FAILURE;
		this.current = this.pop_frontier();
		for (const child of this.expand()) {
			const state = child.state.node.id;
			const reached_node = this.reached.get(state)!;
			if (!reached_node || this.real_total_cost(child) < this.real_total_cost(reached_node)) {
				this.reached.set(state, child);
				this.push_frontier(child);
				this.frontier.sort((a, b) => this.total_cost(a) - this.total_cost(b));
			}
		}
		return SearchResult.CONTINUE;
	}
}

export class BestFirstGreedySearch extends BestFirstSearch {
	heuristic: SearchHeuristic = geo_distance;
  weight: SearchWeight = no_weight;
}

export class AStarSearch extends BestFirstSearch {
	heuristic: SearchHeuristic = geo_distance;
}

export class AStarSearchStraightLineMinutes extends BestFirstSearch {
  heuristic: SearchHeuristic = straight_line_minutes;
}
