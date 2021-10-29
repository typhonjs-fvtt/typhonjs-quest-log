import { SvelteApplication }  from '@typhonjs-fvtt/svelte';

import DemoPopOut             from './DemoPopOut.svelte';

export default class DemoAppPopOut extends SvelteApplication
{
   /**
    * Default Application options
    *
    * @returns {object} options - Application options.
    * @see https://foundryvtt.com/api/Application.html#options
    */
   static get defaultOptions()
   {
      return foundry.utils.mergeObject(super.defaultOptions, {
         id: 'demo-popout',
         resizable: true,
         minimizable: true,
         popOut: false,
         width: 300,
         height: 480,
         title: 'Demo Popout App',
         svelte: {
            class: DemoPopOut,
            options: {
               injectApp: true
            }
         }
      });
   }

   /**
    * Defines all {@link JQuery} control callbacks with event listeners for click, drag, drop via various CSS selectors.
    *
    * @param {JQuery}  element - The jQuery instance for the element content of this Application.
    *
    * @see SvelteApplication.onSvelteMount
    */
   onSvelteMount(element)
   {
      super.onSvelteMount(element);

      const header = element.find('header')[0];

      // Make the window draggable
      new Draggable(this, element, header, this.options.resizable);
   }

   setPosition(pos)
   {
      this.options.popOut = true;
      super.setPosition(pos);
      this.options.popOut = false;
   }
}