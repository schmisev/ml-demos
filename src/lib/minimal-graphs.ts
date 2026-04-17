
/*
 * 0 ab 1 (from 0 to 1 via a | b)
 * i: initial state
 * q: end state
 */

import type { SvelteSet } from "svelte/reactivity";
import { BuechiAutomaton } from "./buechi.svelte";
import type { HuiGraphDefinition } from "./hui-graphs/hui-core";

enum ParseMode {
  NODE,
  CHAR,
  CTRL
}

export interface Transition {
  from: string,
  to: string,
  on: Set<string>,
}

export interface MinGraph {
  S: Set<string>; 
  T: Transition[];
  Q: Set<string>;
  I: Set<string>;
}

function is_alpha(ch?: string) {
  if (!ch) return false;
  return ch.toLowerCase() !== ch.toUpperCase();
}

function is_numeric(ch?: string) {
  if (!ch) return false;
  return "0123456789".includes(ch);
}

export function min_graph(src: string): MinGraph {
  let mode: ParseMode = ParseMode.NODE;
  let index = 0;

  let start: string | undefined;
  let end: string | undefined;
  let transition: Set<string> = new Set();

  let T: Transition[] = [];
  let S: Set<string> = new Set();
  let I: Set<string> = new Set();
  let Q: Set<string> = new Set();

  function make_transition() {
    if (start) S.add(start);
    if (end) S.add(end);
    if (!start || !end) {
      swap();
      return;
    }

    T.push({
      from: start,
      to: end,
      on: transition
    })

    swap();
  }

  function swap() {
    start = end;
    end = undefined;
    transition = new Set();
  }

  function reset() {
    start = undefined;
    end = undefined;
    transition = new Set();
  }

  function is(chs: string[]) {
    if (!at()) return false;
    return chs.includes(at());
  }

  function at() {
    return src[index];
  }

  function done() {
    return index >= src.length;
  }

  function read() {
    return src[index++];
  }

  function skip_whitespace() {
    while (!done() && is([" ", "\n", "\r", "\t"])) read();
  }

  function err(msg: string) {
    return new Error(msg);
  }

  loop: while (!done()) {
    skip_whitespace();
    if (is(["#"])) {
      while(!done() && !is(["\n"])) read();
    }
    skip_whitespace();
    if (done()) break;
    
    switch (mode) {
      case ParseMode.NODE:
        let isInitial = false;
        let isTerminal = false;
        while (is(["*", "+"])) {
          const ctrl = read();
          if (ctrl === "*") isInitial = true;
          else if (ctrl === "+") isTerminal = true;
        }

        if (is_numeric(at())) {
          end = read();
          while(!done() && is_numeric(at())) {
            end += read();
          }
          if (isInitial) I.add(end);
          if (isTerminal) Q.add(end);
          make_transition();
          mode = ParseMode.CHAR;
          continue loop;
        }
        throw err(`Expected Node [0-9] or ';', got '${at()}'`);
      case ParseMode.CHAR:
        if (is(["*", "+"]) || is_numeric(at())) {
          mode = ParseMode.NODE;
          continue loop;
        } else if (is_alpha(at())) {
          transition.add(read());
          continue loop;
        } else if (is([";"])) {
          read();
          reset();
          mode = ParseMode.NODE;
          continue loop;
        }
        throw err(`Expected Node [0-9] or Char [a-zA-Z], got '${at()}'`);
    }
  }

  return {
    S, T, Q, I
  }
}

export function min_hui_graph(g: MinGraph, current: SvelteSet<string>): HuiGraphDefinition {
  const graph: HuiGraphDefinition = {
    edges: [],
    nodes: []
  }

  for (const s of g.S) {
    graph.nodes.push({
      id: "v" + s,
      label: s,
      labelClasses: ["hui", "node", g.Q.has(s) ? "double-ellipse" : "ellipse", current.has(s) ? "positive" : "neutral"]
    });
  }

  for (const [i, t] of g.T.entries()) {
    graph.edges.push({
      id: "e" + i,
      fromId: "v" + t.from,
      toId: "v" + t.to,
      label: [...t.on.values()].join(","),
    })
  }

  for (const [i, s] of g.I.entries()) {
    graph.nodes.push({
      id: "i" + s,
      label: "",
    })

    graph.edges.push({
      id: "o" + s,
      fromId: "i" + s,
      toId: "v" + s,
    })
  }

  return graph;
}

export function min_automaton(g: MinGraph): BuechiAutomaton {
  const actions: [string, string, string][] = [];

  for (const t of g.T) {
    for (const trigger of t.on) {
      actions.push([t.from, trigger, t.to]);
    }
  }
  
  return new BuechiAutomaton(
    [...g.I.values()],
    [...g.Q.values()],
    ...actions
  )
}