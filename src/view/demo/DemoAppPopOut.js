import { ApplicationShell, SvelteApplication }  from '@typhonjs-fvtt/svelte';

import DemoPopOut from './DemoPopOut.svelte';

/**
 * Simulates a popout Application, but is a non-popout with full control of z-index and not connected to the automatic
 * closing of apps from `Esc` key. The entire HTML content is rendered by ApplicationShell and another Svelte component
 * can be mounted for the content area.
 */
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
         title: 'Demo Non-Popout (popout!) app',

         svelte: {         // Add a single Svelte component to Application Shell.
            class: ApplicationShell,
            children: {
               class: DemoPopOut
            },
            options: { injectApp: true }
         }

         // svelte: {      // Add multiple Svelte components to ApplicationShell.
         //    class: ApplicationShell,
         //    children: [
         //       { class: DemoPopOut },
         //       { class: DemoPopOut }
         //    ],
         //    options: { injectApp: true }
         // }

         // svelte: {         // A warning is posted w/ no children.
         //    class: ApplicationShell,
         //    options: { injectApp: true }
         // }
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

   /**
    * Example of the necessity to override setPosition for non-popout apps as there is an artificial gate at the
    * beginning of `Application.setPosition`.
    *
    * @param {object} pos -
    */
   setPosition(pos)
   {
      this.options.popOut = true;
      super.setPosition(pos);
      this.options.popOut = false;
   }
}