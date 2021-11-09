<script>
   import { getContext, setContext } from 'svelte';

   import TJSApplicationHeader  from './TJSApplicationHeader.svelte';
   // import TJSContainer          from '../TJSContainer.svelte';
   import { TJSContainer }      from '@typhonjs-fvtt/svelte/component';

   // Bound to the content and root elements. Can be used by parent components. SvelteApplication will also
   // use 'elementRoot' to set the element of the Application. You can also provide `elementContent` and
   // `elementTarget`. Please see SvelteApplication lifecycle documentation.
   export let elementContent;
   export let elementRoot;

   // Exposed externally to change title on app header and z-index dynamically. If a parent component does not
   // provide options then the associated Foundry App provides the options. SvelteApplication via the `setOptions`
   // method will update `appOptions` on changes.
   export let appOptions = void 0;

   // If a parent component binds and sets `heightChanged` to true then it is bound to the content & root element
   // `clientHeight`.
   export let heightChanged = false;

   // Stores the app title as it can be provided externally or retrieved from any external Foundry Application.
   let appTitle;
   let zIndex;

   // Store the initial `heightChanged` state. If it is truthy then `clientHeight` for the content & root elements
   // are bound to `heightChanged` to signal to any parent component of any change to the client & root.
   const bindHeightChanged = !!heightChanged;

   setContext('getElementContent', () => elementContent);
   setContext('getElementRoot', () => elementRoot);

   const context = getContext('external');

   // Store Foundry Application reference.
   const foundryApp = context.foundryApp;

   if (appOptions === void 0)
   {
      appOptions = foundryApp.options;
   }

   $: if (typeof appOptions === 'object')
   {
      appTitle = typeof appOptions.title === 'string' ? appOptions.title :
       foundryApp !== void 0 ? foundryApp.title : '';

      zIndex = Number.isInteger(appOptions.zIndex) ? `z-index: ${appOptions.zIndex}` : void 0;
   }

   // This component can host multiple children defined in the TyphonJS Svelte configuration object which are
   // potentially mounted in the content area. If no children defined then this component mounts any slotted child.
   const children = typeof context === 'object' ? context.children : void 0;
</script>

<svelte:options accessors={true}/>

{#if bindHeightChanged}
   <div id={foundryApp.id}
        class="app window-app {foundryApp.options.classes.join(' ')}"
        data-appid={foundryApp.appId}
        style="{typeof zIndex === 'string' ? zIndex : ''}"
        bind:clientHeight={heightChanged}
        bind:this={elementRoot}>
      <TJSApplicationHeader title = {appTitle} headerButtons= {foundryApp._getHeaderButtons()} />
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
        class="app window-app {foundryApp.options.classes.join(' ')}"
        data-appid={foundryApp.appId}
        style="{Number.isInteger(zIndex) ? `z-index: ${zIndex}` : ''}"
        bind:this={elementRoot}>
      <TJSApplicationHeader title = {appTitle} headerButtons= {foundryApp._getHeaderButtons()} />
      <section class=window-content bind:this={elementContent}>
         {#if Array.isArray(children)}
            <TJSContainer {children} />
         {:else}
            <slot />
         {/if}
      </section>
   </div>
{/if}

