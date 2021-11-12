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

   // Exports properties to set a transition w/ in / out options.
   export let transition = s_DEFAULT_TRANSITION;
   export let inTransition = s_DEFAULT_TRANSITION;
   export let outTransition = s_DEFAULT_TRANSITION;

   // Exports properties to set options for any transitions.
   export let transitionOptions = s_DEFAULT_TRANSITION_OPTIONS;
   export let inTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS;
   export let outTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS;

   // If transition is defined then set it to both in and out transition.
   $: if (transition !== s_DEFAULT_TRANSITION && typeof transition === 'function')
   {
      inTransition = transition;
      outTransition = transition;
   }

   // If transitionOption is defined then set it to both in and out transition options.
   $: if (transitionOptions !== s_DEFAULT_TRANSITION_OPTIONS && typeof transitionOptions === 'object')
   {
      inTransitionOptions = transitionOptions;
      outTransitionOptions = transitionOptions;
   }

   // Set jquery close animation to not run when an out transition is assigned.
   $: if (outTransition && foundryApp)
   {
      if (typeof foundryApp?.options?.jqueryAnimation === 'boolean') { foundryApp.options.jqueryAnimation = false; }
   }

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