<script>
   /**
    * Provides an app header button conforming to the Foundry {@link ApplicationHeaderButton} type. Additionally a
    * `title` field is supported to give a tool tip for the button. The `onclick` function if defined is invoked when
    * the button is clicked and state is updated accordingly.
    */
   import { localize }  from '@typhonjs-fvtt/svelte/helper';

   export let button;

   function onClick()
   {
      if (typeof button.onclick === 'function')
      {
         button.onclick.call(button);
         button = button;
      }
   }
</script>

<svelte:options accessors={true}/>

<a on:click={onClick} class="header-button {button.class}">
    <i class={button.icon} title={localize(button.title)}></i>{localize(button.label)}
</a>
