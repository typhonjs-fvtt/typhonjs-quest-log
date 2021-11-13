<script>
   import { getContext }               from 'svelte';
   import { fade }                     from 'svelte/transition';

   // import { ApplicationShell }      from '@typhonjs-fvtt/svelte/component';
   import ApplicationShell             from '../app/ApplicationShell.svelte';

   import TJSGlassPane                 from '../TJSGlassPane.svelte';

   import DialogContent                from './DialogContent.svelte';

   // Application shell contract.
   export let elementRoot;

   // The dialog data.
   export let data = {};

   const foundryApp = getContext('external').foundryApp;

   const s_MODAL_TRANSITION = fade;
   const s_MODAL_TRANSITION_OPTIONS = { duration: 200 };
   const s_MODAL_BACKGROUND = '#50505080'

   let modal = void 0;

   let modalBackground = void 0;
   let modalTransition = void 0;
   let modalTransitionOptions = void 0;

   // Stores any transition properties to set ApplicationShell with a transition w/ in / out options.
   let transition = void 0;
   let inTransition = void 0;
   let outTransition = void 0;

   // Stores properties to set ApplicationShell with options for any transitions.
   let transitionOptions = void 0;
   let inTransitionOptions = void 0;
   let outTransitionOptions = void 0;

   let zIndex = void 0;

   // Only set modal once on mount. You can't change between a modal an non-modal dialog during runtime.
   if (modal === void 0) { modal = typeof data.modal === 'boolean' ? data.modal : false; }

   // Retrieve values from the DialogData object and also potentially set any SvelteApplication accessors.
   // Explicit checks are performed against existing local variables as the only externally reactive variable is `data`.
   // All of the checks below trigger when there are any external changes to the `data` prop.
   // Prevent any unnecessary changing of local & `foundryApp` variables unless actual changes occur.
   $:
   {
      const newModalBackground = typeof data?.modalOptions?.background === 'string' ? data.modalOptions.background :
       s_MODAL_BACKGROUND;

      if (newModalBackground !== modalBackground) { modalBackground = newModalBackground; }
   }

   $: {
      const newModalTransition = typeof data?.modalOptions?.transition === 'function' ? data.modalOptions.transition :
       s_MODAL_TRANSITION;

      if (newModalTransition !== modalTransition) { modalTransition = newModalTransition; }
   }

   $: {
      const newModalTransitionOptions = typeof data?.modalOptions?.transitionOptions === 'object' ?
       data.modalOptions.transitionOptions : s_MODAL_TRANSITION_OPTIONS;

      if (newModalTransitionOptions !== modalTransitionOptions) { modalTransitionOptions = newModalTransitionOptions; }
   }

   $: if (data?.transition !== transition) { transition = data.transition; }
   $: if (data?.inTransition !== inTransition) { inTransition = data.inTransition; }
   $: if (data?.outTransition !== outTransition) { outTransition = data.outTransition; }

   $: if (data?.transitionOptions !== transitionOptions) { transitionOptions = data.transitionOptions; }
   $: if (data?.inTransitionOptions !== inTransitionOptions) { inTransitionOptions = data.inTransitionOptions; }
   $: if (data?.outTransitionOptions !== outTransitionOptions) { outTransitionOptions = data.outTransitionOptions; }

   $:
   {
      const newZIndex = Number.isInteger(data.zIndex) || data.zIndex === null ? data.zIndex :
       modal ? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER - 1

      if (zIndex !== newZIndex) { zIndex = newZIndex; }
   }

   // Update the main foundry options when data changes. Perform explicit checks against existing data in `foundryApp`.
   $:
   {
      const newDraggable = data.draggable ?? true;
      if (foundryApp.draggable !== newDraggable) { foundryApp.draggable = newDraggable; }
   }

   $:
   {
      const newPopOut = data.popOut ?? true;
      if (foundryApp.popOut !== newPopOut) { foundryApp.popOut = newPopOut; }
   }

   $:
   {
      const newResizable = data.resizable ?? false;
      if (foundryApp.resizable !== newResizable) { foundryApp.resizable = newResizable; }
   }

   $:
   {
      const newTitle = data.title ?? 'Dialog';

      // Note foundryApp.title from Application localizes `options.title`, so compare with `foundryApp.options.title`.
      if (newTitle !== foundryApp?.options?.title) { foundryApp.title = newTitle; }
   }

   $: if (foundryApp.zIndex !== zIndex) { foundryApp.zIndex = zIndex; }
</script>

<svelte:options accessors={true}/>

{#if modal}
   <TJSGlassPane id={foundryApp.id}
                 stopPropagation={false}
                 background={modalBackground}
                 transition={modalTransition}
                 transitionOptions={modalTransitionOptions}
                 {zIndex}>
      <ApplicationShell bind:elementRoot
                        {transition}
                        {inTransition}
                        {outTransition}
                        {transitionOptions}
                        {inTransitionOptions}
                        {outTransitionOptions}>
         <DialogContent {data} />
      </ApplicationShell>
   </TJSGlassPane>
{:else}
   <ApplicationShell bind:elementRoot
                     {transition}
                     {inTransition}
                     {outTransition}
                     {transitionOptions}
                     {inTransitionOptions}
                     {outTransitionOptions}>
      <DialogContent {data} />
   </ApplicationShell>
{/if}

