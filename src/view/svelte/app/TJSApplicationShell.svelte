<script>
   import { getContext, setContext }   from 'svelte';

   import TJSApplicationHeader         from './TJSApplicationHeader.svelte';
   import { TJSContainer }             from '@typhonjs-fvtt/svelte/component';
   // import TJSContainer                 from '../TJSContainer.svelte';

   // Bound to the content and root elements. Can be used by parent components. SvelteApplication will also
   // use 'elementRoot' to set the element of the Application. You can also provide `elementContent` and
   // `elementTarget`. Please see SvelteApplication lifecycle documentation.
   export let elementContent;
   export let elementRoot;

   // If a parent component binds and sets `heightChanged` to true then it is bound to the content & root element
   // `clientHeight`.
   export let heightChanged = false;

   const s_DEFAULT_TRANSITION = () => void 0;
   const s_DEFAULT_TRANSITION_OPTIONS = {};

   // Exports properties to set a transition w/ in / out options.
   export let transition = s_DEFAULT_TRANSITION;
   export let inTransition = s_DEFAULT_TRANSITION;
   export let outTransition = s_DEFAULT_TRANSITION;

   // Exports properties to set options for any transitions.
   export let transitionOptions = s_DEFAULT_TRANSITION_OPTIONS;
   export let inTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS;
   export let outTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS;

   // If transition is defined then set it to both in and out transition.
   if (transition !== s_DEFAULT_TRANSITION && typeof transition === 'function')
   {
      inTransition = transition;
      outTransition = transition;
   }
   // If transitionOption is defined then set it to both in and out transition options.
   if (transitionOptions !== s_DEFAULT_TRANSITION_OPTIONS && typeof transitionOptions === 'object')
   {
      inTransitionOptions = transitionOptions;
      outTransitionOptions = transitionOptions;
   }

   // Store the initial `heightChanged` state. If it is truthy then `clientHeight` for the content & root elements
   // are bound to `heightChanged` to signal to any parent component of any change to the client & root.
   const bindHeightChanged = !!heightChanged;

   setContext('getElementContent', () => elementContent);
   setContext('getElementRoot', () => elementRoot);

   const context = getContext('external');

   // The main Application options store.
   const storeAppOptions = context.storeAppOptions;

   // Store Foundry Application reference.
   const foundryApp = context.foundryApp;

   // Handles directly updating the element root `z-index` style when `zIndex` changes.
   $: if (elementRoot)
   {
      elementRoot.style.zIndex = Number.isInteger($storeAppOptions.zIndex) ? $storeAppOptions.zIndex : null;
   }

   // This component can host multiple children defined in the TyphonJS SvelteData configuration object which are
   // potentially mounted in the content area. If no children defined then this component mounts any slotted child.
   const children = typeof context === 'object' ? context.children : void 0;
</script>

<svelte:options accessors={true}/>

{#if bindHeightChanged}
   <div id={foundryApp.id}
        class="typhonjs-app typhonjs-window-app {foundryApp.options.classes.join(' ')}"
        data-appid={foundryApp.appId}
        bind:clientHeight={heightChanged}
        bind:this={elementRoot}
        in:inTransition={inTransitionOptions}
        out:outTransition={outTransitionOptions}>
       <TJSApplicationHeader />
       <section class=window-content bind:this={elementContent} bind:clientHeight={heightChanged}>
           {#if Array.isArray(children)}
               <TJSContainer {children} />
           {:else}
               <slot />
           {/if}
       </section>
   </div>
{:else}
   <div id={foundryApp.id}
        class="typhonjs-app typhonjs-window-app {foundryApp.options.classes.join(' ')}"
        data-appid={foundryApp.appId}
        bind:this={elementRoot}
        in:inTransition={inTransitionOptions}
        out:outTransition={outTransitionOptions}>
       <TJSApplicationHeader />
       <section class=window-content bind:this={elementContent}>
           {#if Array.isArray(children)}
               <TJSContainer {children} />
           {:else}
               <slot />
           {/if}
       </section>
   </div>
{/if}


<style>
  /**
   * Defines styles that mimic a Foundry popout Application. `:global` is used to preserve the unused CSS in the
   * template above. A primary benefit of a separate Application implementation is that the styles are not overridden
   * by any given game system / mods that might effect the standard Foundry Application CSS. This allows separate
   * and unique styles to be given to this component regardless of game system / module modifications.
   */
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