<script>
   import { getContext }               from 'svelte';
   import { fade }                     from 'svelte/transition';

   // import { ApplicationShell }      from '@typhonjs-fvtt/svelte/component';
   import ApplicationShell             from '../app/ApplicationShell.svelte';

   import TJSGlassPane                 from '../TJSGlassPane.svelte';

   import DialogContent                from './DialogContent.svelte';

   import {
      s_DEFAULT_TRANSITION,
      s_DEFAULT_TRANSITION_OPTIONS }   from '../transition/transitionDefaults';

   // Application shell contract.
   export let elementRoot;

   // The dialog data.
   export let data = {};

   const foundryApp = getContext('external').foundryApp;

   const s_MODAL_TRANSITION = fade;
   const s_MODAL_TRANSITION_OPTIONS = { duration: 200 };
   const s_MODAL_BACKGROUND = '#50505080'

   let modal = void 0;

   let modalBackground;
   let modalTransition;
   let modalTransitionOptions;

   // Stores any transition properties to set ApplicationShell with a transition w/ in / out options.
   let transition;
   let inTransition;
   let outTransition;

   // Stores properties to set ApplicationShell with options for any transitions.
   let transitionOptions;
   let inTransitionOptions;
   let outTransitionOptions;

   let zIndex;

   // Retrieve values from the DialogData object and also potentially set any SvelteApplication accessors.

   if (modal === void 0) { modal = typeof data.modal === 'boolean' ? data.modal : false; }

   $: modalBackground = typeof data?.modalOptions?.background === 'string' ? data.modalOptions.background :
    s_MODAL_BACKGROUND;

   $: modalTransition = typeof data?.modalOptions?.transition === 'function' ? data.modalOptions.transition :
    s_MODAL_TRANSITION;

   $: modalTransitionOptions = typeof data?.modalOptions?.transitionOptions === 'object' ?
    data.modalOptions.transitionOptions : s_MODAL_TRANSITION_OPTIONS;

   $:
   {
      transition = typeof data?.transition === 'function' ? data.transition : s_DEFAULT_TRANSITION;
      foundryApp.options.jqueryAnimation = false;
   }

   $:
   {
      inTransition = typeof data?.inTransition === 'function' ? data.inTransition : s_DEFAULT_TRANSITION;
   }

   $: {
      outTransition = typeof data?.outTransition === 'function' ? data.outTransition : s_DEFAULT_TRANSITION;
      foundryApp.options.jqueryAnimation = false;
   }

   $: transitionOptions = typeof data?.transitionOptions === 'object' ? data.transitionOptions :
    s_DEFAULT_TRANSITION_OPTIONS;
   $: inTransitionOptions = typeof data?.inTransitionOptions === 'object' ? data.inTransitionOptions :
    s_DEFAULT_TRANSITION_OPTIONS;
   $: outTransitionOptions = typeof data?.outTransitionOptions === 'object' ? data.outTransitionOptions :
    s_DEFAULT_TRANSITION_OPTIONS;

   $: zIndex = Number.isInteger(data.zIndex) || data.zIndex === null ? data.zIndex :
    modal ? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER - 1;

   // Update the main foundry options when data changes.
   $: foundryApp.draggable = data.draggable ?? true;
   $: foundryApp.popOut = data.popOut ?? true;
   $: foundryApp.resizable = data.resizable ?? false;
   $: foundryApp.title = data.title ?? 'Dialog';
   $: foundryApp.zIndex = zIndex;
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

