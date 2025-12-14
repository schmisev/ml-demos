import { hex } from "$lib";
import * as fmt from "$lib/fmt";
import { col_vec, diag, matrix, MatrixNxM, row_vec } from "./matrix2";

export type HMM_Mode = "predict" | "filter";

export type HMM_Value = number | string | boolean;
export type HMM_ValueTuple = HMM_Value[];

export interface HMM_Variable {
  name: string,
  domain: HMM_Value[];
}

export interface HMM_BinaryVariable {
  encodes: HMM_Value[];
  name: string,
}

function domain_combinations(domain_a: HMM_Value[] | HMM_ValueTuple[], domain_b: HMM_Value[] | HMM_ValueTuple[]): HMM_ValueTuple[] {
  const combs: HMM_ValueTuple[] = [];
  for (const a of domain_a) {
    for (const b of domain_b) {
      // super ugly... there's got to be a better way!
      if (a instanceof Array) {
        if (b instanceof Array) combs.push([...a, ...b]);
        else combs.push([...a, b]);
      } else {
        if (b instanceof Array) combs.push([a, ...b]);
        else combs.push([a, b]);
      }
    }
  }

  return combs;
}

function all_domain_combinations(domains: HMM_Value[][]): HMM_Value[][] {
  if (domains.length === 0) return [];
  let base: HMM_ValueTuple[] = domains.shift()!.map(v => [v]);

  while (domains.length > 0) {
    const next = domains.shift()!;
    base = domain_combinations(base, next);
  }

  return base;
}

export class HMM_Builder {
  bin_hidden_vars: HMM_BinaryVariable[] = [];
  bin_evidence_vars: HMM_BinaryVariable[] = [];
  
  constructor(hidden_vars: HMM_Variable[], evidence_vars: HMM_Variable[]) {
    const collected_hidden_domains = hidden_vars.map((h) => h.domain);
    const hidden_combs = all_domain_combinations(collected_hidden_domains);

    for (const comb of hidden_combs) {
      const new_var: HMM_BinaryVariable = {
        encodes: comb,
        name: `${comb.map(((v, i) => {
          const var_name = hidden_vars[i].name;
          switch (typeof v) {
            case "string":
            case "number":
              return `${var_name}=${v}`;
            case "boolean":
              return (v ? "" : "¬") + var_name;
            default:
              return `${v}`;
          }
        })).join(", ")}`
      }
      this.bin_hidden_vars.push(new_var)
    }

    const collected_evidence_domains = evidence_vars.map((h) => h.domain);
    const evidence_combs = all_domain_combinations(collected_evidence_domains);
    for (const comb of evidence_combs) {
      const new_var: HMM_BinaryVariable = {
        encodes: comb,
        name: `${comb.map(((v, i) => {
          const var_name = hidden_vars[i].name;
          switch (typeof v) {
            case "string":
            case "number":
              return `${var_name}=${v}`;
            case "boolean":
              return (v ? "" : "¬") + var_name;
            default:
              return `${v}`;
          }
        })).join(", ")}`
      }
      this.bin_evidence_vars.push(new_var)
    }
  }
}

export class HiddenMarkovModel {
  var_count: number;
  sensor_count: number;
  
  p0: MatrixNxM;
  p: MatrixNxM;
  f: MatrixNxM;
  p_labels: HMM_BinaryVariable[];

  e: MatrixNxM;
  e_labels: HMM_BinaryVariable[];
  
  p_trace: MatrixNxM[] = [];
  f_trace: MatrixNxM[] = [];
  e_trace: MatrixNxM[] = [];

  T: MatrixNxM;
  H: MatrixNxM;
  
  constructor(
    init_state: MatrixNxM,
    state_labels: HMM_BinaryVariable[],
    transition_model: MatrixNxM,
    sensor_model: MatrixNxM,
    sensor_labels: HMM_BinaryVariable[],
  ) {
    // state
    this.var_count = init_state.rows;
    if (init_state.cols != 1) throw `State has to be 1D vector`;
    this.p0 = init_state.copy();
    this.p = init_state.copy();
    this.f = init_state.copy();

    this.p_trace.push(this.p);
    this.f_trace.push(this.f);

    if (state_labels.length !== this.p.rows)
      throw `Every variable has to be labeled!`;
    this.p_labels = state_labels;
    // transition model
    if (!transition_model.is_square(this.var_count)) 
      throw `T has to be a (${[this.var_count, this.var_count]}) matrix!`;
    this.T = transition_model;
    // sensor model
    this.sensor_count = sensor_model.rows;
    if (sensor_model.cols !== this.var_count) 
      throw `H has to be a (${[this.sensor_count, this.var_count]}) matrix!`;
    this.H = sensor_model;
    if (sensor_labels.length !== this.H.rows)
      throw `Every sensor has to be labeled!`;
    this.e_labels = sensor_labels;
    this.e = matrix(this.sensor_count, 1, []);
  }

  step(): { p: MatrixNxM; e: MatrixNxM; } {
    this.p = this.T.mul(this.p);
    this.p_trace.push(this.p);
    this.e = this.H.mul(this.p);
    this.e_trace.push(this.e);
    return {
      p: this.p,
      e: this.e,
    };
  }

  filter(obs: number[]): { e: MatrixNxM; f: MatrixNxM; } {
    if (obs.length !== this.sensor_count)
      throw `Observation mismatch (${obs.length},1) vs. (${this.H.rows},1)!`
    
    const obs_vec = row_vec(obs); // Sx1
    const O = obs_vec.mul(this.H).diag(); // 1xN => NxN
    this.f = O.mul(this.T).mul(this.f).norm();
    this.f_trace.push(this.f);
    this.e = col_vec(obs);
    this.e_trace.push(this.e);
    return {
      e: this.e,
      f: this.f,
    };
  }

  // printing stuff
  format_prob(kind: "P(x)" | "P(e)" | "P(x|e)") {
    let out = "";
    for (let i = 0; i < this.p_labels.length; i++) {
      const label = this.p_labels[i].name;
      let val;
      switch (kind) {
        case "P(x)": val = this.p; break;
        case "P(e)": val = this.e; break;
        case "P(x|e)": val = this.f; break;
        default:
          const NEVER: never = kind;
      }

      out += `${label}:  ${val!.v(i).toFixed(3)}\n`;
    }
    return out;
  }

  format_graph_for_mermaid(mode: HMM_Mode): string {
    const premable = `flowchart LR`;
    const nodes: string[] = [];
    const conns: string[] = [];
    const styles: string[] = [];

    for (let i = 0; i < this.p_labels.length; i++) {
      let value_label = "";
      switch (mode) {
        case "predict":
          value_label = `p<sub>${i}</sub> = ${fmt.num(this.p.v(i))}`; break;
        case "filter":
          value_label = `f<sub>${i}</sub> = ${fmt.num(this.f.v(i))}`; break;
        default:
          const NEVER: never = mode;
      }

      const node_name = `h${i}(["x<sub>${i}</sub> ≙  (${this.p_labels[i].name}) \n${value_label}"])`;
      nodes.push(node_name);
      nodes.push(`d${i}((x<sub>${i}</sub>))`)

      for (const [j, p] of this.T.row_at(i).entries()) {
        if (p === 0) continue;
        conns.push(`h${i} -->|${p}| h${j}`);
      }
    }

    for (let i = 0; i < this.e_labels.length; i++) {
      let value_label = "";
      switch (mode) {
        case "predict":
        case "filter":
          value_label = `P(e<sub>${i}</sub>) = ${fmt.num(this.e.v(i))}`; break;
        default:
          const NEVER: never = mode;
      }

      const node_name = `e${i}["e<sub>${i}</sub> ≙ (${this.e_labels[i].name})\n${value_label}"]`;
      nodes.push(node_name);

      for (const [j, p] of this.H.row_at(i).entries()) {
        // if (p === 0) continue;
        conns.push(`e${i} -.->|${p}| d${j}`);
      }
    }

    const out = [
      premable,
      ...nodes,
      ...conns,
      ...styles
    ].join("\n");

    return out;
  }
}