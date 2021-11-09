<script>
   import { localize }     from '@typhonjs-fvtt/svelte/helper';

   import TJSHeaderButton  from './TJSHeaderButton.svelte';

   export let title = '';
   export let headerButtons = [];
</script>

<svelte:options accessors={true}/>

<header class="window-header flexrow">
    <h4 class=window-title>{localize(title)}</h4>
    {#each headerButtons as button}
        <TJSHeaderButton {button}/>
    {/each}
</header>