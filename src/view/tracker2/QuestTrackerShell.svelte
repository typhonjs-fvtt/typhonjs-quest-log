<script>
   import { getContext }         from 'svelte';

   import TJSApplicationShell    from '../svelte/app/TJSApplicationShell.svelte';

   import MainContainer          from './MainContainer.svelte';

   import { constants, sessionConstants, settings }   from '#constants';

   // Bound to TJSApplicationShell content & root elements.
   let elementContent, elementRoot;

   // Stores height changes between root / content elements and is used as a latch to calculate scroll bar activation
   // and saving the current root position into module settings for `questTrackerPosition`.
   let heightChangedContent = true;
   let heightChangedRoot = true;

   // Tracks the scroll bar active state.
   let scrollActivated = false;

   // SessionStorage store for `trackerShowBackground`.
   const storeTrackerShowBackground = getContext('external').eventbus.triggerSync('tql:storage:session:store:get',
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
console.log(`!!!! scrollActivated: ${scrollActivated}`);
      }

      if (elementRoot)
      {
         // Save position of the root on any root or client change when quest tracker isn't resizable / auto-mode.
         if (!game.settings.get(constants.moduleName, settings.questTrackerResizable))
         {
            game.settings.set(constants.moduleName, settings.questTrackerPosition, JSON.stringify({
               top: parseInt(elementRoot.style.top, 10),
               left: parseInt(elementRoot.style.left, 10),
               width: elementRoot.clientWidth,
               height: elementRoot.clientHeight
            }));
         }
      }
   }, 400);

   // When heightChanged which is binded to the root & content clientHeight changes execute throttle function.
   $: if (elementContent)
   {
      console.log(`!!!! QTS: throttle`);
      throttle(heightChangedContent + heightChangedContent);
   }

   // Set the `pointer-events` CSS attribute when scrollActivated changes.
   $: if (elementRoot)
   {
      elementRoot.style.pointerEvents = scrollActivated ? 'auto' : 'none';
   }

   $: console.log(`!!! QTS - heightChangedContent: ${heightChangedContent}`);
   $: console.log(`!!! QTS - heightChangedRoot: ${heightChangedRoot}`);

   // ------

   // Depending on the storeTrackerShowBackground boolean state add or remove the `no-background` class.
   $: if (elementRoot && storeTrackerShowBackground)
   {
      elementRoot.classList[$storeTrackerShowBackground ? 'remove' : 'add']('no-background');
   }
</script>
<TJSApplicationShell bind:elementContent bind:elementRoot bind:heightChangedContent bind:heightChangedRoot >
   <MainContainer />
</TJSApplicationShell>