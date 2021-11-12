<script>
   import { getContext }    from 'svelte';

   // import TJSContainer      from './TJSContainer.svelte';
   import { TJSContainer }  from '@typhonjs-fvtt/svelte/component';

   // The children array can be specified by a parent via prop or is read below from the external context.
   export let children = void 0

   const context = getContext('external');

   // This component can host multiple children defined via props or in the TyphonJS SvelteData configuration object
   // that are potentially mounted in the content area. If no children defined then this component mounts any slotted
   // child.
   const allChildren = Array.isArray(children) ? children :
    typeof context === 'object' ? context.children : void 0;
</script>

<svelte:options accessors={true}/>

<TJSContainer children={allChildren} warn={true} />