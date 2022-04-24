<script>
   import { getContext }            from 'svelte';
   import { scale }                 from 'svelte/transition';

   import { TJSApplicationShell }   from '@typhonjs-fvtt/runtime/svelte/component/core';

   import MainContainer             from './MainContainer.svelte';

   import { constants, sessionConstants, settings }   from '#constants';

   // Application shell contract (only elementRoot is required).
   export let elementContent, elementRoot;

   // Tracks the scroll bar active state.
   let scrollActivated = false;

   const context = getContext('external');

   const application = context.application;

   // SessionStorage store for `trackerShowBackground`.
   const storeTrackerShowBackground = context.eventbus.triggerSync('tql:storage:session:store:get',
    sessionConstants.trackerShowBackground, true);

   // A customized ApplicationShell is used to monitor the root & content clientHeight. Provides a check to compare
   // against the scrollHeight to determine if the scrollbar is visible. This allows the QuestTracker to pass mouse
   // events through to elements below the QuestTracker when scroll bars are not present. Also the current root
   // position is saved to the `questTrackerPosition`. This allows tracking of position across resizable window or
   // when `height` is set to `auto`. This allows position settings to be accurately saved for reload of the game w/
   // either resizable setting and smooth swap between states.

   // Throttle the scrollbar activated checks and root / questTrackerPosition changes.
   const throttle = foundry.utils.debounce(() =>
   {
      if (elementContent)
      {
         // Potentially change the local latch for scroll bars active.
         scrollActivated = elementContent.clientHeight < elementContent.scrollHeight;
      }

      if (elementRoot)
      {
         // Save position of the root on any root or client change when quest tracker isn't resizable / IE in auto-mode.
         if (!game.settings.get(constants.moduleName, settings.questTrackerResizable))
         {
            game.settings.set(constants.moduleName, settings.questTrackerPosition, JSON.stringify({
               top: application.position.top,
               left: application.position.left,
               width: elementRoot.clientWidth,
               height: elementRoot.clientHeight
            }));
         }
      }
   }, 400);

   // $: throttle(heightChanged);

   // Set the `pointer-events` CSS attribute when scrollActivated changes. This allows the QuestTracker to pass through
   // mouse / pointer events to the game canvas below when scroll bars are not activated. Pointer events need to be
   // turned on when the scrollbar is active.
   $: if (elementRoot)
   {
      elementRoot.style.pointerEvents = scrollActivated ? 'auto' : 'none';
   }

   // ------

   // Depending on the storeTrackerShowBackground boolean state add or remove the `no-background` class.
   $: if (elementRoot && storeTrackerShowBackground)
   {
      elementRoot.classList[$storeTrackerShowBackground ? 'remove' : 'add']('no-background');
   }

   // Stores height changes between root and container elements and is used as a latch to calculate scroll bar
   // activation and saving the current root position into module settings for `questTrackerPosition`. If passing true
   // to TJSApplicationShell `appOffsetHeight` enables a `resizeObserver` action on the element root.
   let containerOffsetHeight = true;
   let appOffsetHeight = true;

   // If either `containerOffsetHeight` or `appOffsetHeight` changes then invoke `throttle`.
   $: throttle(Number.isFinite(containerOffsetHeight) || Number.isFinite(appOffsetHeight));
</script>

<svelte:options accessors={true}/>

<TJSApplicationShell bind:elementContent bind:elementRoot bind:appOffsetHeight transition={scale}>
   <MainContainer bind:containerOffsetHeight/>
</TJSApplicationShell>