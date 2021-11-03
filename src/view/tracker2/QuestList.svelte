<script>
   import { getContext }   from 'svelte';

   import Quest            from './Quest.svelte';

   import { questStatus }  from '#constants';

   let storeQuests = getContext('external').eventbus.triggerSync('tql:questdb:store:get',
    { status: questStatus.active });
</script>
<div class=quests>
{#each $storeQuests as questEntry (questEntry.quest.id)}
   <Quest {questEntry} />
{/each}
</div>