import { SvelteApplication }  from '@typhonjs-fvtt/svelte';

import Demo                   from './Demo.svelte';

/**
 * Creates a basic demo popout Application. Foundry renders the outer frame HTML and `.window-content` is the target
 * to attach Svelte components to. You can pass a single Svelte configuration object (documentation forthcoming!) or
 * an array of Svelte components to mount. The lifecycle is managed and when the Foundry Application is closed the
 * Svelte components are destroyed.
 */
export default class DemoApp extends SvelteApplication
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
         id: 'demo-app',
         classes: ['demo-app'],
         width: 700,
         height: 480,
         minimizable: true,
         resizable: true,
         title: 'demo app',
         // svelte: {
         //    class: Demo,
         //    target: '.window-content',
         //    props: {
         //       test: 'Foundry'
         //    }
         // }
         svelte: [      // You can also mount multiple components.
            {
               class: Demo,
               target: '.window-content',
               props: {
                  test: 'Foundry'
               }
            },
            {
               class: Demo,
               target: '.window-content',
               props: {
                  test: 'Testing'
               }
            }
         ]
      });
   }

   /**
    * @param {JQuery} element - The JQuery root element of the application.
    */
   onSvelteMount(element) // eslint-disable-line no-unused-vars
   {
      console.log(`DemoApp - onSvelteMount`);
   }
}