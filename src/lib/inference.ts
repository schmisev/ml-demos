import gamma from "@stdlib/math-base-special-gamma";

export function bernoulli(theta: number, a: number, b: number) {
  return theta**a * (1-theta)**b;
}

export function beta_distro(theta: number, a: number, b: number) {
  return (gamma(a+b) / (gamma(a) * gamma(b))) * bernoulli(theta, a-1, b-1);
}

