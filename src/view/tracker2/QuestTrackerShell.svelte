<script>
   import { getContext, setContext }   from 'svelte';

   import { TJSApplicationHeader }     from '@typhonjs-fvtt/svelte/component';

   import MainContainer                from './MainContainer.svelte';

   import { constants, sessionConstants, settings }   from '#constants';

   let content, root;

   setContext('getElementContent', () => content);
   setContext('getElementRoot', () => root);

   const foundryApp = getContext('external').foundryApp;

   const storeTrackerShowBackground = getContext('external').eventbus.triggerSync('tql:storage:session:store:get',
    sessionConstants.trackerShowBackground, true);

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
      if (content)
      {
         // Potentially change the local latch for scroll bars active.
         scrollActivated = content.clientHeight < content.scrollHeight;
      }

      if (root)
      {
         // Save position of the root on any root or client change when quest tracker isn't resizable / auto-mode.
         if (!game.settings.get(constants.moduleName, settings.questTrackerResizable))
         {
            game.settings.set(constants.moduleName, settings.questTrackerPosition, JSON.stringify({
               top: parseInt(root.style.top, 10),
               left: parseInt(root.style.left, 10),
               width: root.clientWidth,
               height: root.clientHeight
            }));
         }
      }
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
   <TJSApplicationHeader title = {foundryApp.title} headerButtons= {foundryApp._getHeaderButtons()} />
   <section class=window-content bind:this={content} bind:clientHeight={heightChanged}>
      <MainContainer />
   </section>
</div>

<style>
   /* Defines the styles for that mimics a popout Application. `:global` is used to preserve the unused CSS */
   :global(.typhonjs-app) {
      max-height: 100%;
      background: url(/ui/denim075.png) repeat;
      border-radius: 5px;
      box-shadow: 0 0 20px #000;
      margin: 3px 0;
      color: #f0f0e0;
      position: absolute;
   }

   :global(.typhonjs-window-app) {
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      justify-content: flex-start;
      padding: 0;
      z-index: 99;
   }

   :global(.typhonjs-window-app .window-content) {
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      justify-content: flex-start;
      padding: 8px;
      color: #191813;
      overflow-y: auto;
      overflow-x: hidden;
   }

   :global(.typhonjs-window-app .window-header) {
      flex: 0 0 30px;
      overflow: hidden;
      padding: 0 8px;
      line-height: 30px;
      border-bottom: 1px solid #000;
      pointer-events: auto;
   }

   :global(.typhonjs-window-app .window-header a) {
      flex: none;
      margin: 0 0 0 8px;
   }

   :global(.typhonjs-window-app .window-header h4) {
      font-family: Signika, sans-serif;
   }

   :global(.typhonjs-window-app .window-header i[class^=fa]) {
      margin-right: 3px;
   }

   :global(.typhonjs-window-app .window-header .window-title) {
      margin: 0;
      word-break: break-all;
   }

   :global(.typhonjs-window-app .window-resizable-handle) {
      width: 20px;
      height: 20px;
      position: absolute;
      bottom: -1px;
      right: 0;
      background: #444;
      padding: 2px;
      border: 1px solid #111;
      border-radius: 4px 0 0 0;
   }

   :global(.typhonjs-window-app .window-resizable-handle i.fas) {
      transform: rotate(45deg);
   }

   :global(.typhonjs-window-app.minimized .window-header) {
      border: 1px solid #000;
   }

   :global(.typhonjs-window-app.minimized .window-resizable-handle) {
      display: none;
   }
</style>