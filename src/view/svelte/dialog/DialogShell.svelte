<script>
   import { getContext }         from 'svelte';

   import { ApplicationShell }   from '@typhonjs-fvtt/svelte/component';
   import TJSGlassPane           from '../TJSGlassPane.svelte';

   import DialogContent          from './DialogContent.svelte';

   export let data = {};

   let modalOptions = {}
   let modal = void 0;
   let title;
   let zIndex;

   const foundryApp = getContext('external').foundryApp;

   $:
   {
      if (modal === void 0) { modal = typeof data.modal === 'boolean' ? data.modal : false; }

      title = data.title || foundryApp.title;

      zIndex = Number.isInteger(data.zIndex) ? data.zIndex : Number.MAX_SAFE_INTEGER - 1;
   }
</script>

<svelte:options accessors={true}/>

{#if modal}
   <TJSGlassPane id={foundryApp.id}
                 {...modalOptions}
                 stopPropagation={false}
                 background="repeat url('modules/typhonjs-quest-log/assets/hex-chain-link.webp'), linear-gradient(to top, #03001e66, #7303c066, #ec38bc44, #fdeff944)">
      <ApplicationShell {title}>
         <svelte:component this={DialogContent} {data}/>
      </ApplicationShell>
   </TJSGlassPane>
{:else}
   <ApplicationShell {title} {zIndex}>
      <svelte:component this={DialogContent} {data}/>
   </ApplicationShell>
{/if}

