<script>
   import { getContext, setContext } from 'svelte';

   import TJSApplicationHeader  from './TJSApplicationHeader.svelte';
   // import TJSContainer          from '../TJSContainer.svelte';
   import { TJSContainer }      from '@typhonjs-fvtt/svelte/component';
   import ResizableHandle       from './ResizableHandle.svelte';

   import {
      s_DEFAULT_TRANSITION,
      s_DEFAULT_TRANSITION_OPTIONS }   from '../transition/transitionDefaults';

   // Bound to the content and root elements. Can be used by parent components. SvelteApplication will also
   // use 'elementRoot' to set the element of the Application. You can also provide `elementContent` and
   // `elementTarget`. Please see SvelteApplication lifecycle documentation.
   export let elementContent;
   export let elementRoot;

   // The children array can be specified by a parent via prop or is read below from the external context.
   export let children = void 0

   // If a parent component binds and sets `heightChanged` to true then it is bound to the content & root element
   // `clientHeight`.
   export let heightChanged = false;

   // Store the initial `heightChanged` state. If it is truthy then `clientHeight` for the content & root elements
   // are bound to `heightChanged` to signal to any parent component of any change to the client & root.
   const bindHeightChanged = !!heightChanged;

   setContext('getElementContent', () => elementContent);
   setContext('getElementRoot', () => elementRoot);

   const context = getContext('external');

   // Store Foundry Application reference.
   const foundryApp = context.foundryApp;

   // This component can host multiple children defined via props or in the TyphonJS SvelteData configuration object
   // that are potentially mounted in the content area. If no children defined then this component mounts any slotted
   // child.
   const allChildren = Array.isArray(children) ? children :
    typeof context === 'object' ? context.children : void 0;

   // ---------------------------------------------------------------------------------------------------------------

   // The following block is somewhat complex, but allows transition options to be updated reactively during
   // runtime execution.

   // Exports properties to set a transition w/ in / out options.
   export let transition = void 0;
   export let inTransition = s_DEFAULT_TRANSITION;
   export let outTransition = s_DEFAULT_TRANSITION;

   // Exports properties to set options for any transitions.
   export let transitionOptions = void 0;
   export let inTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS;
   export let outTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS;

   // Tracks last transition state.
   let oldTransition = void 0;
   let oldTransitionOptions = void 0

   // Run this reactive block when the last transition state is not equal to the current state.
   $: if (oldTransition !== transition)
   {
      // If transition is defined and not the default transition then set it to both in and out transition otherwise
      // set the default transition to both in & out transitions.
      const newTransition = s_DEFAULT_TRANSITION !== transition && typeof transition === 'function' ? transition :
       s_DEFAULT_TRANSITION;

      inTransition = newTransition;
      outTransition = newTransition;

      oldTransition = newTransition;
   }

   // Run this reactive block when the last transition options state is not equal to the current options state.
   $: if (oldTransitionOptions !== transitionOptions)
   {
      const newOptions = transitionOptions !== s_DEFAULT_TRANSITION_OPTIONS && typeof transitionOptions === 'object' ?
       transitionOptions : s_DEFAULT_TRANSITION_OPTIONS;

      inTransitionOptions = newOptions;
      outTransitionOptions = newOptions;

      oldTransitionOptions = newOptions;
   }

   // Handle cases if inTransition is unset; assign noop default transition function.
   $: if (typeof inTransition !== 'function') { inTransition = s_DEFAULT_TRANSITION; }

   $:
   {
      // Handle cases if outTransition is unset; assign noop default transition function.
      if (typeof outTransition !== 'function') { outTransition = s_DEFAULT_TRANSITION; }

      // Set jquery close animation to either run or not when an out transition is changed.
      if (foundryApp && typeof foundryApp?.options?.jqueryCloseAnimation === 'boolean')
      {
         foundryApp.options.jqueryCloseAnimation = outTransition === s_DEFAULT_TRANSITION;
      }
   }

   // Handle cases if inTransitionOptions is unset; assign empty default transition options.
   $: if (typeof inTransitionOptions !== 'object') { inTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS; }

   // Handle cases if outTransitionOptions is unset; assign empty default transition options.
   $: if (typeof outTransitionOptions !== 'object') { outTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS; }
</script>

<svelte:options accessors={true}/>

{#if bindHeightChanged}
   <div id={foundryApp.id}
        class="app window-app {foundryApp.options.classes.join(' ')}"
        data-appid={foundryApp.appId}
        bind:clientHeight={heightChanged}
        bind:this={elementRoot}
        in:inTransition={inTransitionOptions}
        out:outTransition={outTransitionOptions}>
      <TJSApplicationHeader />
      <section class=window-content bind:this={elementContent} bind:clientHeight={heightChanged}>
         {#if Array.isArray(allChildren)}
            <TJSContainer children={allChildren} />
         {:else}
            <slot />
         {/if}
      </section>
      <ResizableHandle />
   </div>
{:else}
   <div id={foundryApp.id}
        class="app window-app {foundryApp.options.classes.join(' ')}"
        data-appid={foundryApp.appId}
        bind:this={elementRoot}
        in:inTransition={inTransitionOptions}
        out:outTransition={outTransitionOptions}>
      <TJSApplicationHeader />
      <section class=window-content bind:this={elementContent}>
         {#if Array.isArray(allChildren)}
            <TJSContainer children={allChildren} />
         {:else}
            <slot />
         {/if}
      </section>
      <ResizableHandle />
   </div>
{/if}

<style>
   .window-app {
      overflow: inherit;
   }
</style>