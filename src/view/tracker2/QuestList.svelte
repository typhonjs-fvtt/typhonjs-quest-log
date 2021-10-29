<script>
   import { getContext }   from 'svelte';

   import { questStatus }  from '../../constants.js';

   const getApp = getContext('getApp');

   let storeQuests = getApp()._eventbus.triggerSync('tql:questdb:store:get', { status: questStatus.active })
</script>

{#each $storeQuests as questEntry (questEntry.quest.id)}
   <p>{questEntry.quest.name}</p>
{/each}