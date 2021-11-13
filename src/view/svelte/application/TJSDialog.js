// import { SvelteApplication }  from '@typhonjs-fvtt/svelte';
import { safeAccess, safeSet }   from '@typhonjs-utils/object';

import { SvelteApplication }     from './SvelteApplication.js';

import DialogShell               from '../component/dialog/DialogShell.svelte';

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
         svelte: {
            class: DialogShell,
            intro: true,
            target: document.body,
            props: function() { return { data: this.#data }; }
         }
      });
   }

   get content() { return this.getDialogData('content'); }

   get data() { return this.#data; }

   set content(content) { this.setDialogData('content', content); }

   set data(data)
   {
      this.#data = data;

      const component = this.svelte.applicationShell;
      if (component?.data) { component.data = data; }
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

   getDialogData(accessor, defaultValue)
   {
      return safeAccess(this.#data, accessor, defaultValue);
   }

   mergeDialogData(data)
   {
      this.data = foundry.utils.mergeObject(this.#data, data, { inplace: false });
   }

   /**
    * Provides a way to safely set this dialogs data given an accessor string which describes the
    * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
    * to walk.
    *
    * Automatically the dialog data will be updated in the associated DialogShell Svelte component.
    *
    * // TODO DOCUMENT the accessor in more detail.
    *
    * @param {string}   accessor - The path / key to set. You can set multiple levels.
    *
    * @param {*}        value - Value to set.
    */
   setDialogData(accessor, value)
   {
      const success = safeSet(this.#data, accessor, value);

      // If `this.options` modified then update the app options store.
      if (success)
      {
         const component = this.svelte.component(0);
         if (component?.data) { component.data = this.#data; }
      }
   }

   // ---------------------------------------------------------------------------------------------------------------

   static async confirm({ title, content, yes, no, render, defaultYes = true, rejectClose = false, options = {},
    buttons = {}, draggable = true, modal = false, modalOptions = {}, popOut = true, resizable = false, transition = {},
     zIndex } = {})
   {
      // Allow overwriting of default icon and labels.
      const mergedButtons = foundry.utils.mergeObject({
         yes: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize('Yes')
         },
         no: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize('No'),
         }
      }, buttons);

      return new Promise((resolve, reject) =>
      {
         const dialog = new this({
            title,
            content,
            render,
            draggable,
            modal,
            modalOptions,
            popOut,
            resizable,
            zIndex,
            transition,
            buttons: foundry.utils.mergeObject(mergedButtons, {
               yes: {
                  callback: (html) =>
                  {
                     const result = yes ? yes(html) : true;
                     resolve(result);
                  }
               },
               no: {
                  callback: (html) =>
                  {
                     const result = no ? no(html) : false;
                     resolve(result);
                  }
               }
            }),
            default: defaultYes ? "yes" : "no",
            close: () =>
            {
               if (rejectClose) { reject('The confirmation Dialog was closed without a choice being made.'); }
               else { resolve(null); }
            },
         }, options);
         dialog.render(true);
      });
   }

   static async prompt({ title, content, label, callback, render, rejectClose = false, options = {}, draggable = true,
    icon = '<i class="fas fa-check"></i>', modal = false, modalOptions = {}, popOut = true, resizable = false,
     transition = {}, zIndex } = {})
   {
      return new Promise((resolve, reject) =>
      {
         const dialog = new this({
            title,
            content,
            render,
            draggable,
            modal,
            modalOptions,
            popOut,
            resizable,
            transition,
            zIndex,
            buttons: {
               ok: {
                  icon,
                  label,
                  callback: (html) =>
                  {
                     const result = callback ? callback(html) : null;
                     resolve(result);
                  }
               },
            },
            default: 'ok',
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