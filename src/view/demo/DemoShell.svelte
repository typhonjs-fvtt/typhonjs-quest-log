<script>
   import { beforeUpdate, onMount, onDestroy, getContext } from 'svelte';
   import { animate }                           from '@typhonjs-fvtt/svelte/gsap';

   beforeUpdate(() =>
   {
      console.log(`DemoShell.svelte - beforeUpdate`);
   });

   onMount(() =>
   {
      console.log(`DemoShell.svelte - onMount - title: ${foundryApp ? foundryApp.title : 'NO TITLE / APP'}`);
      console.log(`DemoShell.svelte - onMount - external context TEST: ${TEST}`);
   });

   onDestroy(() =>
   {
      console.log(`DemoShell.svelte - onDestroy`);
   });
   const foundryApp = getContext('external')().foundryApp;
   const TEST = getContext('external')().TEST;

   let desc = false;
   export let test;
</script>

<div>
<main
    use:animate={{ type: 'from', duration: 5, opacity: 0, onComplete: () => (desc = true) }}>
    <h1>Hello {test}!</h1>
</main>

{#if desc}
    <p
        transition:animate={{ type: 'from', duration: 5, opacity: 0 }} class="desc">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae natus libero quisquam, aliquam quod vel quia necessitatibus? Cupiditate, excepturi nisi. Nam tempora ex numquam voluptatum minima similique sequi, fugit placeat!
    </p>
{/if}
</div>

<style>
    main {
        text-align: center;
        padding: 1em;
        max-width: 240px;
        margin: 0 auto;
    }

    h1 {
        color: #ff3e00;
        text-transform: uppercase;
        font-size: 4em;
        font-weight: 100;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
</style>