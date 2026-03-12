import type { HuiGraphDefinition } from "./hui-core";

export function convertAnyToGraph(obj: any, name?: string, settings?: { whitelist?: string[], blacklist?: string[], chainArrays?: boolean, useToString?: boolean }): HuiGraphDefinition {
    let { whitelist, blacklist, chainArrays, useToString } = settings || {};

    const graph: HuiGraphDefinition = {
        edges: [],
        nodes: []
    }

    let id = 0;
    function genId() {
        return "id" + id++;
    }

    let foundObjs = new Set<any>();

    function allowed(name?: string): boolean {
        if (!name) return true;
        if (whitelist !== undefined) {
            return whitelist.includes(name);
        }
        else if (blacklist !== undefined) {
            return !blacklist.includes(name);
        }
        return true;
    }

    function treeConn(id: string, obj: any) {
        for (const name in obj) {
            const attr = obj[name];
            let label: undefined | string = name;
            switch (typeof attr) {
                case "symbol":
                case "undefined":
                case "function":
                    break;
                case "object":
                    label = undefined;
                case "string":
                case "number":
                case "bigint":
                case "boolean":
                    if (!allowed(name)) continue;
                    const nextId = genId();
                    graph.edges.push({ fromId: id, toId: nextId, label });
                    expand(nextId, attr, name);
                    break;
            }
        }
    }

    function chainConn(id: string, obj: any) {
        let lastId = id;
        for (const [i, attr] of obj.entries()) {
            switch (typeof attr) {
                case "symbol":
                case "undefined":
                case "function":
                    break;
                case "string":
                case "number":
                case "bigint":
                case "boolean":
                case "object":
                    if (!allowed(i)) continue;
                    const nextId = genId();
                    graph.edges.push({ fromId: lastId, toId: nextId, label: `${i}`, arrowWidth: 7, arrowEnd: "none" });
                    lastId = nextId;
                    console.log(lastId);
                    expand(nextId, attr, `${i}`);
                    break;
            }

        }
    }

    function expand(id: string, obj: any, name?: string) {
        switch (typeof obj) {
            case "symbol":
            case "undefined":
            case "function":
                break;
            case "string":
            case "number":
            case "bigint":
            case "boolean": {
                graph.nodes.push({ id, label: `${obj}` });
                break;
            }
            case "object": {
                if (foundObjs.has(obj)) break;
                foundObjs.add(obj);
                let label = name || "*";
                if (useToString) {
                    if ("toString" in obj && typeof obj.toString === "function") {
                        label = `${obj.toString()}`;
                    } else {
                        label = `*`;
                    }
                } else if (name) {
                    label = name;
                }

                graph.nodes.push({ id, label });

                if (obj instanceof Array && chainArrays) chainConn(id, obj); else treeConn(id, obj);
                break;
            }
        }
    }

    expand(genId(), obj, name);

    return graph;
}

export function junction(label: HTMLElement | string, children: any) {
    return {
        ...children,
        toString: () => { return label }
    }
}