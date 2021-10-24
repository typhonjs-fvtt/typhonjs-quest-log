<script>
   import { beforeUpdate, onMount, onDestroy }	from 'svelte';
   import animate                               from '../animate.js';

   beforeUpdate(() =>
   {
      console.log(`App.svelte - beforeUpdate - 0`);
      console.log(`App.svelte - beforeUpdate - 1`);
   });

   onMount(() =>
   {
      console.log(`App.svelte - onMount`);
   });

   onDestroy(() =>
   {
      console.log(`App.svelte - onDestroy`);
   });
   let desc = false;
   export let test;
</script>

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