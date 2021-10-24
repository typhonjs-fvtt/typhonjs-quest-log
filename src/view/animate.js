import { gsap } from '/scripts/greensock/esm/all.js';

export default function animate(node, { type, ...args })
{
   const method = gsap[type];
   return method(node, args);
}