import type { NetworkNode } from "./network";

export type SearchHeuristic = (a: NetworkNode, b: NetworkNode) => number;

export function uniform_heuristic(a: NetworkNode, b: NetworkNode) {
  return 0;
}

export function geo_distance(a: NetworkNode, b: NetworkNode) {
  // no heuristic applicable
  if (!a.meta || !a.meta.coord || !b.meta || !b.meta.coord) return 0;

  const {lat: lat1, lon: lon1} = a.meta.coord;
  const {lat: lat2, lon: lon2} = b.meta.coord;
  
  const R = 6371e3;
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const dphi = (lat2-lat1) * Math.PI / 180;
  const dlambda = (lon2-lon1) * Math.PI / 180;

  const A = Math.sin(dphi / 2) * Math.sin(dphi / 2) +
  Math.cos(phi1) * Math.cos(phi2) *
  Math.sin(dlambda / 2) * Math.sin(dlambda / 2);
  const C = 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1-A));

  return R * C / 1000;
}