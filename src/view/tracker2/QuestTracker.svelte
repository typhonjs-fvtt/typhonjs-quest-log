<script>
   import { HeaderButton }       from '@typhonjs-fvtt/svelte';
   import { sessionConstants }   from '../../model/constants.js';

   import { beforeUpdate, onMount, onDestroy, setContext } from 'svelte';

   beforeUpdate(() =>
   {
      console.log(`QuestTracker.svelte - beforeUpdate`);
   });

   onMount(() =>
   {
      console.log(`QuestTracker.svelte - onMount - app.options.title:\n${_foundryApp.title}`);

      headerButtons = _foundryApp._getHeaderButtons();

      storeTrackerShowPrimary = _foundryApp._eventbus.triggerSync('tql:storage:session:store:get',
       sessionConstants.trackerShowPrimary);
   });

   onDestroy(() =>
   {
      console.log(`QuestTracker.svelte - onDestroy`);
   });

   setContext('getApp', () => _foundryApp);

   let storeTrackerShowPrimary;

   let headerButtons = [];
   let trackerShowPrimary = false

   export let _foundryApp;

   $: if (storeTrackerShowPrimary)
   {
      trackerShowPrimary = $storeTrackerShowPrimary;
   }
</script>
<div id="{_foundryApp.id}" class="tql-app tql-window-app" data-appid="{_foundryApp.appId}">
   <header class="window-header flexrow">
      <h4 class="window-title">{_foundryApp.title}</h4>
      {#each headerButtons as button}
         <HeaderButton {button}/>
      {/each}
   </header>
   <section class="window-content">
   {#if trackerShowPrimary}
      Test content - showPrimary: true
   {:else}
      Test content - showPrimary: false
   {/if}
   </section>
</div>
