<script>
   import { getContext }         from 'svelte';
   import { localize }           from '@typhonjs-fvtt/svelte/helpers';

   import { sessionConstants }   from "../../constants";

   const eventbus = getContext('eventbus')();

   let currentPrimaryQuest = eventbus.triggerSync('tql:storage:session:store:get',
    sessionConstants.currentPrimaryQuest);

   let questEntry;

   $: if (currentPrimaryQuest)
   {
      questEntry = eventbus.triggerSync('tql:questdb:quest:entry:get', $currentPrimaryQuest);
   }
</script>

{#if questEntry}
   {questEntry.quest.name}
{:else}
   <div class="no-quests">{localize('TyphonJSQuestLog.QuestTracker.NoPrimary')}</div>
{/if}

