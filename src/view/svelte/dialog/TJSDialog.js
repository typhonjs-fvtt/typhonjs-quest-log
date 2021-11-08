// import { SvelteApplication }  from '@typhonjs-fvtt/svelte';
import { SvelteApplication }  from '../SvelteApplication.js';

import DialogShell            from './DialogShell.svelte';

/**
 * Provides a Foundry API compatible dialog alternative implemented w/ Svelte. There are several features including
 * a glasspane / modal option with various styling and transition capabilities.
 */
export class TJSDialog extends SvelteApplication
{
   #data;

   constructor(data, options)
   {
      super(options);

      this.#data = data;
   }

   static get defaultOptions()
   {
      return foundry.utils.mergeObject(super.defaultOptions, {
         classes: ['dialog'],
         width: 400,
         popOut: false,
         svelte: {
            class: DialogShell,
            intro: true,
            target: document.body,
            props: function() { return { data: this.#data }; },
            options: { injectApp: true }
         }
      });
   }

   get data() { return this.#data; }

   get title() { return this.#data.title || 'Dialog'; }

   set data(data)
   {
      this.#data = data;

      const componentData = this.getSvelteData(0);
      if (componentData?.component?.data) { componentData.component.data = data; }
   }

   /**
    * Implemented only for backwards compatibility w/ default Foundry {@link Dialog} API.
    *
    * @param {JQuery}   html - JQuery element for content area.
    */
   activateListeners(html)
   {
      super.activateListeners(html);

      if (this.data.render instanceof Function) { this.data.render(this.options.jQuery ? html : html[0]); }
   }

   async close(options)
   {
      /**
       * Implemented only for backwards compatibility w/ default Foundry {@link Dialog} API.
       */
       if (this.data.close instanceof Function)
      {
         this.data.close(this.options.jQuery ? this.element : this.element[0]);
      }

      return super.close(options);
   }

   getDialogData(key)
   {
      return this.#data[key];
   }

   mergeDialogData(data)
   {
      this.data = foundry.utils.mergeObject(this.#data, data);
   }

   onSvelteMount({ targetElement })
   {
      // Make the window draggable
      const header = targetElement.querySelector('header');
      new Draggable(this, $(targetElement), header, this.options.resizable);

      // TODO REMOVE!
      // setTimeout(() =>
      // {
      //    this.mergeDialogData({
      //       title: 'WOOOO!',
      //       content: 'NEW CONTENT',
      //       buttons: {
      //          maybe: {
      //             icon: '<i class="fas fa-bug"></i>',
      //             label: game.i18n.localize('Maybe')
      //          }
      //       }
      //    });
      // }, 1000);
   }

   setDialogData(key, value)
   {
      this.#data[key] = value;

      const componentData = this.getSvelteData(0);
      if (componentData?.component?.data) { componentData.component.data = this.#data; }
   }

   // ---------------------------------------------------------------------------------------------------------------

   static async confirm({ title, content, yes, no, render, defaultYes = true, rejectClose = false, modal = false,
    options = {} } = {})
   {
      return new Promise((resolve, reject) =>
      {
         const dialog = new this({
            title,
            content,
            modal,
            buttons: {
               yes: {
                  icon: '<i class="fas fa-check"></i>',
                  label: game.i18n.localize('Yes'),
                  callback: (html) =>
                  {
                     const result = yes ? yes(html) : true;
                     resolve(result);
                  }
               },
               no: {
                  icon: '<i class="fas fa-times"></i>',
                  label: game.i18n.localize('No'),
                  callback: (html) =>
                  {
                     const result = no ? no(html) : false;
                     resolve(result);
                  }
               }
            },
            default: defaultYes ? "yes" : "no",
            render,
            close: () =>
            {
               if (rejectClose) { reject('The confirmation Dialog was closed without a choice being made.'); }
               else { resolve(null); }
            },
         }, options);
         dialog.render(true);
      });
   }

   static async prompt({ title, content, label, callback, render, rejectClose = true, modal = false,
    options = {} } = {})
   {
      return new Promise((resolve, reject) =>
      {
         const dialog = new this({
            title,
            content,
            modal,
            buttons: {
               ok: {
                  icon: '<i class="fas fa-check"></i>',
                  label,
                  callback: (html) =>
                  {
                     const result = callback(html);
                     resolve(result);
                  }
               },
            },
            default: 'ok',
            render,
            close: () =>
            {
               if (rejectClose)
               {
                  reject(new Error('The Dialog prompt was closed without being accepted.'));
               }
               else { resolve(null); }
            },
         }, options);
         dialog.render(true);
      });
   }
}