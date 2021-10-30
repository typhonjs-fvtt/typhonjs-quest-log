<script>
   import { fade }      from 'svelte/transition';
   // import { animate }   from '@typhonjs-fvtt/svelte/gsap';
   import { animate }               from './animate.js';

   import { getContext, onMount }   from 'svelte';

   import { createMultiClick }      from '@typhonjs-svelte/lib/handlers';

   import { sessionConstants }      from "../../constants";

   const eventbus = getContext('eventbus')();

   let quest;
   let questId;
   let hidden = false;

   let storeShowObjectives;

   export let questEntry;

   /**
    * Create single / double click handler for clicking on the quest name.
    *
    * @type {(function(): void)}
    */
   const handleClick = createMultiClick({
      single: () => eventbus.trigger('tql:storage:session:item:boolean:swap',
       `${sessionConstants.trackerFolderState}${questId}`),

      double: () => eventbus.trigger('tql:questapi:open', { questId })
   });

   onMount(() =>
   {
      storeShowObjectives = eventbus.triggerSync('tql:storage:session:store:get',
       `${sessionConstants.trackerFolderState}${questId}`, false);
   });

   $: if(questEntry)
   {
      quest = questEntry.quest;
      questId = quest.id;
      hidden = questEntry.isHidden || questEntry.isInactive;
   }
</script>

<div class="quest">
   <div class="title" id="{hidden ? 'hidden' : ''}">
      <div class="quest-tracker-header"
         on:click|preventDefault = {handleClick}>
         <a>{quest.name}</a>
      </div>
      <span class="quest-tracker-span"></span>
      <!-- insert icons here -->
   </div>
   {#if $storeShowObjectives}
      <ul class="tasks">
         <li class="quest-tracker-task">
<!--            <div class="task><span class="{{state}}"></span></div>-->
            <div class="task"><span>- Objectives</span></div>
         </li>
      </ul>
   {/if}
</div>

<!-- in:animate={{ type: 'from', duration: 2, opacity: 0 }}-->
<!-- out:fade>-->
