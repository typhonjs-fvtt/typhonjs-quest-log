<script>
   import { getContext, onDestroy } from 'svelte';
   import { quintInOut }            from "svelte/easing";
   import { slide }                 from 'svelte/transition';

   import { sessionConstants }      from '#constants';

   const eventbus = getContext('external')().eventbus;

   let storeShowObjectives;
   let animationLatch = -1;
   let unsubscribe;

   export let questEntry;

   onDestroy(() => unsubscribe());

   $: if (questEntry)
   {
      const questId = questEntry.quest.id;
      storeShowObjectives = eventbus.triggerSync('tql:storage:session:store:get',
       `${sessionConstants.trackerFolderState}${questId}`, false);

      unsubscribe = storeShowObjectives.subscribe(() => animationLatch++);
   }

   const animation = (node, options) => animationLatch > 0 ? slide(node, options) : void 0;
</script>

{#if $storeShowObjectives}
   <ul class=tasks
       in:animation|local={{duration: 200, easing: quintInOut}}
       out:slide|local={{duration: 200, easing: quintInOut}}
   >
      <li class="quest-tracker-task">
         <!--            <div class="task><span class="{{state}}"></span></div>-->
         <div class="task"><span>- Objectives</span></div>
      </li>
      <li class="quest-tracker-task">
         <div class="task"><span>- Objectives</span></div>
      </li>
      <li class="quest-tracker-task">
         <div class="task"><span>- Objectives</span></div>
      </li>
   </ul>
{/if}
