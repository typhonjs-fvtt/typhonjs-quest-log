<script>
   import { getContext }   from 'svelte';

   import { localize }     from '@typhonjs-fvtt/svelte/helper';

   import TJSHeaderButton  from './TJSHeaderButton.svelte';

   import { draggable }    from '../actions/draggable';

   const context = getContext('external');
   const foundryApp = context.foundryApp;

   const bringToTop = typeof foundryApp.options.popOut === 'boolean' && foundryApp.options.popOut ?
    () => foundryApp.bringToTop.call(foundryApp) : () => void 0;

   const storeTitle = context.storeAppOptions.title;
   const storeDraggable = context.storeAppOptions.draggable;
   const storeHeaderButtons = context.storeUIOptions.headerButtons;
   const storeMinimizable = context.storeAppOptions.minimizable;

   function minimizable(node, booleanStore)
   {
      const callback = foundryApp._onToggleMinimize.bind(foundryApp);

      function activateListeners() { node.addEventListener('dblclick', callback); }
      function removeListeners() { node.removeEventListener('dblclick', callback); }

      if (booleanStore) { activateListeners(); }

      return {
         update: ({ booleanStore }) =>  // eslint-disable-line no-shadow
         {
            if (booleanStore) { activateListeners(); }
            else { removeListeners(); }
         },

         destroy: () => removeListeners()
      };
   }
</script>

<header class="window-header flexrow"
        on:pointerdown={bringToTop}
        use:draggable={{ positionable: foundryApp, booleanStore: $storeDraggable }}
        use:minimizable={$storeMinimizable}>
    <h4 class=window-title>{localize($storeTitle)}</h4>
    {#each $storeHeaderButtons as button}
        <TJSHeaderButton {button}/>
    {/each}
</header>