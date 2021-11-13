<script>
   import { getContext }               from 'svelte';
   import { fade }                     from 'svelte/transition';

   // import { ApplicationShell }      from '@typhonjs-fvtt/svelte/component';
   import ApplicationShell             from '../application/ApplicationShell.svelte';

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

   // Stores props for the ApplicationShell.
   const appProps = {
      // Stores any transition functions.
      transition: void 0,
      inTransition: void 0,
      outTransition: void 0,

      // Stores properties to set for options for any transitions.
      transitionOptions: void 0,
      inTransitionOptions: void 0,
      outTransitionOptions: void 0,
   }

   const modalProps = {
      // Background CSS style string.
      background: void 0,

      // Stores any transition functions.
      transition: void 0,
      inTransition: void 0,
      outTransition: void 0,

      // Stores properties to set for options for any transitions.
      transitionOptions: void 0,
      inTransitionOptions: void 0,
      outTransitionOptions: void 0,
   }

   let zIndex = void 0;

   // Only set modal once on mount. You can't change between a modal an non-modal dialog during runtime.
   if (modal === void 0) { modal = typeof data?.modal === 'boolean' ? data.modal : false; }

   // Retrieve values from the DialogData object and also potentially set any SvelteApplication accessors.
   // Explicit checks are performed against existing local variables as the only externally reactive variable is `data`.
   // All of the checks below trigger when there are any external changes to the `data` prop.
   // Prevent any unnecessary changing of local & `foundryApp` variables unless actual changes occur.

   // Foundry App options --------------------------------------------------------------------------------------------

   $: if (typeof data === 'object')
   {
      const newZIndex = Number.isInteger(data.zIndex) || data.zIndex === null ? data.zIndex :
       modal ? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER - 1
      if (zIndex !== newZIndex) { zIndex = newZIndex; }

      // Update the main foundry options when data changes. Perform explicit checks against existing data in `foundryApp`.
      const newDraggable = data.draggable ?? true;
      if (foundryApp.draggable !== newDraggable) { foundryApp.draggable = newDraggable; }

      const newPopOut = data.popOut ?? true;
      if (foundryApp.popOut !== newPopOut) { foundryApp.popOut = newPopOut; }

      const newResizable = data.resizable ?? false;
      if (foundryApp.resizable !== newResizable) { foundryApp.resizable = newResizable; }

      // Note foundryApp.title from Application localizes `options.title`, so compare with `foundryApp.options.title`.
      const newTitle = data.title ?? 'Dialog';
      if (newTitle !== foundryApp?.options?.title) { foundryApp.title = newTitle; }

      if (foundryApp.zIndex !== zIndex) { foundryApp.zIndex = zIndex; }
   }

   // ApplicationShell transition options ----------------------------------------------------------------------------

   $: if (typeof data?.transition === 'object')
   {
      // Store data.transitions to shorten statements below.
      const d = data.transition;

      if (d?.transition !== appProps.transition) { appProps.transition = d.transition; }
      if (d?.inTransition !== appProps.inTransition) { appProps.inTransition = d.inTransition; }
      if (d?.outTransition !== appProps.outTransition) { appProps.outTransition = d.outTransition; }
      if (d?.transitionOptions !== appProps.transitionOptions) { appProps.transitionOptions = d.transitionOptions; }

      if (d?.inTransitionOptions !== appProps.inTransitionOptions)
      {
         appProps.inTransitionOptions = d.inTransitionOptions;
      }

      if (d?.outTransitionOptions !== appProps.outTransitionOptions)
      {
         appProps.outTransitionOptions = d.outTransitionOptions;
      }
   }

   // Modal options --------------------------------------------------------------------------------------------------

   $:
   {
      const newModalBackground = typeof data?.modalOptions?.background === 'string' ? data.modalOptions.background :
       s_MODAL_BACKGROUND;

      if (newModalBackground !== modalProps.background) { modalProps.background = newModalBackground; }
   }

   $: if (typeof data?.modalOptions?.transition === 'object')
   {
      // Store data.transitions to shorten statements below.
      const d = data.modalOptions.transition;

      if (d?.transition !== modalProps.transition)
      {
         modalProps.transition = typeof d?.transition === 'function' ? d.transition : s_MODAL_TRANSITION;
      }

      if (d?.inTransition !== modalProps.inTransition) { modalProps.inTransition = d.inTransition; }
      if (d?.outTransition !== modalProps.outTransition) { modalProps.outTransition = d.outTransition; }

      // Provide default transition options if not defined.
      if (d?.transitionOptions !== modalProps.transitionOptions)
      {
         modalProps.transitionOptions = typeof d?.transitionOptions === 'object' ? d.transitionOptions :
          s_MODAL_TRANSITION_OPTIONS;
      }

      if (d?.inTransitionOptions !== modalProps.inTransitionOptions)
      {
         modalProps.inTransitionOptions = d.inTransitionOptions;
      }

      if (d?.outTransitionOptions !== modalProps.outTransitionOptions)
      {
         modalProps.outTransitionOptions = d.outTransitionOptions;
      }
   }
   else  // Provide a fallback / default glass pane transition when `data.modalOptions.transition` is not defined.
   {
      const newModalTransition = typeof data?.modalOptions?.transition?.transition === 'function' ?
       data.modalOptions.transition.transition : s_MODAL_TRANSITION;

      if (newModalTransition !== modalProps.transition) { modalProps.transition = newModalTransition; }

      const newModalTransitionOptions = typeof data?.modalOptions?.transitionOptions === 'object' ?
       data.modalOptions.transitionOptions : s_MODAL_TRANSITION_OPTIONS;

      if (newModalTransitionOptions !== modalProps.transitionOptions)
      {
         modalProps.transitionOptions = newModalTransitionOptions;
      }
   }
</script>

<svelte:options accessors={true}/>

{#if modal}
   <TJSGlassPane id={foundryApp.id} stopPropagation={false} {...modalProps} {zIndex}>
      <ApplicationShell bind:elementRoot {...appProps}>
         <DialogContent {data} />
      </ApplicationShell>
   </TJSGlassPane>
{:else}
   <ApplicationShell bind:elementRoot {...appProps}>
      <DialogContent {data} />
   </ApplicationShell>
{/if}