// import { SvelteApplication }  from '@typhonjs-fvtt/svelte';
import { SvelteApplication }     from '../svelte/application/SvelteApplication.js';

import { TJSComponentShell }  from '@typhonjs-fvtt/svelte/component';

import Demo                   from './Demo.svelte';
import DemoShell              from './DemoShell.svelte';

import TJSApplicationShell    from "../svelte/component/application/TJSApplicationShell.svelte";
import ApplicationShell       from "../svelte/component/application/ApplicationShell.svelte";

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

         svelte: {      // Mount a single Svelte component
            class: ApplicationShell,
            target: document.body,
            intro: true,

            children: {
               class: Demo,
               props: {
                  test: 'Foundry'
               }
            }
         }

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

         // svelte: {
         //    class: TJSComponentShell,
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
         //    }
         // }

         // svelte: {      // You can also inject multiple children with ComponentShell.
         //    class: TJSComponentShell,
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
         //    ]
         // }

         // svelte: {      // ComponentShell posts a warning if no children added.
         //    class: TJSComponentShell,
         //    target: '.window-content',
         // }
      });
   }
}