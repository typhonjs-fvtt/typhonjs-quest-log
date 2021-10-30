<script>
   import { getContext }         from 'svelte';

   import PrimaryQuest           from './PrimaryQuest.svelte';
   import QuestList              from './QuestList.svelte';

   import { sessionConstants }   from '#constants';

   let storeTrackerShowPrimary = getContext('eventbus')().triggerSync('tql:storage:session:store:get',
    sessionConstants.trackerShowPrimary, false);
</script>
<svelte:component this={$storeTrackerShowPrimary ? PrimaryQuest : QuestList} />
