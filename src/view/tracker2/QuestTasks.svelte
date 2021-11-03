<script>
   import { getContext, onDestroy } from 'svelte';
   import { quintIn, quintOut }     from 'svelte/easing';
   import { slideFade }             from '@typhonjs-fvtt/svelte/transition';

   import { sessionConstants }      from '#constants';

   const eventbus = getContext('external').eventbus;

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

   // Provide a latched animation so slide down is only activated on a click and not when component is shown.
   const animation = (node, options) => animationLatch > 0 ? slideFade(node, options) : void 0;
</script>

{#if $storeShowObjectives}
   <ul class=tasks
      in:animation|local={{duration: 350, easing: quintIn}}
      out:slideFade|local={{duration: 350, easing: quintOut}}>
      <li class=quest-tracker-task>
         <!--            <div class=task><span class={{state}}></span></div>-->
         <div class=task><span>- Objectives</span></div>
      </li>
      <li class=quest-tracker-task>
         <div class=task><span>- Objectives</span></div>
      </li>
      <li class=quest-tracker-task>
         <div class=task><span>- Objectives</span></div>
      </li>
   </ul>
{/if}
