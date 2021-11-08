<script>
   import { getContext }   from 'svelte';
   import { fade }         from 'svelte/transition';

   import Quest            from './Quest.svelte';

   import { questStatus }  from '#constants';

   let storeQuests = getContext('external').eventbus.triggerSync('tql:questdb:store:get',
    { status: questStatus.active });
</script>
<div class=quests in:fade={{duration: 200}}>
{#each $storeQuests as questEntry (questEntry.quest.id)}
   <Quest {questEntry} />
{/each}
</div>