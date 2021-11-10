<script>
   import {
      beforeUpdate,
      onMount,
      onDestroy}     from 'svelte';
   import { fade }   from 'svelte/transition';

   beforeUpdate(() =>
   {
      console.log(`Demo.svelte - beforeUpdate`);
   });

   onMount(() =>
   {
      console.log(`Demo.svelte - onMount`);
   });

   onDestroy(() =>
   {
      console.log(`Demo.svelte - onDestroy`);
   });

   let desc = false;
   export let test;
</script>

<div>
<main
    in:fade={{ duration: 3000 }}
    on:introend="{() => (desc = true)}">
    <h1>Hello {test}!</h1>
</main>

{#if desc}
    <p in:fade={{ duration: 3000 }}>
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