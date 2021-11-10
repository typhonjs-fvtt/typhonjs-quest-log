<script>
   import { getContext }         from 'svelte';

   // import { ApplicationShell }   from '@typhonjs-fvtt/svelte/component';
   import ApplicationShell       from '../app/ApplicationShell.svelte';

   import TJSGlassPane           from '../TJSGlassPane.svelte';

   import DialogContent          from './DialogContent.svelte';

   // Application shell contract.
   export let elementRoot;

   // The dialog data.
   export let data = {};

   let modalOptions = {}
   let modal = void 0;

   const foundryApp = getContext('external').foundryApp;

   // Update the main foundry options when data changes.
   $: foundryApp.draggable = data.draggable ?? true;
   $: foundryApp.title = data.title;
   $: foundryApp.zIndex = Number.isInteger(data.zIndex) ? data.zIndex : Number.MAX_SAFE_INTEGER - 1;

   $: if (modal === void 0) { modal = typeof data.modal === 'boolean' ? data.modal : false; }
</script>

<svelte:options accessors={true}/>

{#if modal}
   <TJSGlassPane id={foundryApp.id}
                 {...modalOptions}
                 stopPropagation={false}
                 background="repeat url('modules/typhonjs-quest-log/assets/hex-chain-link.webp'), linear-gradient(to top, #03001e66, #7303c066, #ec38bc44, #fdeff944)">
      <ApplicationShell bind:elementRoot>
         <svelte:component this={DialogContent} {data}/>
      </ApplicationShell>
   </TJSGlassPane>
{:else}
   <ApplicationShell bind:elementRoot>
      <svelte:component this={DialogContent} {data}/>
   </ApplicationShell>
{/if}

