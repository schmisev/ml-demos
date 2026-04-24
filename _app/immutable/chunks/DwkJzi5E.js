function r(n,t){n.clear(),f(n,t)}function f(n,t){for(const e of t)n.add(e)}function c(n,t,e){n.clear();for(const[a,o]of t.entries())n.set(o,e[a%e.length])}function _(n,t){return new Map([[n,t]])}function l(n,t,e=`
`,a="↲",o="…"){let s="";for(let i=0;i<n.length;i++)i%t===0&&i>0&&(s+=a+e+o),s+=n[i];return s}export{r as a,f as b,c,l as d,_ as i};
