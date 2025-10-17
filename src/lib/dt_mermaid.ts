import mermaid from 'mermaid';
mermaid.initialize({
	startOnLoad: false,
  theme: "neutral",
});

import type { DT_Node } from './dt';

export async function render_DT(element_id: string, decision_tree: DT_Node, colors: [string, string][], pruned: boolean, show_id = true): Promise<string> {
	let id = 0;

	function id_provider() {
		return `n${id++}`;
	}

  let styles = colors.map((c, i) => `classDef c${i} stroke:${c[0]}, fill:${c[1]}, stroke-width:2\nclassDef d${i} stroke:${c[0]}, stroke-width:2`);
	let nodes: string[] = [];
	let connections: string[] = [];

	function render_DT_Node(node: DT_Node): string {
		const node_id = id_provider();
    switch (node.kind) {
			case 'decision':
        if (node.severed && pruned) {
          nodes.push(`${node_id}[${node.fallback_choice.chosen_category} ✂️]:::c${node.fallback_choice.chosen_category}`);
          return node_id;
        }

				nodes.push(`${node_id}(${node.feature} < ${node.value.toFixed(3)}):::d${node.fallback_choice.chosen_category}`);
        connections.push(`${node_id} -->|true| ${render_DT_Node(node.left)}`);
        connections.push(`${node_id} -->|false| ${render_DT_Node(node.right)}`);
        return node_id;
			case 'choice':
        nodes.push(`${node_id}[${node.chosen_category}]:::c${node.chosen_category}`);
        return node_id;
		}
	}

  render_DT_Node(decision_tree);

	const graph_def = `flowchart TD\n${nodes.join("\n")}\n${connections.join("\n")}\n${styles.join("\n")}`;
	const { svg } = await mermaid.render(element_id, graph_def);
  return svg;
}
