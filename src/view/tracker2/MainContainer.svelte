<script>
   import { getContext }         from 'svelte';

   import { resizeObserver }     from '@typhonjs-fvtt/runtime/svelte/action';

   import PrimaryQuest           from './PrimaryQuest.svelte';
   import QuestList              from './QuestList.svelte';

   import { sessionConstants }   from '#constants';

   let storeTrackerShowPrimary = getContext('external').eventbus.triggerSync('tql:storage:session:store:get',
    sessionConstants.trackerShowPrimary, false);

   export let containerOffsetHeight = false;

   function onResize(offsetWidth, offsetHeight)
   {
      containerOffsetHeight = offsetHeight;
   }
</script>
<div use:resizeObserver={onResize}>
   <svelte:component this={$storeTrackerShowPrimary ? PrimaryQuest : QuestList} />
</div>
