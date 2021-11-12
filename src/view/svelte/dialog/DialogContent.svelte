<script>
   import { getContext }         from 'svelte';

   import { isSvelteComponent }  from '@typhonjs-fvtt/svelte/util';
   import { parseSvelteConfig }  from '@typhonjs-fvtt/svelte/util';

   export let data = {};

   let buttons;
   let content;
   let dialogComponent;
   let dialogProps = {};

   let foundryApp = getContext('external').foundryApp;

   $: buttons = Object.keys(data.buttons).reduce((obj, key) =>
   {
      const b = data.buttons[key];
      if (b.condition !== false)
      {
         obj.push({
            ...b,
            id: key,
            cssClass: [key, data.default === key ? 'default' : ''].filterJoin(' ')
         })
      }
      return obj;
   }, []);

   $:
   {
      content = data.content;

      try
      {
         if (isSvelteComponent(content))
         {
            dialogComponent = content;
            dialogProps = {};
         }
         else if (typeof content === 'object')
         {
            const svelteConfig = parseSvelteConfig(content, foundryApp);
            dialogComponent = svelteConfig.class;
            dialogProps = svelteConfig.props ?? {};

            // Check for any children parsed and added to the external context.
            const children = svelteConfig?.context?.get('external')?.children;

            // If so add to dialogProps.
            if (Array.isArray(children)) { dialogProps.children = children; }
         }
         else
         {
            dialogComponent = void 0;
            dialogProps = {};
         }
      }
      catch (err)
      {
         dialogComponent = void 0;
         dialogProps = {};

         content = err.message;
         console.error(err);
      }
   }

   function onClick(button)
   {
      try
      {
         // Passing back the element is to keep with the existing Foundry API.
         if (typeof button.callback === 'function')
         {
            button.callback(foundryApp.options.jQuery ? foundryApp.element : foundryApp.element[0]);
         }

         foundryApp.close();
      }
      catch(err)
      {
         ui.notifications.error(err);
         throw new Error(err);
      }
   }

   function onKeydown(event)
   {
      switch (event.key)
      {
         case 'Escape':
            return foundryApp.close();

         case 'Enter':
            onClick(data.buttons[data.default]);
            break;
      }
   }
</script>

<svelte:body on:keydown|preventDefault|stopPropagation={onKeydown} />

<div class="dialog-content">
   {#if typeof content === 'string'}
      {@html content}
   {:else if dialogComponent}
      <svelte:component this={dialogComponent} {...dialogProps} />
   {/if}
</div>
<div class="dialog-buttons">
   {#each buttons as button (button.id)}
   <button class="dialog-button {button.cssClass}" on:click={() => onClick(button)}>
      {@html button.icon}
      {@html button.label}
   </button>
   {/each}
</div>

<style>
   div.dialog-buttons {
      padding-top: 8px;
   }
</style>