export type HMM_DomainValue = number | string;

export interface HMM_Variable {
  name: string,
  domain: HMM_DomainValue[],
}

export interface HMM_BinaryVariable {
  generators: HMM_Variable[];
}