<script>
   import TJSHeaderButton   from './TJSHeaderButton.svelte';

   export let title = '';
   export let headerButtons = [];
</script>

<svelte:options accessors={true}/>

<header class="window-header flexrow">
    <h4 class=window-title>{title}</h4>
    {#each headerButtons as button}
        <TJSHeaderButton {button}/>
    {/each}
</header>