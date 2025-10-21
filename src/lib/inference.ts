import gamma from "@stdlib/math-base-special-gamma";

export function bernoulli(theta: number, a: number, b: number) {
  return theta**a * (1-theta)**b;
}

export function beta_distro(theta: number, a: number, b: number) {
  return (gamma(a+b) / (gamma(a) * gamma(b))) * bernoulli(theta, a-1, b-1);
}

export function poisson(lambda: number, n: number) {
  return (Math.E ** (-lambda) * lambda**n)/gamma(n);
}

export function gamma_distro(lambda: number, b: number, p: number) {
  return (b**b) / gamma(p) * lambda**(p-1) * Math.E ** (-b*lambda);
}