<script>
   import { beforeUpdate, onMount, onDestroy }	from 'svelte';

   beforeUpdate(() =>
   {
      console.log(`DemoPopOut.svelte - beforeUpdate`);
   });

   onMount(() =>
   {
      console.log(`DemoPopOut.svelte - onMount`);
   });

   onDestroy(() =>
   {
      console.log(`DemoPopOut.svelte - onDestroy`);
   });
</script>

<p>Test content!!!</p>

<style>
   p {
      color: white;
      font-size: 30px;
   }
</style>