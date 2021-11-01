// import { ComponentShell, SvelteApplication } from '@typhonjs-fvtt/svelte';

import SvelteApplication   from "../svelte/SvelteApplication.js";
import ComponentShell      from "../svelte/ComponentShell.svelte";

import Demo       from './Demo.svelte';
import DemoShell  from './DemoShell.svelte';

/**
 * Creates a basic demo popout Application. Foundry renders the outer frame HTML and `.window-content` is the target
 * to attach Svelte components to. You can pass a single Svelte configuration object (documentation forthcoming!) or
 * an array of Svelte components to mount. The lifecycle is managed and when the Foundry Application is closed the
 * Svelte components are destroyed.
 */
export default class DemoApp extends SvelteApplication
{
   constructor(options)
   {
      super(options);
      this._test = 'TESTING CONTEXT';     // Used in advanced ComponentShell demo below.
   }

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

         // svelte: {      // Mount a single Svelte component
         //    class: Demo,
         //    target: '.window-content',
         //    props: {
         //       test: 'Foundry'
         //    }
         // }

         // svelte: [      // You can also mount multiple components.
         //    {
         //       class: Demo,
         //       target: '.window-content',
         //       props: {
         //          test: 'Foundry'
         //       }
         //    },
         //    {
         //       class: Demo,
         //       target: '.window-content',
         //       props: {
         //          test: 'Testing'
         //       }
         //    }
         // ]

         // svelte: {      // ComponentShell will inject a context with the Foundry app reference.
         //    class: ComponentShell,
         //    target: '.window-content',
         //
         //    // Advanced: For ApplicationShell / ComponentShell you can define a context function which is invoked with
         //    // `this` being the Foundry application to set context parameters at runtime.
         //    context: function() { return { TEST: this._test }; },
         //
         //    children: {
         //       class: DemoShell,
         //       props: {
         //          test: 'context'
         //       }
         //    },
         //    options: { injectApp: true }
         // }

         // svelte: {      // You can also inject multiple children with ComponentShell.
         //    class: ComponentShell,
         //    target: '.window-content',
         //    children: [
         //       {
         //          class: DemoShell,
         //          props: {
         //             test: 'Foundry'
         //          }
         //       },
         //       {
         //          class: DemoShell,
         //          props: {
         //             test: 'Test'
         //          }
         //       }
         //    ],
         //    options: { injectApp: true }
         // }

         svelte: {      // ComponentShell posts a warning if no children added.
            class: ComponentShell,
            target: '.window-content',
            options: { injectApp: true }
         }
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