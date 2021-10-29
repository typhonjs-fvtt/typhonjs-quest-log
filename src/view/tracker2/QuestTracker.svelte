<script>
   import { ApplicationHeader }  from '@typhonjs-fvtt/svelte';

   import PrimaryQuest           from './PrimaryQuest.svelte';
   import QuestList              from './QuestList.svelte';

   import { sessionConstants }   from '../../constants.js';

   import { beforeUpdate, onMount, onDestroy, setContext } from 'svelte';

   beforeUpdate(() =>
   {
      console.log(`QuestTracker.svelte - beforeUpdate`);
   });

   onMount(() =>
   {
      console.log(`QuestTracker.svelte - onMount - app.options.title:\n${_foundryApp.title}`);

      storeTrackerShowPrimary = _foundryApp._eventbus.triggerSync('tql:storage:session:store:get',
       sessionConstants.trackerShowPrimary, false);
   });

   onDestroy(() =>
   {
      console.log(`QuestTracker.svelte - onDestroy`);
   });

   setContext('getApp', () => _foundryApp);

   let storeTrackerShowPrimary;

   let component;

   export let _foundryApp;

   $: if (storeTrackerShowPrimary)
   {
      component = $storeTrackerShowPrimary ? PrimaryQuest : QuestList;
   }
</script>
<div id="{_foundryApp.id}" class="tql-app tql-window-app" data-appid="{_foundryApp.appId}">
   <ApplicationHeader title = {_foundryApp.title} headerButtons= {_foundryApp._getHeaderButtons()} />
   <section class="window-content">
      <svelte:component this={component} />
   </section>
</div>
