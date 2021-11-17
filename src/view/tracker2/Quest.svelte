<script>
   import { getContext }         from 'svelte';
   import { quintOut }           from 'svelte/easing';

   import { TJSMenu }            from '@typhonjs-fvtt/svelte/application';
   import { slideFade }          from '@typhonjs-fvtt/svelte/transition';
   import { createMultiClick }   from '@typhonjs-fvtt/svelte/handler';

   import createMenuItems        from './createMenuItems.js';

   import QuestTasks             from './QuestTasks.svelte';

   import { sessionConstants }   from '#constants';

   const eventbus = getContext('external').eventbus;

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

   function handleContext(event)
   {
      TJSMenu.createContext({
         duration: 200,
         id: 'tjs-quest-menu',
         x: event.pageX,
         y: event.pageY,
         items: createMenuItems({questId, name: quest.name, eventbus })
      });
   }

   $: if(questEntry)
   {
      quest = questEntry.quest;
      questId = quest.id;
      hidden = questEntry.isHidden || questEntry.isInactive;
   }
</script>
<div class=quest transition:slideFade|local={{ duration: 400, easing: quintOut}}>
   <div class=title id={hidden ? 'hidden' : ''}>
      <div class=quest-tracker-header on:click|preventDefault={handleClick} on:contextmenu|preventDefault={handleContext}>
         <a>{quest.name}</a>
      </div>
      <span class=quest-tracker-span></span>
      <!-- insert icons here -->
   </div>
   <QuestTasks {questEntry} />
</div>
