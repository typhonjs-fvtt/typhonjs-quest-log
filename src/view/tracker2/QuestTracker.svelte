<script>
   import PrimaryQuest           from './PrimaryQuest.svelte';
   import QuestList              from './QuestList.svelte';

   import { sessionConstants }   from '../../constants.js';

   import { beforeUpdate, getContext, onMount, onDestroy, setContext } from 'svelte';

   beforeUpdate(() =>
   {
      console.log(`QuestTracker.svelte - beforeUpdate`);
   });

   onMount(() =>
   {
      console.log(`QuestTracker.svelte - onMount`);
   });

   onDestroy(() =>
   {
      console.log(`QuestTracker.svelte - onDestroy`);
   });

   let storeTrackerShowPrimary = getContext('eventbus')().triggerSync('tql:storage:session:store:get',
    sessionConstants.trackerShowPrimary, false);

</script>
<svelte:component this={$storeTrackerShowPrimary ? PrimaryQuest : QuestList} />
