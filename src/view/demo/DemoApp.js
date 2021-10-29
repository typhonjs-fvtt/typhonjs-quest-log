import { SvelteApplication }  from '@typhonjs-fvtt/svelte';

import Demo                   from './Demo.svelte';

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
         svelte: [
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
}