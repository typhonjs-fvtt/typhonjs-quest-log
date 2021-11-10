<script>
   import { getContext }   from 'svelte';
   import { localize }     from '@typhonjs-fvtt/svelte/helper';

   import TJSHeaderButton  from './TJSHeaderButton.svelte';

   export let headerButtons = [];

   // Stores the local app title option which is updated from `storeAppOptions` changes.
   let title;

   const context = getContext('external');
   const storeAppOptions = context.storeAppOptions;

   $: title = localize(typeof $storeAppOptions.title === 'string' ? $storeAppOptions.title : '');
</script>

<svelte:options accessors={true}/>

<header class="window-header flexrow">
    <h4 class=window-title>{title}</h4>
    {#each headerButtons as button}
        <TJSHeaderButton {button}/>
    {/each}
</header>