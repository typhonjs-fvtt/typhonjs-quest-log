<script>
   import { getContext }   from 'svelte';

   import Quest            from './Quest.svelte';

   import { questStatus }  from '../../constants.js';

   const eventbus = getContext('eventbus')();

   let storeQuests = eventbus.triggerSync('tql:questdb:store:get', { status: questStatus.active })
</script>

{#each $storeQuests as questEntry (questEntry.quest.id)}
   <Quest {questEntry} />
{/each}