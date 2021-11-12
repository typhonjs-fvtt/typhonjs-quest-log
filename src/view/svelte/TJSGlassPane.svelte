<script>
   import {
      s_DEFAULT_TRANSITION,
      s_DEFAULT_TRANSITION_OPTIONS }   from './transition/transitionDefaults';

   export let id = void 0;
   export let zIndex = Number.MAX_SAFE_INTEGER;
   export let background = '#50505080';
   export let captureInput = true;
   export let preventDefault = true;
   export let stopPropagation = true;

   let glassPane;

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

   $: if (glassPane)
   {
      glassPane.style.maxWidth = '100%';
      glassPane.style.maxHeight = '100%';
      glassPane.style.width = '100%';
      glassPane.style.height = '100%';
   }

   $: if (glassPane)
   {
      if (captureInput) { glassPane.focus(); }
      glassPane.style.pointerEvents = captureInput ? 'auto' : 'none';
   }

   $: if (glassPane) { glassPane.style.background = background; }
   $: if (glassPane) { glassPane.style.zIndex = zIndex; }

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
     in:inTransition={inTransitionOptions}
     out:outTransition={outTransitionOptions}
     on:keydown={swallow}>
   <slot />
</div>

<style>
   .tjs-glass-pane {
      position: absolute;
      overflow: inherit;
   }
</style>