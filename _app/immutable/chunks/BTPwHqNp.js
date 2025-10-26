import{w as $0,k as P0,b0 as _0,q as _r,l as C,$ as T0,m as U0,g as Zi,aP as G0,n as W0,H as D0,o as Yi,v as hr,C as tr,Y as B0,az as C0,x as Gi,z as X0,b1 as vr,b2 as fr,y as J,ad as ki,aX as V0,a8 as Qi,ax as h0,as as K0,A as q0,B as Z0,b3 as Y0,b4 as qr,I as k0,a4 as b0,b5 as Q0,_ as z0,b6 as J0,aw as x0,b7 as j0,ae as rv,aZ as p0,aL as ev,G as R0,F as m0,b8 as av}from"./CNKsMUl4.js";function xo(r,e){return e}function iv(r,e,i){for(var a=r.items,n=[],t=e.length,v=0;v<t;v++)J0(e[v].e,n,!0);var f=t>0&&n.length===0&&i!==null;if(f){var o=i.parentNode;x0(o),o.append(i),a.clear(),D(r,e[0].prev,e[t-1].next)}j0(n,()=>{for(var c=0;c<t;c++){var l=e[c];f||(a.delete(l.k),D(r,l.prev,l.next)),b0(l.e,!f)}})}function jo(r,e,i,a,n,t=null){var v=r,f={flags:e,items:new Map,first:null},o=(e&_0)!==0;if(o){var c=r;v=C?_r(T0(c)):c.appendChild($0())}C&&U0();var l=null,b=!1,m=new Map,u=G0(()=>{var $=i();return K0($)?$:$==null?[]:h0($)}),_,s;function d(){nv(s,_,f,m,v,n,e,a,i),t!==null&&(_.length===0?l?q0(l):l=Gi(()=>t(v)):l!==null&&Z0(l,()=>{l=null}))}P0(()=>{s??=rv,_=Zi(u);var $=_.length;if(b&&$===0)return;b=$===0;let R=!1;if(C){var y=W0(v)===D0;y!==($===0)&&(v=Yi(),_r(v),hr(!1),R=!0)}if(C){for(var M=null,g,L=0;L<$;L++){if(tr.nodeType===B0&&tr.data===C0){v=tr,R=!0,hr(!1);break}var h=_[L],A=a(h,L);g=Wi(tr,f,M,null,h,A,L,n,e,i),f.items.set(A,g),M=g}$>0&&_r(Yi())}if(C)$===0&&t&&(l=Gi(()=>t(v)));else if(X0()){var F=new Set,q=J;for(L=0;L<$;L+=1){h=_[L],A=a(h,L);var p=f.items.get(A)??m.get(A);p?(e&(vr|fr))!==0&&I0(p,h,L,e):(g=Wi(null,f,null,null,h,A,L,n,e,i,!0),m.set(A,g)),F.add(A)}for(const[I,N]of f.items)F.has(I)||q.skipped_effects.add(N.e);q.add_callback(d)}else d();R&&hr(!0),Zi(u)}),C&&(v=tr)}function nv(r,e,i,a,n,t,v,f,o){var c=(v&Q0)!==0,l=(v&(vr|fr))!==0,b=e.length,m=i.items,u=i.first,_=u,s,d=null,$,R=[],y=[],M,g,L,h;if(c)for(h=0;h<b;h+=1)M=e[h],g=f(M,h),L=m.get(g),L!==void 0&&(L.a?.measure(),($??=new Set).add(L));for(h=0;h<b;h+=1){if(M=e[h],g=f(M,h),L=m.get(g),L===void 0){var A=a.get(g);if(A!==void 0){a.delete(g),m.set(g,A);var F=d?d.next:_;D(i,d,A),D(i,A,F),br(A,F,n),d=A}else{var q=_?_.e.nodes_start:n;d=Wi(q,i,d,d===null?i.first:d.next,M,g,h,t,v,o)}m.set(g,d),R=[],y=[],_=d.next;continue}if(l&&I0(L,M,h,v),(L.e.f&qr)!==0&&(q0(L.e),c&&(L.a?.unfix(),($??=new Set).delete(L))),L!==_){if(s!==void 0&&s.has(L)){if(R.length<y.length){var p=y[0],I;d=p.prev;var N=R[0],S=R[R.length-1];for(I=0;I<R.length;I+=1)br(R[I],p,n);for(I=0;I<y.length;I+=1)s.delete(y[I]);D(i,N.prev,S.next),D(i,d,N),D(i,S,p),_=p,d=S,h-=1,R=[],y=[]}else s.delete(L),br(L,_,n),D(i,L.prev,L.next),D(i,L,d===null?i.first:d.next),D(i,d,L),d=L;continue}for(R=[],y=[];_!==null&&_.k!==g;)(_.e.f&qr)===0&&(s??=new Set).add(_),y.push(_),_=_.next;if(_===null)continue;L=_}R.push(L),d=L,_=L.next}if(_!==null||s!==void 0){for(var P=s===void 0?[]:h0(s);_!==null;)(_.e.f&qr)===0&&P.push(_),_=_.next;var E=P.length;if(E>0){var w=(v&_0)!==0&&b===0?n:null;if(c){for(h=0;h<E;h+=1)P[h].a?.measure();for(h=0;h<E;h+=1)P[h].a?.fix()}iv(i,P,w)}}c&&k0(()=>{if($!==void 0)for(L of $)L.a?.apply()}),r.first=i.first&&i.first.e,r.last=d&&d.e;for(var T of a.values())b0(T.e);a.clear()}function I0(r,e,i,a){(a&vr)!==0&&ki(r.v,e),(a&fr)!==0?ki(r.i,i):r.i=i}function Wi(r,e,i,a,n,t,v,f,o,c,l){var b=(o&vr)!==0,m=(o&Y0)===0,u=b?m?V0(n,!1,!1):Qi(n):n,_=(o&fr)===0?v:Qi(v),s={i:_,v:u,k:t,a:null,e:null,prev:i,next:a};try{if(r===null){var d=document.createDocumentFragment();d.append(r=$0())}return s.e=Gi(()=>f(r,u,_,c),C),s.e.prev=i&&i.e,s.e.next=a&&a.e,i===null?l||(e.first=s):(i.next=s,i.e.next=s.e),a!==null&&(a.prev=s,a.e.prev=s.e),s}finally{}}function br(r,e,i){for(var a=r.next?r.next.e.nodes_start:i,n=e?e.e.nodes_start:i,t=r.e.nodes_start;t!==null&&t!==a;){var v=z0(t);n.before(t),t=v}}function D(r,e,i){e===null?r.first=i:(e.next=i,e.e.next=i&&i.e),i!==null&&(i.prev=e,i.e.prev=e&&e.e)}function r1(r,e,i=e){var a=new WeakSet;p0(r,"input",async n=>{var t=n?r.defaultValue:r.value;if(t=pr(r)?Rr(t):t,i(t),J!==null&&a.add(J),await ev(),t!==(t=e())){var v=r.selectionStart,f=r.selectionEnd,o=r.value.length;if(r.value=t??"",f!==null){var c=r.value.length;v===f&&f===o&&c>o?(r.selectionStart=c,r.selectionEnd=c):(r.selectionStart=v,r.selectionEnd=Math.min(f,c))}}}),(C&&r.defaultValue!==r.value||R0(e)==null&&r.value)&&(i(pr(r)?Rr(r.value):r.value),J!==null&&a.add(J)),m0(()=>{var n=e();if(r===document.activeElement){var t=av??J;if(a.has(t))return}pr(r)&&n===Rr(r.value)||r.type==="date"&&!n&&!r.value||n!==r.value&&(r.value=n??"")})}function e1(r,e,i=e){p0(r,"change",a=>{var n=a?r.defaultChecked:r.checked;i(n)}),(C&&r.defaultChecked!==r.checked||R0(e)==null)&&i(r.checked),m0(()=>{var a=e();r.checked=!!a})}function pr(r){var e=r.type;return e==="number"||e==="range"}function Rr(r){return r===""?null:+r}function tv(r){return r&&r.__esModule&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var mr,zi;function uv(){if(zi)return mr;zi=1;function r(e){return e!==e}return mr=r,mr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ir,Ji;function ur(){if(Ji)return Ir;Ji=1;var r=uv();return Ir=r,Ir}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Lr,xi;function vv(){if(xi)return Lr;xi=1;var r=Math.floor;return Lr=r,Lr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ar,ji;function or(){if(ji)return Ar;ji=1;var r=vv();return Ar=r,Ar}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var gr,rn;function fv(){if(rn)return gr;rn=1;var r=or();function e(i){return r(i)===i}return gr=e,gr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Er,en;function Di(){if(en)return Er;en=1;var r=fv();return Er=r,Er}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var yr,an;function ov(){return an||(an=1,yr=Number),yr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Mr,nn;function sv(){if(nn)return Mr;nn=1;var r=ov();return Mr=r,Mr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Nr,tn;function Y(){if(tn)return Nr;tn=1;var r=sv(),e=r.NEGATIVE_INFINITY;return Nr=e,Nr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Sr,un;function lv(){if(un)return Sr;un=1;var r=Y();function e(i){return i===0&&1/i===r}return Sr=e,Sr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Or,vn;function cv(){if(vn)return Or;vn=1;var r=lv();return Or=r,Or}/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var wr,fn;function dv(){if(fn)return wr;fn=1;function r(e){return Math.abs(e)}return wr=r,wr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Fr,on;function sr(){if(on)return Fr;on=1;var r=dv();return Fr=r,Fr}/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Hr,sn;function x(){if(sn)return Hr;sn=1;var r=2147483647;return Hr=r,Hr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Pr,ln;function Bi(){if(ln)return Pr;ln=1;var r=2146435072;return Pr=r,Pr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Tr,cn;function $v(){if(cn)return Tr;cn=1;function r(){return typeof Symbol=="function"&&typeof Symbol("foo")=="symbol"}return Tr=r,Tr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ur,dn;function _v(){if(dn)return Ur;dn=1;var r=$v();return Ur=r,Ur}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Gr,$n;function hv(){if($n)return Gr;$n=1;var r=_v(),e=r();function i(){return e&&typeof Symbol.toStringTag=="symbol"}return Gr=i,Gr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Wr,_n;function qv(){if(_n)return Wr;_n=1;var r=hv();return Wr=r,Wr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Dr,hn;function L0(){if(hn)return Dr;hn=1;var r=Object.prototype.toString;return Dr=r,Dr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Br,qn;function bv(){if(qn)return Br;qn=1;var r=L0();function e(i){return r.call(i)}return Br=e,Br}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Cr,bn;function pv(){if(bn)return Cr;bn=1;var r=Object.prototype.hasOwnProperty;function e(i,a){return i==null?!1:r.call(i,a)}return Cr=e,Cr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Xr,pn;function Rv(){if(pn)return Xr;pn=1;var r=pv();return Xr=r,Xr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Vr,Rn;function mv(){if(Rn)return Vr;Rn=1;var r=typeof Symbol=="function"?Symbol:void 0;return Vr=r,Vr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Kr,mn;function Iv(){if(mn)return Kr;mn=1;var r=mv();return Kr=r,Kr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Zr,In;function Lv(){if(In)return Zr;In=1;var r=Iv(),e=typeof r=="function"?r.toStringTag:"";return Zr=e,Zr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Yr,Ln;function Av(){if(Ln)return Yr;Ln=1;var r=Rv(),e=Lv(),i=L0();function a(n){var t,v,f;if(n==null)return i.call(n);v=n[e],t=r(n,e);try{n[e]=void 0}catch{return i.call(n)}return f=i.call(n),t?n[e]=v:delete n[e],f}return Yr=a,Yr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var kr,An;function lr(){if(An)return kr;An=1;var r=qv(),e=bv(),i=Av(),a;return r()?a=i:a=e,kr=a,kr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Qr,gn;function gv(){if(gn)return Qr;gn=1;var r=lr(),e=typeof Uint32Array=="function";function i(a){return e&&a instanceof Uint32Array||r(a)==="[object Uint32Array]"}return Qr=i,Qr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var zr,En;function Ev(){if(En)return zr;En=1;var r=gv();return zr=r,zr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Jr,yn;function yv(){if(yn)return Jr;yn=1;var r=4294967295;return Jr=r,Jr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var xr,Mn;function Mv(){if(Mn)return xr;Mn=1;var r=typeof Uint32Array=="function"?Uint32Array:null;return xr=r,xr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var jr,Nn;function Nv(){if(Nn)return jr;Nn=1;var r=Ev(),e=yv(),i=Mv();function a(){var n,t;if(typeof i!="function")return!1;try{t=[1,3.14,-3.14,e+1,e+2],t=new i(t),n=r(t)&&t[0]===1&&t[1]===3&&t[2]===e-2&&t[3]===0&&t[4]===1}catch{n=!1}return n}return jr=a,jr}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var re,Sn;function Sv(){if(Sn)return re;Sn=1;var r=Nv();return re=r,re}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ee,On;function Ov(){if(On)return ee;On=1;var r=typeof Uint32Array=="function"?Uint32Array:void 0;return ee=r,ee}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ae,wn;function wv(){if(wn)return ae;wn=1;function r(){throw new Error("not implemented")}return ae=r,ae}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ie,Fn;function j(){if(Fn)return ie;Fn=1;var r=Sv(),e=Ov(),i=wv(),a;return r()?a=e:a=i,ie=a,ie}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ne,Hn;function Fv(){if(Hn)return ne;Hn=1;var r=lr(),e=typeof Float64Array=="function";function i(a){return e&&a instanceof Float64Array||r(a)==="[object Float64Array]"}return ne=i,ne}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var te,Pn;function Hv(){if(Pn)return te;Pn=1;var r=Fv();return te=r,te}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ue,Tn;function Pv(){if(Tn)return ue;Tn=1;var r=typeof Float64Array=="function"?Float64Array:null;return ue=r,ue}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ve,Un;function Tv(){if(Un)return ve;Un=1;var r=Hv(),e=Pv();function i(){var a,n;if(typeof e!="function")return!1;try{n=new e([1,3.14,-3.14,NaN]),a=r(n)&&n[0]===1&&n[1]===3.14&&n[2]===-3.14&&n[3]!==n[3]}catch{a=!1}return a}return ve=i,ve}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var fe,Gn;function Uv(){if(Gn)return fe;Gn=1;var r=Tv();return fe=r,fe}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var oe,Wn;function Gv(){if(Wn)return oe;Wn=1;var r=typeof Float64Array=="function"?Float64Array:void 0;return oe=r,oe}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var se,Dn;function Wv(){if(Dn)return se;Dn=1;function r(){throw new Error("not implemented")}return se=r,se}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var le,Bn;function rr(){if(Bn)return le;Bn=1;var r=Uv(),e=Gv(),i=Wv(),a;return r()?a=e:a=i,le=a,le}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ce,Cn;function Dv(){if(Cn)return ce;Cn=1;var r=lr(),e=typeof Uint8Array=="function";function i(a){return e&&a instanceof Uint8Array||r(a)==="[object Uint8Array]"}return ce=i,ce}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var de,Xn;function Bv(){if(Xn)return de;Xn=1;var r=Dv();return de=r,de}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var $e,Vn;function Cv(){if(Vn)return $e;Vn=1;var r=255;return $e=r,$e}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var _e,Kn;function Xv(){if(Kn)return _e;Kn=1;var r=typeof Uint8Array=="function"?Uint8Array:null;return _e=r,_e}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var he,Zn;function Vv(){if(Zn)return he;Zn=1;var r=Bv(),e=Cv(),i=Xv();function a(){var n,t;if(typeof i!="function")return!1;try{t=[1,3.14,-3.14,e+1,e+2],t=new i(t),n=r(t)&&t[0]===1&&t[1]===3&&t[2]===e-2&&t[3]===0&&t[4]===1}catch{n=!1}return n}return he=a,he}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qe,Yn;function Kv(){if(Yn)return qe;Yn=1;var r=Vv();return qe=r,qe}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var be,kn;function Zv(){if(kn)return be;kn=1;var r=typeof Uint8Array=="function"?Uint8Array:void 0;return be=r,be}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var pe,Qn;function Yv(){if(Qn)return pe;Qn=1;function r(){throw new Error("not implemented")}return pe=r,pe}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Re,zn;function kv(){if(zn)return Re;zn=1;var r=Kv(),e=Zv(),i=Yv(),a;return r()?a=e:a=i,Re=a,Re}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var me,Jn;function Qv(){if(Jn)return me;Jn=1;var r=lr(),e=typeof Uint16Array=="function";function i(a){return e&&a instanceof Uint16Array||r(a)==="[object Uint16Array]"}return me=i,me}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ie,xn;function zv(){if(xn)return Ie;xn=1;var r=Qv();return Ie=r,Ie}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Le,jn;function Jv(){if(jn)return Le;jn=1;var r=65535;return Le=r,Le}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ae,rt;function xv(){if(rt)return Ae;rt=1;var r=typeof Uint16Array=="function"?Uint16Array:null;return Ae=r,Ae}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ge,et;function jv(){if(et)return ge;et=1;var r=zv(),e=Jv(),i=xv();function a(){var n,t;if(typeof i!="function")return!1;try{t=[1,3.14,-3.14,e+1,e+2],t=new i(t),n=r(t)&&t[0]===1&&t[1]===3&&t[2]===e-2&&t[3]===0&&t[4]===1}catch{n=!1}return n}return ge=a,ge}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ee,at;function rf(){if(at)return Ee;at=1;var r=jv();return Ee=r,Ee}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ye,it;function ef(){if(it)return ye;it=1;var r=typeof Uint16Array=="function"?Uint16Array:void 0;return ye=r,ye}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Me,nt;function af(){if(nt)return Me;nt=1;function r(){throw new Error("not implemented")}return Me=r,Me}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ne,tt;function nf(){if(tt)return Ne;tt=1;var r=rf(),e=ef(),i=af(),a;return r()?a=e:a=i,Ne=a,Ne}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Se,ut;function tf(){if(ut)return Se;ut=1;var r=kv(),e=nf(),i={uint16:e,uint8:r};return Se=i,Se}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Oe,vt;function uf(){if(vt)return Oe;vt=1;var r=tf(),e;function i(){var a,n;return a=new r.uint16(1),a[0]=4660,n=new r.uint8(a.buffer),n[0]===52}return e=i(),Oe=e,Oe}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var we,ft;function er(){if(ft)return we;ft=1;var r=uf();return we=r,we}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Fe,ot;function vf(){if(ot)return Fe;ot=1;var r=er(),e;return r===!0?e=1:e=0,Fe=e,Fe}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var He,st;function ff(){if(st)return He;st=1;var r=j(),e=rr(),i=vf(),a=new e(1),n=new r(a.buffer);function t(v){return a[0]=v,n[i]}return He=t,He}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Pe,lt;function K(){if(lt)return Pe;lt=1;var r=ff();return Pe=r,Pe}/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Te,ct;function of(){if(ct)return Te;ct=1;function r(e){return e===0?.0416666666666666:.0416666666666666+e*(-.001388888888887411+e*2480158728947673e-20)}return Te=r,Te}/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ue,dt;function sf(){if(dt)return Ue;dt=1;function r(e){return e===0?-27557314351390663e-23:-27557314351390663e-23+e*(2087572321298175e-24+e*-11359647557788195e-27)}return Ue=r,Ue}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/12.2.0/lib/msun/src/k_cos.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var Ge,$t;function lf(){if($t)return Ge;$t=1;var r=of(),e=sf();function i(a,n){var t,v,f,o;return o=a*a,f=o*o,v=o*r(o),v+=f*f*e(o),t=.5*o,f=1-t,f+(1-f-t+(o*v-a*n))}return Ge=i,Ge}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var We,_t;function cf(){if(_t)return We;_t=1;var r=lf();return We=r,We}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/k_sin.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var De,ht;function df(){if(ht)return De;ht=1;var r=-.16666666666666632,e=.00833333333332249,i=-.0001984126982985795,a=27557313707070068e-22,n=-25050760253406863e-24,t=158969099521155e-24;function v(f,o){var c,l,b,m;return m=f*f,b=m*m,c=e+m*(i+m*a)+m*b*(n+m*t),l=m*f,o===0?f+l*(r+m*c):f-(m*(.5*o-l*c)-o-l*r)}return De=v,De}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Be,qt;function $f(){if(qt)return Be;qt=1;var r=df();return Be=r,Be}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ce,bt;function A0(){if(bt)return Ce;bt=1;var r=1048575;return Ce=r,Ce}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Xe,pt;function _f(){if(pt)return Xe;pt=1;var r=er(),e;return r===!0?e=0:e=1,Xe=e,Xe}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ve,Rt;function hf(){if(Rt)return Ve;Rt=1;var r=j(),e=rr(),i=_f(),a=new e(1),n=new r(a.buffer);function t(v){return a[0]=v,n[i]}return Ve=t,Ve}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ke,mt;function qf(){if(mt)return Ke;mt=1;var r=hf();return Ke=r,Ke}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ze,It;function bf(){if(It)return Ze;It=1;var r=er(),e,i,a;return r===!0?(i=1,a=0):(i=0,a=1),e={HIGH:i,LOW:a},Ze=e,Ze}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ye,Lt;function pf(){if(Lt)return Ye;Lt=1;var r=j(),e=rr(),i=bf(),a=new e(1),n=new r(a.buffer),t=i.HIGH,v=i.LOW;function f(o,c){return n[t]=o,n[v]=c,a[0]}return Ye=f,Ye}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ke,At;function Ci(){if(At)return ke;At=1;var r=pf();return ke=r,ke}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Qe,gt;function k(){if(gt)return Qe;gt=1;var r=Number.POSITIVE_INFINITY;return Qe=r,Qe}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ze,Et;function cr(){if(Et)return ze;Et=1;var r=1023;return ze=r,ze}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Je,yt;function Rf(){if(yt)return Je;yt=1;var r=1023;return Je=r,Je}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var xe,Mt;function mf(){if(Mt)return xe;Mt=1;var r=-1023;return xe=r,xe}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var je,Nt;function If(){if(Nt)return je;Nt=1;var r=-1074;return je=r,je}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ra,St;function Lf(){if(St)return ra;St=1;var r=k(),e=Y();function i(a){return a===r||a===e}return ra=i,ra}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ea,Ot;function Xi(){if(Ot)return ea;Ot=1;var r=Lf();return ea=r,ea}/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var aa,wt;function Af(){if(wt)return aa;wt=1;var r=2147483648;return aa=r,aa}/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ia,Ft;function gf(){if(Ft)return ia;Ft=1;var r=typeof Object.defineProperty=="function"?Object.defineProperty:null;return ia=r,ia}/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var na,Ht;function Ef(){if(Ht)return na;Ht=1;var r=gf();function e(){try{return r({},"x",{}),!0}catch{return!1}}return na=e,na}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ta,Pt;function yf(){if(Pt)return ta;Pt=1;var r=Object.defineProperty;return ta=r,ta}/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ua,Tt;function g0(){if(Tt)return ua;Tt=1;function r(e){return typeof e=="number"}return ua=r,ua}/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var va,Ut;function E0(){if(Ut)return va;Ut=1;function r(a){return a[0]==="-"}function e(a){var n="",t;for(t=0;t<a;t++)n+="0";return n}function i(a,n,t){var v=!1,f=n-a.length;return f<0||(r(a)&&(v=!0,a=a.substr(1)),a=t?a+e(f):e(f)+a,v&&(a="-"+a)),a}return va=i,va}/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var fa,Gt;function Mf(){if(Gt)return fa;Gt=1;var r=g0(),e=E0(),i=String.prototype.toLowerCase,a=String.prototype.toUpperCase;function n(t){var v,f,o;switch(t.specifier){case"b":v=2;break;case"o":v=8;break;case"x":case"X":v=16;break;case"d":case"i":case"u":default:v=10;break}if(f=t.arg,o=parseInt(f,10),!isFinite(o)){if(!r(f))throw new Error("invalid integer. Value: "+f);o=0}return o<0&&(t.specifier==="u"||v!==10)&&(o=4294967295+o+1),o<0?(f=(-o).toString(v),t.precision&&(f=e(f,t.precision,t.padRight)),f="-"+f):(f=o.toString(v),!o&&!t.precision?f="":t.precision&&(f=e(f,t.precision,t.padRight)),t.sign&&(f=t.sign+f)),v===16&&(t.alternate&&(f="0x"+f),f=t.specifier===a.call(t.specifier)?a.call(f):i.call(f)),v===8&&t.alternate&&f.charAt(0)!=="0"&&(f="0"+f),f}return fa=n,fa}/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var oa,Wt;function Nf(){if(Wt)return oa;Wt=1;function r(e){return typeof e=="string"}return oa=r,oa}/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var sa,Dt;function Sf(){if(Dt)return sa;Dt=1;var r=g0(),e=Math.abs,i=String.prototype.toLowerCase,a=String.prototype.toUpperCase,n=String.prototype.replace,t=/e\+(\d)$/,v=/e-(\d)$/,f=/^(\d+)$/,o=/^(\d+)e/,c=/\.0$/,l=/\.0*e/,b=/(\..*[^0])0*e/;function m(u){var _,s,d=parseFloat(u.arg);if(!isFinite(d)){if(!r(u.arg))throw new Error("invalid floating-point number. Value: "+s);d=u.arg}switch(u.specifier){case"e":case"E":s=d.toExponential(u.precision);break;case"f":case"F":s=d.toFixed(u.precision);break;case"g":case"G":e(d)<1e-4?(_=u.precision,_>0&&(_-=1),s=d.toExponential(_)):s=d.toPrecision(u.precision),u.alternate||(s=n.call(s,b,"$1e"),s=n.call(s,l,"e"),s=n.call(s,c,""));break;default:throw new Error("invalid double notation. Value: "+u.specifier)}return s=n.call(s,t,"e+0$1"),s=n.call(s,v,"e-0$1"),u.alternate&&(s=n.call(s,f,"$1."),s=n.call(s,o,"$1.e")),d>=0&&u.sign&&(s=u.sign+s),s=u.specifier===a.call(u.specifier)?a.call(s):i.call(s),s}return sa=m,sa}/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var la,Bt;function Of(){if(Bt)return la;Bt=1;function r(i){var a="",n;for(n=0;n<i;n++)a+=" ";return a}function e(i,a,n){var t=a-i.length;return t<0||(i=n?i+r(t):r(t)+i),i}return la=e,la}/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ca,Ct;function wf(){if(Ct)return ca;Ct=1;var r=Mf(),e=Nf(),i=Sf(),a=Of(),n=E0(),t=String.fromCharCode,v=Array.isArray;function f(l){return l!==l}function o(l){var b={};return b.specifier=l.specifier,b.precision=l.precision===void 0?1:l.precision,b.width=l.width,b.flags=l.flags||"",b.mapping=l.mapping,b}function c(l){var b,m,u,_,s,d,$,R,y;if(!v(l))throw new TypeError("invalid argument. First argument must be an array. Value: `"+l+"`.");for(d="",$=1,R=0;R<l.length;R++)if(u=l[R],e(u))d+=u;else{if(b=u.precision!==void 0,u=o(u),!u.specifier)throw new TypeError("invalid argument. Token is missing `specifier` property. Index: `"+R+"`. Value: `"+u+"`.");for(u.mapping&&($=u.mapping),m=u.flags,y=0;y<m.length;y++)switch(_=m.charAt(y),_){case" ":u.sign=" ";break;case"+":u.sign="+";break;case"-":u.padRight=!0,u.padZeros=!1;break;case"0":u.padZeros=m.indexOf("-")<0;break;case"#":u.alternate=!0;break;default:throw new Error("invalid flag: "+_)}if(u.width==="*"){if(u.width=parseInt(arguments[$],10),$+=1,f(u.width))throw new TypeError("the argument for * width at position "+$+" is not a number. Value: `"+u.width+"`.");u.width<0&&(u.padRight=!0,u.width=-u.width)}if(b&&u.precision==="*"){if(u.precision=parseInt(arguments[$],10),$+=1,f(u.precision))throw new TypeError("the argument for * precision at position "+$+" is not a number. Value: `"+u.precision+"`.");u.precision<0&&(u.precision=1,b=!1)}switch(u.arg=arguments[$],u.specifier){case"b":case"o":case"x":case"X":case"d":case"i":case"u":b&&(u.padZeros=!1),u.arg=r(u);break;case"s":u.maxWidth=b?u.precision:-1,u.arg=String(u.arg);break;case"c":if(!f(u.arg)){if(s=parseInt(u.arg,10),s<0||s>127)throw new Error("invalid character code. Value: "+u.arg);u.arg=f(s)?String(u.arg):t(s)}break;case"e":case"E":case"f":case"F":case"g":case"G":b||(u.precision=6),u.arg=i(u);break;default:throw new Error("invalid specifier: "+u.specifier)}u.maxWidth>=0&&u.arg.length>u.maxWidth&&(u.arg=u.arg.substring(0,u.maxWidth)),u.padZeros?u.arg=n(u.arg,u.width||u.precision,u.padRight):u.width&&(u.arg=a(u.arg,u.width,u.padRight)),d+=u.arg||"",$+=1}return d}return ca=c,ca}/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var da,Xt;function Ff(){if(Xt)return da;Xt=1;var r=wf();return da=r,da}/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var $a,Vt;function Hf(){if(Vt)return $a;Vt=1;var r=/%(?:([1-9]\d*)\$)?([0 +\-#]*)(\*|\d+)?(?:(\.)(\*|\d+)?)?[hlL]?([%A-Za-z])/g;function e(a){var n={mapping:a[1]?parseInt(a[1],10):void 0,flags:a[2],width:a[3],precision:a[5],specifier:a[6]};return a[4]==="."&&a[5]===void 0&&(n.precision="1"),n}function i(a){var n,t,v,f;for(t=[],f=0,v=r.exec(a);v;)n=a.slice(f,r.lastIndex-v[0].length),n.length&&t.push(n),t.push(e(v)),f=r.lastIndex,v=r.exec(a);return n=a.slice(f),n.length&&t.push(n),t}return $a=i,$a}/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var _a,Kt;function Pf(){if(Kt)return _a;Kt=1;var r=Hf();return _a=r,_a}/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ha,Zt;function Tf(){if(Zt)return ha;Zt=1;function r(e){return typeof e=="string"}return ha=r,ha}/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qa,Yt;function Uf(){if(Yt)return qa;Yt=1;var r=Ff(),e=Pf(),i=Tf();function a(n){var t,v;if(!i(n))throw new TypeError(a("invalid argument. First argument must be a string. Value: `%s`.",n));for(t=[e(n)],v=1;v<arguments.length;v++)t.push(arguments[v]);return r.apply(null,t)}return qa=a,qa}/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ba,kt;function Gf(){if(kt)return ba;kt=1;var r=Uf();return ba=r,ba}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var pa,Qt;function Wf(){if(Qt)return pa;Qt=1;var r=Gf(),e=Object.prototype,i=e.toString,a=e.__defineGetter__,n=e.__defineSetter__,t=e.__lookupGetter__,v=e.__lookupSetter__;function f(o,c,l){var b,m,u,_;if(typeof o!="object"||o===null||i.call(o)==="[object Array]")throw new TypeError(r("invalid argument. First argument must be an object. Value: `%s`.",o));if(typeof l!="object"||l===null||i.call(l)==="[object Array]")throw new TypeError(r("invalid argument. Property descriptor must be an object. Value: `%s`.",l));if(m="value"in l,m&&(t.call(o,c)||v.call(o,c)?(b=o.__proto__,o.__proto__=e,delete o[c],o[c]=l.value,o.__proto__=b):o[c]=l.value),u="get"in l,_="set"in l,m&&(u||_))throw new Error("invalid argument. Cannot specify one or more accessors and a value or writable attribute in the property descriptor.");return u&&a&&a.call(o,c,l.get),_&&n&&n.call(o,c,l.set),o}return pa=f,pa}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ra,zt;function Df(){if(zt)return Ra;zt=1;var r=Ef(),e=yf(),i=Wf(),a;return r()?a=e:a=i,Ra=a,Ra}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ma,Jt;function Bf(){if(Jt)return ma;Jt=1;var r=Df();function e(i,a,n){r(i,a,{configurable:!1,enumerable:!1,writable:!1,value:n})}return ma=e,ma}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ia,xt;function y0(){if(xt)return Ia;xt=1;var r=Bf();return Ia=r,Ia}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var La,jt;function Cf(){if(jt)return La;jt=1;var r=er(),e,i,a;return r===!0?(i=1,a=0):(i=0,a=1),e={HIGH:i,LOW:a},La=e,La}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Aa,ru;function M0(){if(ru)return Aa;ru=1;var r=j(),e=rr(),i=Cf(),a=new e(1),n=new r(a.buffer),t=i.HIGH,v=i.LOW;function f(o,c,l,b){return a[0]=o,c[b]=n[t],c[b+l]=n[v],c}return Aa=f,Aa}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ga,eu;function Xf(){if(eu)return ga;eu=1;var r=M0();function e(i){return r(i,[0,0],1,0)}return ga=e,ga}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ea,au;function Vi(){if(au)return Ea;au=1;var r=y0(),e=Xf(),i=M0();return r(e,"assign",i),Ea=e,Ea}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ya,iu;function Vf(){if(iu)return ya;iu=1;var r=Af(),e=x(),i=Vi(),a=K(),n=Ci(),t=[0,0];function v(f,o){var c,l;return i.assign(f,t,1,0),c=t[0],c&=e,l=a(o),l&=r,c|=l,n(c,t[1])}return ya=v,ya}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ma,nu;function N0(){if(nu)return Ma;nu=1;var r=Vf();return Ma=r,Ma}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Na,tu;function Kf(){if(tu)return Na;tu=1;var r=22250738585072014e-324;return Na=r,Na}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Sa,uu;function S0(){if(uu)return Sa;uu=1;var r=Kf(),e=Xi(),i=ur(),a=sr(),n=4503599627370496;function t(v,f,o,c){return i(v)||e(v)?(f[c]=v,f[c+o]=0,f):v!==0&&a(v)<r?(f[c]=v*n,f[c+o]=-52,f):(f[c]=v,f[c+o]=0,f)}return Sa=t,Sa}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Oa,vu;function Zf(){if(vu)return Oa;vu=1;var r=S0();function e(i){return r(i,[0,0],1,0)}return Oa=e,Oa}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var wa,fu;function Yf(){if(fu)return wa;fu=1;var r=y0(),e=Zf(),i=S0();return r(e,"assign",i),wa=e,wa}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Fa,ou;function kf(){if(ou)return Fa;ou=1;var r=K(),e=Bi(),i=cr();function a(n){var t=r(n);return t=(t&e)>>>20,t-i|0}return Fa=a,Fa}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ha,su;function Qf(){if(su)return Ha;su=1;var r=kf();return Ha=r,Ha}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Pa,lu;function zf(){if(lu)return Pa;lu=1;var r=k(),e=Y(),i=cr(),a=Rf(),n=mf(),t=If(),v=ur(),f=Xi(),o=N0(),c=Yf().assign,l=Qf(),b=Vi(),m=Ci(),u=2220446049250313e-31,_=2148532223,s=[0,0],d=[0,0];function $(R,y){var M,g;return y===0||R===0||v(R)||f(R)?R:(c(R,s,1,0),R=s[0],y+=s[1],y+=l(R),y<t?o(0,R):y>a?R<0?e:r:(y<=n?(y+=52,g=u):g=1,b.assign(R,d,1,0),M=d[0],M&=_,M|=y+i<<20,g*m(M,d[1])))}return Pa=$,Pa}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ta,cu;function Ki(){if(cu)return Ta;cu=1;var r=zf();return Ta=r,Ta}/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ua,du;function Jf(){if(du)return Ua;du=1;function r(e,i){var a,n;for(a=[],n=0;n<i;n++)a.push(e);return a}return Ua=r,Ua}/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ga,$u;function xf(){if($u)return Ga;$u=1;var r=Jf();return Ga=r,Ga}/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Wa,_u;function jf(){if(_u)return Wa;_u=1;var r=xf();function e(i){return r(0,i)}return Wa=e,Wa}/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Da,hu;function ro(){if(hu)return Da;hu=1;var r=jf();return Da=r,Da}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/k_rem_pio2.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var Ba,qu;function eo(){if(qu)return Ba;qu=1;var r=or(),e=Ki(),i=ro(),a=[10680707,7228996,1387004,2578385,16069853,12639074,9804092,4427841,16666979,11263675,12935607,2387514,4345298,14681673,3074569,13734428,16653803,1880361,10960616,8533493,3062596,8710556,7349940,6258241,3772886,3769171,3798172,8675211,12450088,3874808,9961438,366607,15675153,9132554,7151469,3571407,2607881,12013382,4155038,6285869,7677882,13102053,15825725,473591,9065106,15363067,6271263,9264392,5636912,4652155,7056368,13614112,10155062,1944035,9527646,15080200,6658437,6231200,6832269,16767104,5075751,3212806,1398474,7579849,6349435,12618859],n=[1.570796251296997,7549789415861596e-23,5390302529957765e-30,3282003415807913e-37,1270655753080676e-44,12293330898111133e-52,27337005381646456e-60,21674168387780482e-67],t=16777216,v=5960464477539063e-23,f=i(20),o=i(20),c=i(20),l=i(20);function b(u,_,s,d,$,R,y,M,g){var L,h,A,F,q,p,I,N,S;for(F=R,S=d[s],N=s,q=0;N>0;q++)h=v*S|0,l[q]=S-t*h|0,S=d[N-1]+h,N-=1;if(S=e(S,$),S-=8*r(S*.125),I=S|0,S-=I,A=0,$>0?(q=l[s-1]>>24-$,I+=q,l[s-1]-=q<<24-$,A=l[s-1]>>23-$):$===0?A=l[s-1]>>23:S>=.5&&(A=2),A>0){for(I+=1,L=0,q=0;q<s;q++)N=l[q],L===0?N!==0&&(L=1,l[q]=16777216-N):l[q]=16777215-N;if($>0)switch($){case 1:l[s-1]&=8388607;break;case 2:l[s-1]&=4194303;break}A===2&&(S=1-S,L!==0&&(S-=e(1,$)))}if(S===0){for(N=0,q=s-1;q>=R;q--)N|=l[q];if(N===0){for(p=1;l[R-p]===0;p++);for(q=s+1;q<=s+p;q++){for(g[M+q]=a[y+q],h=0,N=0;N<=M;N++)h+=u[N]*g[M+(q-N)];d[q]=h}return s+=p,b(u,_,s,d,$,R,y,M,g)}}if(S===0)for(s-=1,$-=24;l[s]===0;)s-=1,$-=24;else S=e(S,-$),S>=t?(h=v*S|0,l[s]=S-t*h|0,s+=1,$+=24,l[s]=h):l[s]=S|0;for(h=e(1,$),q=s;q>=0;q--)d[q]=h*l[q],h*=v;for(q=s;q>=0;q--){for(h=0,p=0;p<=F&&p<=s-q;p++)h+=n[p]*d[q+p];c[s-q]=h}for(h=0,q=s;q>=0;q--)h+=c[q];for(A===0?_[0]=h:_[0]=-h,h=c[0]-h,q=1;q<=s;q++)h+=c[q];return A===0?_[1]=h:_[1]=-h,I&7}function m(u,_,s,d){var $,R,y,M,g,L,h,A,F;for(R=4,M=d-1,y=(s-3)/24|0,y<0&&(y=0),L=s-24*(y+1),A=y-M,F=M+R,h=0;h<=F;h++)A<0?f[h]=0:f[h]=a[A],A+=1;for(h=0;h<=R;h++){for($=0,A=0;A<=M;A++)$+=u[A]*f[M+(h-A)];o[h]=$}return g=R,b(u,_,g,o,L,R,y,M,f)}return Ba=m,Ba}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ca,bu;function ao(){if(bu)return Ca;bu=1;var r=Math.round;return Ca=r,Ca}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Xa,pu;function io(){if(pu)return Xa;pu=1;var r=ao();return Xa=r,Xa}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/k_rem_pio2.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var Va,Ru;function no(){if(Ru)return Va;Ru=1;var r=io(),e=K(),i=.6366197723675814,a=1.5707963267341256,n=6077100506506192e-26,t=6077100506303966e-26,v=20222662487959506e-37,f=20222662487111665e-37,o=84784276603689e-45,c=2047;function l(b,m,u){var _,s,d,$,R,y,M;return s=r(b*i),$=b-s*a,R=s*n,M=m>>20|0,u[0]=$-R,_=e(u[0]),y=M-(_>>20&c),y>16&&(d=$,R=s*t,$=d-R,R=s*v-(d-$-R),u[0]=$-R,_=e(u[0]),y=M-(_>>20&c),y>49&&(d=$,R=s*f,$=d-R,R=s*o-(d-$-R),u[0]=$-R)),u[1]=$-u[0]-R,s}return Va=l,Va}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/e_rem_pio2.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
*
* Optimized by Bruce D. Evans.
* ```
*/var Ka,mu;function to(){if(mu)return Ka;mu=1;var r=x(),e=Bi(),i=A0(),a=K(),n=qf(),t=Ci(),v=eo(),f=no(),o=0,c=16777216,l=1.5707963267341256,b=6077100506506192e-26,m=2*b,u=3*b,_=4*b,s=598523,d=1072243195,$=1073928572,R=1074752122,y=1074977148,M=1075183036,g=1075388923,L=1075594811,h=1094263291,A=[0,0,0],F=[0,0];function q(p,I){var N,S,P,E,w,T,U,O;if(P=a(p),E=P&r|0,E<=d)return I[0]=p,I[1]=0,0;if(E<=R)return(E&i)===s?f(p,E,I):E<=$?p>0?(O=p-l,I[0]=O-b,I[1]=O-I[0]-b,1):(O=p+l,I[0]=O+b,I[1]=O-I[0]+b,-1):p>0?(O=p-2*l,I[0]=O-m,I[1]=O-I[0]-m,2):(O=p+2*l,I[0]=O+m,I[1]=O-I[0]+m,-2);if(E<=L)return E<=M?E===y?f(p,E,I):p>0?(O=p-3*l,I[0]=O-u,I[1]=O-I[0]-u,3):(O=p+3*l,I[0]=O+u,I[1]=O-I[0]+u,-3):E===g?f(p,E,I):p>0?(O=p-4*l,I[0]=O-_,I[1]=O-I[0]-_,4):(O=p+4*l,I[0]=O+_,I[1]=O-I[0]+_,-4);if(E<h)return f(p,E,I);if(E>=e)return I[0]=NaN,I[1]=NaN,0;for(N=n(p),S=(E>>20)-1046,O=t(E-(S<<20|0),N),T=0;T<2;T++)A[T]=O|0,O=(O-A[T])*c;for(A[2]=O,w=3;A[w-1]===o;)w-=1;return U=v(A,F,S,w,1),p<0?(I[0]=-F[0],I[1]=-F[1],-U):(I[0]=F[0],I[1]=F[1],U)}return Ka=q,Ka}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Za,Iu;function uo(){if(Iu)return Za;Iu=1;var r=to();return Za=r,Za}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_sin.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var Ya,Lu;function vo(){if(Lu)return Ya;Lu=1;var r=x(),e=Bi(),i=K(),a=cf(),n=$f(),t=uo(),v=1072243195,f=1045430272,o=[0,0];function c(l){var b,m;if(b=i(l),b&=r,b<=v)return b<f?l:n(l,0);if(b>=e)return NaN;switch(m=t(l,o),m&3){case 0:return n(o[0],o[1]);case 1:return a(o[0],o[1]);case 2:return-n(o[0],o[1]);default:return-a(o[0],o[1])}}return Ya=c,Ya}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ka,Au;function fo(){if(Au)return ka;Au=1;var r=vo();return ka=r,ka}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Qa,gu;function oo(){if(gu)return Qa;gu=1;var r=3.141592653589793;return Qa=r,Qa}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var za,Eu;function so(){if(Eu)return za;Eu=1;var r=2.5066282746310007;return za=r,za}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ja,yu;function lo(){if(yu)return Ja;yu=1;var r=Di();function e(i){return r(i/2)}return Ja=e,Ja}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var xa,Mu;function co(){if(Mu)return xa;Mu=1;var r=lo();return xa=r,xa}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ja,Nu;function $o(){if(Nu)return ja;Nu=1;var r=co();function e(i){return i>0?r(i-1):r(i+1)}return ja=e,ja}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ri,Su;function O0(){if(Su)return ri;Su=1;var r=$o();return ri=r,ri}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ei,Ou;function _o(){if(Ou)return ei;Ou=1;var r=Math.sqrt;return ei=r,ei}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ai,wu;function ho(){if(wu)return ai;wu=1;var r=_o();return ai=r,ai}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ii,Fu;function qo(){if(Fu)return ii;Fu=1;var r=er(),e;return r===!0?e=0:e=1,ii=e,ii}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ni,Hu;function bo(){if(Hu)return ni;Hu=1;var r=j(),e=rr(),i=qo(),a=new e(1),n=new r(a.buffer);function t(v,f){return a[0]=v,n[i]=f>>>0,a[0]}return ni=t,ni}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ti,Pu;function dr(){if(Pu)return ti;Pu=1;var r=bo();return ti=r,ti}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ui,Tu;function po(){if(Tu)return ui;Tu=1;function r(e){return e|0}return ui=r,ui}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var vi,Uu;function w0(){if(Uu)return vi;Uu=1;var r=po();return vi=r,vi}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_pow.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var fi,Gu;function Ro(){if(Gu)return fi;Gu=1;var r=O0(),e=N0(),i=Y(),a=k();function n(t,v){return v===i?a:v===a?0:v>0?r(v)?t:0:r(v)?e(a,t):a}return fi=n,fi}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_pow.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var oi,Wu;function mo(){if(Wu)return oi;Wu=1;var r=x(),e=K(),i=1072693247,a=1e300,n=1e-300;function t(v,f){var o,c;return c=e(v),o=c&r,o<=i?f<0?a*a:n*n:f>0?a*a:n*n}return oi=t,oi}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var si,Du;function Io(){if(Du)return si;Du=1;var r=sr(),e=k();function i(a,n){return a===-1?(a-a)/(a-a):a===1?1:r(a)<1==(n===e)?0:e}return si=i,si}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var li,Bu;function Lo(){if(Bu)return li;Bu=1;var r=er(),e;return r===!0?e=1:e=0,li=e,li}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ci,Cu;function Ao(){if(Cu)return ci;Cu=1;var r=j(),e=rr(),i=Lo(),a=new e(1),n=new r(a.buffer);function t(v,f){return a[0]=v,n[i]=f>>>0,a[0]}return ci=t,ci}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var di,Xu;function F0(){if(Xu)return di;Xu=1;var r=Ao();return di=r,di}/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var $i,Vu;function go(){if(Vu)return $i;Vu=1;function r(e){return e===0?.5999999999999946:.5999999999999946+e*(.4285714285785502+e*(.33333332981837743+e*(.272728123808534+e*(.23066074577556175+e*.20697501780033842))))}return $i=r,$i}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_pow.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var _i,Ku;function Eo(){if(Ku)return _i;Ku=1;var r=K(),e=dr(),i=F0(),a=cr(),n=go(),t=1048575,v=1048576,f=1072693248,o=536870912,c=524288,l=20,b=9007199254740992,m=.9617966939259756,u=.9617967009544373,_=-7028461650952758e-24,s=[1,1.5],d=[0,.5849624872207642],$=[0,1350039202129749e-23];function R(y,M,g){var L,h,A,F,q,p,I,N,S,P,E,w,T,U,O,X,Z,W,B,H,V,G;return H=0,g<v&&(M*=b,H-=53,g=r(M)),H+=(g>>l)-a|0,V=g&t|0,g=V|f|0,V<=235662?G=0:V<767610?G=1:(G=0,H+=1,g-=v),M=i(M,g),N=s[G],W=M-N,B=1/(M+N),h=W*B,F=e(h,0),L=(g>>1|o)+c,L+=G<<18,p=i(0,L),I=M-(p-N),q=B*(W-F*p-F*I),A=h*h,Z=A*A*n(A),Z+=q*(F+h),A=F*F,p=3+A+Z,p=e(p,0),I=Z-(p-3-A),W=F*p,B=q*p+I*h,P=W+B,P=e(P,0),E=B-(P-W),w=u*P,T=_*P+E*m+$[G],S=d[G],X=H,U=w+T+S+X,U=e(U,0),O=T-(U-X-S-w),y[0]=U,y[1]=O,y}return _i=R,_i}/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var hi,Zu;function yo(){if(Zu)return hi;Zu=1;function r(e){return e===0?.5:.5+e*(-.3333333333333333+e*.25)}return hi=r,hi}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_pow.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var qi,Yu;function Mo(){if(Yu)return qi;Yu=1;var r=dr(),e=yo(),i=1.4426950408889634,a=1.4426950216293335,n=19259629911266175e-24;function t(v,f){var o,c,l,b,m,u;return l=f-1,b=l*l*e(l),m=a*l,u=l*n-b*i,c=m+u,c=r(c,0),o=u-(c-m),v[0]=c,v[1]=o,v}return qi=t,qi}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var bi,ku;function No(){if(ku)return bi;ku=1;var r=.6931471805599453;return bi=r,bi}/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var pi,Qu;function So(){if(Qu)return pi;Qu=1;function r(e){return e===0?.16666666666666602:.16666666666666602+e*(-.0027777777777015593+e*(6613756321437934e-20+e*(-16533902205465252e-22+e*41381367970572385e-24)))}return pi=r,pi}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_pow.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var Ri,zu;function Oo(){if(zu)return Ri;zu=1;var r=K(),e=F0(),i=dr(),a=w0(),n=Ki(),t=No(),v=cr(),f=x(),o=A0(),c=So(),l=1048576,b=1071644672,m=20,u=.6931471824645996,_=-1904654299957768e-24;function s(d,$,R){var y,M,g,L,h,A,F,q,p,I,N;return I=d&f|0,N=(I>>m)-v|0,p=0,I>b&&(p=d+(l>>N+1)>>>0,N=((p&f)>>m)-v|0,y=(p&~(o>>N))>>>0,g=e(0,y),p=(p&o|l)>>m-N>>>0,d<0&&(p=-p),$-=g),g=R+$,g=i(g,0),h=g*u,A=(R-(g-$))*t+g*_,q=h+A,F=A-(q-h),g=q*q,M=q-g*c(g),L=q*M/(M-2)-(F+q*F),q=1-(L-q),d=r(q),d=a(d),d+=p<<m>>>0,d>>m<=0?q=n(q,p):q=e(q,d),q}return Ri=s,Ri}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_pow.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var mi,Ju;function wo(){if(Ju)return mi;Ju=1;var r=ur(),e=O0(),i=Xi(),a=Di(),n=ho(),t=sr(),v=Vi(),f=dr(),o=w0(),c=Y(),l=k(),b=x(),m=Ro(),u=mo(),_=Io(),s=Eo(),d=Mo(),$=Oo(),R=1072693247,y=1105199104,M=1139802112,g=1083179008,L=1072693248,h=1083231232,A=3230714880,F=31,q=1e300,p=1e-300,I=8008566259537294e-32,N=[0,0],S=[0,0];function P(E,w){var T,U,O,X,Z,W,B,H,V,G,ar,ir,nr,Q,z,$r;if(r(E)||r(w))return NaN;if(v.assign(w,N,1,0),W=N[0],B=N[1],B===0){if(w===0)return 1;if(w===1)return E;if(w===-1)return 1/E;if(w===.5)return n(E);if(w===-.5)return 1/n(E);if(w===2)return E*E;if(w===3)return E*E*E;if(w===4)return E*=E,E*E;if(i(w))return _(E,w)}if(v.assign(E,N,1,0),X=N[0],Z=N[1],Z===0){if(X===0)return m(E,w);if(E===1)return 1;if(E===-1&&e(w))return-1;if(i(E))return E===c?P(-0,-w):w<0?0:l}if(E<0&&a(w)===!1)return(E-E)/(E-E);if(O=t(E),T=X&b|0,U=W&b|0,H=X>>>F|0,V=W>>>F|0,H&&e(w)?H=-1:H=1,U>y){if(U>M)return u(E,w);if(T<R)return V===1?H*q*q:H*p*p;if(T>L)return V===0?H*q*q:H*p*p;nr=d(S,O)}else nr=s(S,O,T);if(G=f(w,0),ir=(w-G)*nr[0]+w*nr[1],ar=G*nr[0],Q=ir+ar,v.assign(Q,N,1,0),z=o(N[0]),$r=o(N[1]),z>=g){if((z-g|$r)!==0||ir+I>Q-ar)return H*q*q}else if((z&b)>=h&&((z-A|$r)!==0||ir<=Q-ar))return H*p*p;return Q=$(z,ar,ir),H*Q}return mi=P,mi}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ii,xu;function Fo(){if(xu)return Ii;xu=1;var r=wo();return Ii=r,Ii}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Li,ju;function Ho(){if(ju)return Li;ju=1;var r=Math.ceil;return Li=r,Li}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ai,r0;function Po(){if(r0)return Ai;r0=1;var r=Ho();return Ai=r,Ai}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var gi,e0;function To(){if(e0)return gi;e0=1;var r=or(),e=Po();function i(a){return a<0?e(a):r(a)}return gi=i,gi}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ei,a0;function Uo(){if(a0)return Ei;a0=1;var r=To();return Ei=r,Ei}/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var yi,i0;function Go(){if(i0)return yi;i0=1;function r(e){return e===0?.16666666666666602:.16666666666666602+e*(-.0027777777777015593+e*(6613756321437934e-20+e*(-16533902205465252e-22+e*41381367970572385e-24)))}return yi=r,yi}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyrights, licenses, and long comment were part of the original implementation available as part of [Go]{@link https://github.com/golang/go/blob/cb07765045aed5104a3df31507564ac99e6ddce8/src/math/exp.go}, which in turn was based on an implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/e_exp.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (c) 2009 The Go Authors. All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are
* met:
*
*    * Redistributions of source code must retain the above copyright
* notice, this list of conditions and the following disclaimer.
*    * Redistributions in binary form must reproduce the above
* copyright notice, this list of conditions and the following disclaimer
* in the documentation and/or other materials provided with the
* distribution.
*    * Neither the name of Google Inc. nor the names of its
* contributors may be used to endorse or promote products derived from
* this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
* "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
* LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
* A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
* OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
* SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
* LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
* DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
* THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
* ```
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var Mi,n0;function Wo(){if(n0)return Mi;n0=1;var r=Ki(),e=Go();function i(a,n,t){var v,f,o,c;return v=a-n,f=v*v,o=v-f*e(f),c=1-(n-v*o/(2-o)-a),r(c,t)}return Mi=i,Mi}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyrights, licenses, and long comment were part of the original implementation available as part of [Go]{@link https://github.com/golang/go/blob/cb07765045aed5104a3df31507564ac99e6ddce8/src/math/exp.go}, which in turn was based on an implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/e_exp.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (c) 2009 The Go Authors. All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are
* met:
*
*    * Redistributions of source code must retain the above copyright
* notice, this list of conditions and the following disclaimer.
*    * Redistributions in binary form must reproduce the above
* copyright notice, this list of conditions and the following disclaimer
* in the documentation and/or other materials provided with the
* distribution.
*    * Neither the name of Google Inc. nor the names of its
* contributors may be used to endorse or promote products derived from
* this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
* "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
* LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
* A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
* OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
* SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
* LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
* DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
* THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
* ```
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var Ni,t0;function Do(){if(t0)return Ni;t0=1;var r=ur(),e=Uo(),i=Y(),a=k(),n=Wo(),t=.6931471803691238,v=19082149292705877e-26,f=1.4426950408889634,o=709.782712893384,c=-745.1332191019411,l=1/(1<<28),b=-l;function m(u){var _,s,d;return r(u)||u===a?u:u===i?0:u>o?a:u<c?0:u>b&&u<l?1+u:(u<0?d=e(f*u-.5):d=e(f*u+.5),_=u-d*t,s=d*v,n(_,s,d))}return Ni=m,Ni}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Si,u0;function Bo(){if(u0)return Si;u0=1;var r=Do();return Si=r,Si}/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Oi,v0;function Co(){if(v0)return Oi;v0=1;function r(e){return e===0?.08333333333334822:.08333333333334822+e*(.0034722222160545866+e*(-.0026813261780578124+e*(-.00022954996161337813+e*.0007873113957930937)))}return Oi=r,Oi}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C code, copyright, license, and constants are from [Cephes]{@link http://www.netlib.org/cephes}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright 1984, 1987, 1989, 1992, 2000 by Stephen L. Moshier
*
* Some software in this archive may be from the book _Methods and Programs for Mathematical Functions_ (Prentice-Hall or Simon & Schuster International, 1989) or from the Cephes Mathematical Library, a commercial product. In either event, it is copyrighted by the author. What you see here may be used freely but it comes with no support or guarantee.
*
* Stephen L. Moshier
* moshier@na-net.ornl.gov
* ```
*/var wi,f0;function Xo(){if(f0)return wi;f0=1;var r=so(),e=Fo(),i=Bo(),a=Co(),n=143.01608;function t(v){var f,o,c;return f=1/v,f=1+f*a(f),o=i(v),v>n?(c=e(v,.5*v-.25),o=c*(c/o)):o=e(v,v-.5)/o,r*o*f}return wi=t,wi}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Fi,o0;function Vo(){if(o0)return Fi;o0=1;var r=.5772156649015329;return Fi=r,Fi}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C code, copyright, license, and constants are from [Cephes]{@link http://www.netlib.org/cephes}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright 1984, 1987, 1989, 1992, 2000 by Stephen L. Moshier
*
* Some software in this archive may be from the book _Methods and Programs for Mathematical Functions_ (Prentice-Hall or Simon & Schuster International, 1989) or from the Cephes Mathematical Library, a commercial product. In either event, it is copyrighted by the author. What you see here may be used freely but it comes with no support or guarantee.
*
* Stephen L. Moshier
* moshier@na-net.ornl.gov
* ```
*/var Hi,s0;function Ko(){if(s0)return Hi;s0=1;var r=Vo();function e(i,a){return a/((1+r*i)*i)}return Hi=e,Hi}/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Pi,l0;function Zo(){if(l0)return Pi;l0=1;function r(e){var i,a,n;return e===0?1:(e<0?i=-e:i=e,i<=1?(a=1+e*(.4942148268014971+e*(.20744822764843598+e*(.04763678004571372+e*(.010421379756176158+e*(.0011913514700658638+e*(.00016011952247675185+e*0)))))),n=1+e*(.0714304917030273+e*(-.23459179571824335+e*(.035823639860549865+e*(.011813978522206043+e*(-.004456419138517973+e*(.0005396055804933034+e*-23158187332412014e-21))))))):(e=1/e,a=0+e*(.00016011952247675185+e*(.0011913514700658638+e*(.010421379756176158+e*(.04763678004571372+e*(.20744822764843598+e*(.4942148268014971+e*1)))))),n=-23158187332412014e-21+e*(.0005396055804933034+e*(-.004456419138517973+e*(.011813978522206043+e*(.035823639860549865+e*(-.23459179571824335+e*(.0714304917030273+e*1))))))),a/n)}return Pi=r,Pi}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C code, long comment, copyright, license, and constants are from [Cephes]{@link http://www.netlib.org/cephes}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright 1984, 1987, 1989, 1992, 2000 by Stephen L. Moshier
*
* Some software in this archive may be from the book _Methods and Programs for Mathematical Functions_ (Prentice-Hall or Simon & Schuster International, 1989) or from the Cephes Mathematical Library, a commercial product. In either event, it is copyrighted by the author. What you see here may be used freely but it comes with no support or guarantee.
*
* Stephen L. Moshier
* moshier@na-net.ornl.gov
* ```
*/var Ti,c0;function Yo(){if(c0)return Ti;c0=1;var r=ur(),e=Di(),i=cv(),a=sr(),n=or(),t=fo(),v=k(),f=Y(),o=oo(),c=Xo(),l=Ko(),b=Zo();function m(u){var _,s,d,$;if(e(u)&&u<0||u===f||r(u))return NaN;if(u===0)return i(u)?f:v;if(u>171.61447887182297)return v;if(u<-170.5674972726612)return 0;if(s=a(u),s>33)return u>=0?c(u):(d=n(s),(d&1)===0?_=-1:_=1,$=s-d,$>.5&&(d+=1,$=s-d),$=s*t(o*$),_*o/(a($)*c(s)));for($=1;u>=3;)u-=1,$*=u;for(;u<0;){if(u>-1e-9)return l(u,$);$/=u,u+=1}for(;u<2;){if(u<1e-9)return l(u,$);$/=u,u+=1}return u===2?$:(u-=2,$*b(u))}return Ti=m,Ti}/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ui,d0;function ko(){if(d0)return Ui;d0=1;var r=Yo();return Ui=r,Ui}var Qo=ko();const zo=tv(Qo);function a1(r,e){return Math.floor(H0(r,e))}function H0(r,e){return Math.random()*(e-r)+r}function i1(r,e,i,a){return Math.sqrt((r-i)**2+(e-a)**2)}function n1(r,e){const i=H0(0,1);let a=0;for(let n=0;n<e;n++){a+=r**n/zo(n+1);const t=Math.exp(-r)*a;if(i<=t)return n}return e}export{n1 as a,r1 as b,a1 as c,tv as d,jo as e,e1 as f,zo as g,i1 as h,xo as i,H0 as r};
