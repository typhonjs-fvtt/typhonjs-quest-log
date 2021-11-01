<script>
   import { getContext }         from 'svelte';
   import { slide }              from 'svelte/transition';
   import { quintOut }           from 'svelte/easing';

   import { slideFade }          from './slideFade.js';

   import { createMultiClick }   from '@typhonjs-svelte/lib/handlers';

   import QuestTasks             from './QuestTasks.svelte';

   import { sessionConstants }   from '#constants';

   const eventbus = getContext('external')().eventbus;

   let quest;
   let questId;
   let hidden = false;

   export let questEntry;

   /**
    * Create single / double click handler for clicking on the quest name.
    *
    * @type {(function(): void)}
    */
   const handleClick = createMultiClick({
      single: () => eventbus.triggerSync('tql:storage:session:item:boolean:swap',
       `${sessionConstants.trackerFolderState}${questId}`),

      double: () => eventbus.trigger('tql:questapi:open', { questId })
   });

   $: if(questEntry)
   {
      quest = questEntry.quest;
      questId = quest.id;
      hidden = questEntry.isHidden || questEntry.isInactive;
   }
</script>
<div class="quest"
   transition:slide|local={{ duration: 600, easing: quintOut}}
>
   <div class="title" id="{hidden ? 'hidden' : ''}">
      <div class="quest-tracker-header"
         on:click|preventDefault = {handleClick}>
         <a>{quest.name}</a>
      </div>
      <span class="quest-tracker-span"></span>
      <!-- insert icons here -->
   </div>
   <QuestTasks {questEntry} />
</div>
