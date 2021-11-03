<script>
   import { getContext, setContext }         from "svelte";

   import { ApplicationHeader, Container }   from '@typhonjs-fvtt/svelte';

   import MainContainer                      from './MainContainer.svelte';

   import { sessionConstants }               from '#constants';

   export let context;

   let content, root;

   setContext('external', () => context);
   setContext('getElementContent', () => content);
   setContext('getElementRoot', () => root);

   const foundryApp = getContext('external')().foundryApp;

   const storeTrackerShowBackground = getContext('external')().eventbus.triggerSync('tql:storage:session:store:get',
    sessionConstants.trackerShowBackground, false);

   let contentHeight;
   let scrollActivated = false;

   // A customized ApplicationShell is used to monitor the clientHeight and compare against the scrollHeight to
   // determine if the scrollbar is visible. This allows the QuestTracker to pass mouse events through to elements
   // below the QuestTracker when scroll bars are not present.

   // Throttle the scrollbar activated checks.
   const throttle = foundry.utils.debounce(() =>
   {
      scrollActivated = content.clientHeight < content.scrollHeight;
   }, 400);

   // When contentHeight binding changes execute throttle function.
   $: if (content) { throttle(contentHeight); }

   // Set the `pointer-events` CSS attribute when scrollActivated changes.
   $: if (root) { root.style.pointerEvents = scrollActivated ? 'auto' : 'none'; }

   // ------

   // Depending on the storeTrackerShowBackground boolean state add or remove the `no-background` class.
   $: if (root && storeTrackerShowBackground)
   {
      root.classList[$storeTrackerShowBackground ? 'remove' : 'add']('no-background');
   }
</script>

<div id={foundryApp.id} class="typhonjs-app typhonjs-window-app" data-appid={foundryApp.appId} bind:this={root}>
   <ApplicationHeader title = {foundryApp.title} headerButtons= {foundryApp._getHeaderButtons()} />
   <section class=window-content bind:this={content} bind:clientHeight={contentHeight}>
      <MainContainer />
   </section>
</div>
