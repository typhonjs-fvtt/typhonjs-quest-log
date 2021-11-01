<script>
   import { getContext, setContext }         from "svelte";

   import { ApplicationHeader, Container }   from '@typhonjs-fvtt/svelte';

   export let context;

   let content, root;

   setContext('external', () => context);
   setContext('getElementContent', () => content);
   setContext('getElementRoot', () => root);

   let children = getContext('external')().children;
   let foundryApp = getContext('external')().foundryApp;

   let contentHeight;
   let scrollActivated = false;

   // A customized ApplicationShell is used to monitor the clientHeight and compare against the scrollHeight to
   // determine if the scrollbar is visible. This allows the QuestTracker to pass mouse events through to elements
   // below the QuestTracker when scroll bars are not present.

   // Throttle the scrollbar activated checks.
   const throttle = foundry.utils.debounce(() => {
      scrollActivated = content.clientHeight < content.scrollHeight;
   }, 400);

   // When contentHeight binding changes execute throttle function.
   $: if (content) { throttle(contentHeight); }

   // Set the `pointer-events` CSS attribute when scrollActivated changes.
   $: if (root) {
      root.style.pointerEvents = scrollActivated ? 'auto' : 'none';
   }
</script>

<div id={foundryApp.id} class="typhonjs-app typhonjs-window-app" data-appid={foundryApp.appId} bind:this={root}>
   <ApplicationHeader title = {foundryApp.title} headerButtons= {foundryApp._getHeaderButtons()} />
   <section class=window-content bind:this={content} bind:clientHeight={contentHeight}>
      <Container {children} />
   </section>
</div>