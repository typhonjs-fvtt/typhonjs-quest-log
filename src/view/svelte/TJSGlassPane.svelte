<script>
   import { fade }   from 'svelte/transition';

   export let id = void 0;
   export let zIndex = Number.MAX_SAFE_INTEGER;
   export let background = '#50505080';
   export let captureInput = true;
   export let preventDefault = true;
   export let stopPropagation = true;

   let glassPane;

   $: if (glassPane)
   {
      if (captureInput) { glassPane.focus(); }
      glassPane.style.pointerEvents = captureInput ? 'auto' : 'none';
   }

   /**
    * Provide style overrides to make sure there is no conflicting CSS. Particularly around CSS ID selectors.
    *
    * @returns {string}
    */
   function getStyle()
   {
      return `background: ${background}; max-width: 100%; max-height: 100%; width: 100%; height: 100%; z-index: ${
       zIndex}; pointer-events: ${captureInput ? 'auto' : 'none'};`
   }

   function swallow(event)
   {
      if (captureInput)
      {
         if (preventDefault) { event.preventDefault(); }
         if (stopPropagation) { event.stopPropagation(); }
      }
   }
</script>

<svelte:options accessors={true}/>

<div id={id}
     bind:this={glassPane}
     tabindex=0
     class=tjs-glass-pane
     style={getStyle()}
     transition:fade={{duration: 200}}
     on:keydown={swallow}>
   <slot />
</div>

<style>
   .tjs-glass-pane {
      position: absolute;
   }
</style>