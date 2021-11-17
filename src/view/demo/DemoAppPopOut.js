import { SvelteApplication }     from '@typhonjs-fvtt/svelte/application';
import { TJSApplicationShell }   from '@typhonjs-fvtt/svelte/component/core';

import DemoPopOut                from './DemoPopOut.svelte';

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
            class: TJSApplicationShell,
            target: document.body,
            children: {
               class: DemoPopOut
            }
         }

         // svelte: {      // Add multiple Svelte components to ApplicationShell.
         //    class: TJSApplicationShell,
         //    target: document.body,
         //    children: [
         //       { class: DemoPopOut },
         //       { class: DemoPopOut }
         //    ]
         // }

         // svelte: {         // A warning is posted w/ no children.
         //    class: TJSApplicationShell,
         //    target: document.body
         // }
      });
   }
}