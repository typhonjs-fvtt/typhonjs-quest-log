import Demo from './Demo.svelte';

export default class DemoApp extends Application
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
         template: 'modules/typhonjs-quest-log/templates/demo.html',
         width: 700,
         height: 480,
         minimizable: true,
         resizable: false,
         title: 'demo app'
      });
   }

   activateListeners(html)
   {
      this.component = new Demo({
         target: html.get(0),
         props: {
            test: 'Foundry'
         },
      });
   }
}