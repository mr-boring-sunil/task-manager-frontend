import{r as d}from"./vendor-6KJ18rDM.js";/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ge=a=>a==null?void 0:a.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function ve(a,e,n=[]){if(e==null)throw new Error("[lucide]: iconNode is required when icon name is used");return{name:ge(a),size:24,node:e,...n.length>0?{aliases:n}:{}}}/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const De=a=>{let e="",n=!1;for(const o of a){if(o==="-"||o==="_"||o<=" "){n=e.length>0;continue}e.length===0?e+=o.toLowerCase():e+=n?o.toUpperCase():o,n=!1}return e};/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const be=a=>{const e=De(a);return e.charAt(0).toUpperCase()+e.slice(1)};/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=(...a)=>a.filter((e,n,o)=>!!e&&e.trim()!==""&&o.indexOf(e)===n).join(" ").trim();/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function f(a){return a!=null}function $e(a,e={}){var x,m;const n=e.attributeNames??{},o=c=>n[c]??c,h=a.size??a.width??i.width,y=a.size??a.height??i.height,k=((x=a.aliases)==null?void 0:x.filter(c=>typeof c=="string"&&c.trim()!=="").map(c=>`lucide-${c}`))??[],p=[...a.name?[`lucide-${a.name}`]:[],...k],s=((m=e.className)==null?void 0:m.split(" ").filter(Boolean))??[],u=e.includeDefaultClasses===!1?g(...s):g("lucide",...p,...s),w=e.absoluteStrokeWidth?Number(e.strokeWidth??i["stroke-width"])*Number(a.size??a.width??i.width)/Number(e.size??e.width??i.width):e.strokeWidth??i["stroke-width"];return["svg",{...Object.entries(i).reduce((c,[r,l])=>(c[o(r)]=l,c),{}),..."color"in e&&e.color&&{[o("stroke")]:e.color},..."size"in e&&f(e.size)&&{[o("width")]:e.size,[o("height")]:e.size},..."width"in e&&f(e.width)&&{[o("width")]:e.width},..."height"in e&&f(e.height)&&{[o("height")]:e.height},[o("stroke-width")]:w,...u&&{[o("class")]:u},[o("viewBox")]:`0 0 ${h} ${y}`,...e.hasA11yProp===!1?{[o("aria-hidden")]:"true"}:{},..."attributes"in e&&e.attributes},a.node.map(c=>{const[r,l,_]=c,z=e.nonScalingStroke?{[o("vector-effect")]:"non-scaling-stroke",...l}:l;return _?[r,z,_]:[r,z]})]}/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function Ce(a,e={}){return $e(a,{...e,attributeNames:{...e.attributeNames,class:"className","stroke-width":"strokeWidth","stroke-linecap":"strokeLinecap","stroke-linejoin":"strokeLinejoin","vector-effect":"vectorEffect"}})}/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ae=a=>{for(const e in a)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1},je=d.createContext({}),qe=()=>d.useContext(je),Le=d.forwardRef(({color:a,size:e,width:n,height:o,strokeWidth:h,absoluteStrokeWidth:y,nonScalingStroke:k,className:p="",children:s,iconNode:u=[],icon:w={node:u,aliases:[],size:24},...M},x)=>{const{size:m=24,strokeWidth:c=2,absoluteStrokeWidth:r=!1,nonScalingStroke:l=!1,color:_="currentColor",className:z=""}=qe()??{},xe=!!s||Ae(M),[_e,ze,we=[]]=Ce(w,{color:a??_,width:n??e??m,height:o??e??m,strokeWidth:h??c,absoluteStrokeWidth:y??r,nonScalingStroke:k??l,className:g(z,p),hasA11yProp:xe,attributes:M});return d.createElement(_e,{ref:x,...ze},[...we.map(([Me,fe])=>d.createElement(Me,fe)),...Array.isArray(s)?s:[s]])});/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function t(a,e=[],n=[]){const o=typeof a=="string"?ve(a,e,n):a,h=d.forwardRef(({className:y,...k},p)=>d.createElement(Le,{ref:p,icon:o,className:y,...k}));return o.name&&(h.displayName=be(o.name)),h}/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v={name:"activity",size:24,node:[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]};v.node;const He=t(v);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D={name:"arrow-down",size:24,node:[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]]};D.node;const Ne=t(D);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b={name:"arrow-right",size:24,node:[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]};b.node;const Ve=t(b);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $={name:"arrow-up-down",size:24,node:[["path",{d:"m21 16-4 4-4-4",key:"f6ql7i"}],["path",{d:"M17 20V4",key:"1ejh1v"}],["path",{d:"m3 8 4-4 4 4",key:"11wl7u"}],["path",{d:"M7 4v16",key:"1glfcx"}]]};$.node;const Ee=t($);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C={name:"arrow-up",size:24,node:[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]]};C.node;const Pe=t(C);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A={name:"check",size:24,node:[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]};A.node;const We=t(A);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j={name:"chevron-left",size:24,node:[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]};j.node;const Ie=t(j);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q={name:"chevron-right",size:24,node:[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]};q.node;const Be=t(q);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L={name:"circle-check",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m16 9-5.5 5.5L8 12",key:"xofnsj"}]],aliases:["check-circle-2"]};L.node;const Re=t(L);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S={name:"circle-exclamation-point",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],aliases:["alert-circle","circle-alert"]};S.node;const Fe=t(S);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const H={name:"clock",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]]};H.node;const Te=t(H);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N={name:"copy",size:24,node:[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]};N.node;const Ke=t(N);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V={name:"cpu",size:24,node:[["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M17 20v2",key:"1rnc9c"}],["path",{d:"M17 2v2",key:"11trls"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M2 17h2",key:"7oei6x"}],["path",{d:"M2 7h2",key:"asdhe0"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"M20 17h2",key:"1fpfkl"}],["path",{d:"M20 7h2",key:"1o8tra"}],["path",{d:"M7 20v2",key:"4gnj0m"}],["path",{d:"M7 2v2",key:"1i4yhu"}],["rect",{x:"4",y:"4",width:"16",height:"16",rx:"2",key:"1vbyd7"}],["rect",{x:"8",y:"8",width:"8",height:"8",rx:"1",key:"z9xiuo"}]]};V.node;const Ue=t(V);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E={name:"database",size:24,node:[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]};E.node;const Ge=t(E);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P={name:"ellipsis-vertical",size:24,node:[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"12",cy:"5",r:"1",key:"gxeob9"}],["circle",{cx:"12",cy:"19",r:"1",key:"lyex9k"}]],aliases:["more-vertical"]};P.node;const Je=t(P);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W={name:"external-link",size:24,node:[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]};W.node;const Oe=t(W);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I={name:"eye",size:24,node:[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]};I.node;const Ze=t(I);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B={name:"funnel",size:24,node:[["path",{d:"M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",key:"sc7q7i"}]],aliases:["filter"]};B.node;const Qe=t(B);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R={name:"hard-drive",size:24,node:[["path",{d:"M10 16h.01",key:"1bzywj"}],["path",{d:"M2.212 11.577a2 2 0 0 0-.212.896V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.527a2 2 0 0 0-.212-.896L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",key:"18tbho"}],["path",{d:"M21.946 12.013H2.054",key:"zqlbp7"}],["path",{d:"M6 16h.01",key:"1pmjb7"}]]};R.node;const Xe=t(R);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const F={name:"inbox",size:24,node:[["polyline",{points:"22 12 16 12 14 15 10 15 8 12 2 12",key:"o97t9d"}],["path",{d:"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",key:"oot6mr"}]]};F.node;const Ye=t(F);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T={name:"info",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]};T.node;const et=t(T);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K={name:"key",size:24,node:[["path",{d:"m2 21 9.6-9.6",key:"9l79m3"}],["path",{d:"m7.5 15.5 2.3 2.3a1 1 0 0 1 0 1.4l-2.1 2.1a1 1 0 0 1-1.4 0L4 19",key:"fw8biw"}],["circle",{cx:"15.5",cy:"7.5",r:"5.5",key:"4wxmhb"}]]};K.node;const tt=t(K);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U={name:"laptop",size:24,node:[["path",{d:"M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z",key:"1pdavp"}],["path",{d:"M20.054 15.987H3.946",key:"14rxg9"}]]};U.node;const at=t(U);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G={name:"layers",size:24,node:[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]],aliases:["layers-3"]};G.node;const ot=t(G);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J={name:"layout-dashboard",size:24,node:[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]]};J.node;const nt=t(J);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O={name:"loader-circle",size:24,node:[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],aliases:["loader-2"]};O.node;const ct=t(O);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z={name:"menu",size:24,node:[["path",{d:"M4 5h16",key:"1tepv9"}],["path",{d:"M4 12h16",key:"1lakjw"}],["path",{d:"M4 19h16",key:"1djgab"}]]};Z.node;const st=t(Z);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q={name:"moon",size:24,node:[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]]};Q.node;const it=t(Q);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X={name:"network",size:24,node:[["rect",{x:"16",y:"16",width:"6",height:"6",rx:"1",key:"4q2zg0"}],["rect",{x:"2",y:"16",width:"6",height:"6",rx:"1",key:"8cvhb9"}],["rect",{x:"9",y:"2",width:"6",height:"6",rx:"1",key:"1egb70"}],["path",{d:"M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3",key:"1jsf9p"}],["path",{d:"M12 12V8",key:"2874zd"}]]};X.node;const dt=t(X);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Y={name:"octagon-exclamation-point",size:24,node:[["path",{d:"M12 16h.01",key:"1drbdi"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z",key:"1fd625"}]],aliases:["alert-octagon","octagon-alert"]};Y.node;const ht=t(Y);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee={name:"palette",size:24,node:[["path",{d:"M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z",key:"e79jfc"}],["circle",{cx:"13.5",cy:"6.5",r:".5",fill:"currentColor",key:"1okk4w"}],["circle",{cx:"17.5",cy:"10.5",r:".5",fill:"currentColor",key:"f64h9f"}],["circle",{cx:"6.5",cy:"12.5",r:".5",fill:"currentColor",key:"qy21gx"}],["circle",{cx:"8.5",cy:"7.5",r:".5",fill:"currentColor",key:"fotxhn"}]]};ee.node;const rt=t(ee);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te={name:"pause",size:24,node:[["rect",{x:"14",y:"3",width:"5",height:"18",rx:"1",key:"kaeet6"}],["rect",{x:"5",y:"3",width:"5",height:"18",rx:"1",key:"1wsw3u"}]]};te.node;const lt=t(te);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ae={name:"play",size:24,node:[["path",{d:"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",key:"10ikf1"}]]};ae.node;const yt=t(ae);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const oe={name:"plus",size:24,node:[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]};oe.node;const kt=t(oe);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ne={name:"radio",size:24,node:[["path",{d:"M16.247 7.761a6 6 0 0 1 0 8.478",key:"1fwjs5"}],["path",{d:"M19.075 4.933a10 10 0 0 1 0 14.134",key:"ehdyv1"}],["path",{d:"M4.925 19.067a10 10 0 0 1 0-14.134",key:"1q22gi"}],["path",{d:"M7.753 16.239a6 6 0 0 1 0-8.478",key:"r2q7qm"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]};ne.node;const pt=t(ne);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ce={name:"refresh-cw",size:24,node:[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]};ce.node;const mt=t(ce);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const se={name:"search",size:24,node:[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]]};se.node;const ut=t(se);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ie={name:"server",size:24,node:[["rect",{width:"20",height:"8",x:"2",y:"2",rx:"2",ry:"2",key:"ngkwjq"}],["rect",{width:"20",height:"8",x:"2",y:"14",rx:"2",ry:"2",key:"iecqi9"}],["line",{x1:"6",x2:"6.01",y1:"6",y2:"6",key:"16zg32"}],["line",{x1:"6",x2:"6.01",y1:"18",y2:"18",key:"nzw8ys"}]]};ie.node;const xt=t(ie);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const de={name:"settings",size:24,node:[["path",{d:"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",key:"1i5ecw"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]};de.node;const _t=t(de);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const he={name:"shield-check",size:24,node:[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]};he.node;const zt=t(he);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const re={name:"sliders-horizontal",size:24,node:[["path",{d:"M10 5H3",key:"1qgfaw"}],["path",{d:"M12 19H3",key:"yhmn1j"}],["path",{d:"M14 3v4",key:"1sua03"}],["path",{d:"M16 17v4",key:"1q0r14"}],["path",{d:"M21 12h-9",key:"1o4lsq"}],["path",{d:"M21 19h-5",key:"1rlt1p"}],["path",{d:"M21 5h-7",key:"1oszz2"}],["path",{d:"M8 10v4",key:"tgpxqk"}],["path",{d:"M8 12H3",key:"a7s4jb"}]]};re.node;const wt=t(re);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const le={name:"sun",size:24,node:[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]};le.node;const Mt=t(le);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ye={name:"terminal",size:24,node:[["path",{d:"M12 19h8",key:"baeox8"}],["path",{d:"m4 17 6-6-6-6",key:"1yngyt"}]]};ye.node;const ft=t(ye);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ke={name:"thermometer",size:24,node:[["path",{d:"M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z",key:"17jzev"}]]};ke.node;const gt=t(ke);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pe={name:"trash",size:24,node:[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],aliases:["trash-2"]};pe.node;const vt=t(pe);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const me={name:"triangle-exclamation-point",size:24,node:[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],aliases:["alert-triangle","triangle-alert"]};me.node;const Dt=t(me);/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ue={name:"x",size:24,node:[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]};ue.node;const bt=t(ue);export{He as A,Re as B,Ue as C,Ge as D,Oe as E,Qe as F,vt as G,Xe as H,et as I,zt as J,tt as K,nt as L,st as M,dt as N,ht as O,yt as P,rt as Q,pt as R,_t as S,Dt as T,bt as X,xt as a,mt as b,it as c,Mt as d,at as e,Fe as f,gt as g,Ne as h,Pe as i,ct as j,lt as k,wt as l,ot as m,ft as n,We as o,Ke as p,Te as q,Ve as r,ut as s,kt as t,Je as u,Ze as v,Ye as w,Ie as x,Be as y,Ee as z};
