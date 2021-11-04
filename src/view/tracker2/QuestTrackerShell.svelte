<script>
   import { getContext, setContext }   from 'svelte';
   import { ApplicationHeader }        from '@typhonjs-fvtt/svelte';

   import MainContainer                from './MainContainer.svelte';

   import { constants, sessionConstants, settings }   from '#constants';

   let content, root;

   setContext('getElementContent', () => content);
   setContext('getElementRoot', () => root);

   const foundryApp = getContext('external').foundryApp;

   const storeTrackerShowBackground = getContext('external').eventbus.triggerSync('tql:storage:session:store:get',
    sessionConstants.trackerShowBackground, false);

   // Stores height changes between root / content elements and is used as a latch to calculate scroll bar activation
   // and saving the current root position into module settings for `questTrackerPosition`.
   let heightChanged;

   let scrollActivated = false;

   // A customized ApplicationShell is used to monitor the root & content clientHeight. Provides a check to compare
   // against the scrollHeight to determine if the scrollbar is visible. This allows the QuestTracker to pass mouse
   // events through to elements below the QuestTracker when scroll bars are not present. Also the current root
   // position is saved to the `questTrackerPosition`. This allows tracking of position across resizable window or
   // when `height` is set to `auto`. This allows position settings to be accurately saved for reload of the game w/
   // either resizable setting and smooth swap between states.

   // Throttle the scrollbar activated checks and root / questTrackerPosition changes.
   const throttle = foundry.utils.debounce(() =>
   {
      // Potentially change the local latch for scroll bars active.
      scrollActivated = content.clientHeight < content.scrollHeight;

      // Save position of the root on any root or client change.
      game.settings.set(constants.moduleName, settings.questTrackerPosition, JSON.stringify({
         top: parseInt(root.style.top, 10),
         left: parseInt(root.style.left, 10),
         width: root.clientWidth,
         height: root.clientHeight
      }));
   }, 400);

   // When heightChanged which is binded to the root & content clientHeight changes execute throttle function.
   $: if (content) { throttle(heightChanged); }

   // Set the `pointer-events` CSS attribute when scrollActivated changes.
   $: if (root)
   {
      root.style.pointerEvents = scrollActivated ? 'auto' : 'none';
   }

   // ------

   // Depending on the storeTrackerShowBackground boolean state add or remove the `no-background` class.
   $: if (root && storeTrackerShowBackground)
   {
      root.classList[$storeTrackerShowBackground ? 'remove' : 'add']('no-background');
   }
</script>

<div id={foundryApp.id} class="typhonjs-app typhonjs-window-app" data-appid={foundryApp.appId} bind:clientHeight={heightChanged} bind:this={root}>
   <ApplicationHeader title = {foundryApp.title} headerButtons= {foundryApp._getHeaderButtons()} />
   <section class=window-content bind:this={content} bind:clientHeight={heightChanged}>
      <MainContainer />
   </section>
</div>
