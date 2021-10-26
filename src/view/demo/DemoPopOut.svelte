<script>
   import { beforeUpdate, onMount, onDestroy }	from 'svelte';
   import animate                               from '../animate.js';

   beforeUpdate(() =>
   {
      console.log(`App.svelte - beforeUpdate`);
   });

   onMount(() =>
   {
      console.log(`App.svelte - onMount - app.options.title:\n${_foundryApp.title}`);
   });

   onDestroy(() =>
   {
      console.log(`App.svelte - onDestroy`);
   });

   export let _foundryApp;
</script>

<div id="{_foundryApp.id}" class="tql-app tql-window-app" data-appid="{_foundryApp.appId}">
   <header class="window-header flexrow">
      <h4 class="window-title">{_foundryApp.title}</h4>
   </header>
   <section class="window-content">
   Test content!!!
   </section>
</div>