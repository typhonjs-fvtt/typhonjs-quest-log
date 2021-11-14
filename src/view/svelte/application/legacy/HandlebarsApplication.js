import { SvelteApplication }  from '../SvelteApplication';
import ApplicationShell       from '../../component/application/ApplicationShell.svelte';

export class HandlebarsApplication extends SvelteApplication
{
   /**
    * Temporarily holds the original popOut value when rendering.
    *
    * @type {boolean}
    */
   #orignalPopOut;

   /**
    * @inheritDoc
    */
   constructor(options)
   {
      super(options);

      if (this.popOut)
      {
         this.options.svelte = foundry.utils.mergeObject(typeof this.options.svelte === 'object' ?
          this.options.svelte : {}, {
            class: ApplicationShell,
            intro: true,
            target: document.body
         });
      }
   }

   /**
    * Temporarily set popOut to false to only render inner HTML. This inner HTML will be appended to the content area
    * of ApplicationShell if the original popOut value is true.
    *
    * @inheritDoc
    */
   async _render(force, options)
   {
      this.#orignalPopOut = this.options.popOut;
      this.options.popOut = false;
      await super._render(force, options);
      this.options.popOut = this.#orignalPopOut;
   }

   _injectHTML(html)
   {
      // Mounts any Svelte components.
      super._injectHTML(html);

      // Appends inner HTML content to application shell content element.
      if (this.svelte?.applicationShell?.elementContent)
      {
         this.svelte.applicationShell.elementContent.appendChild(...html);
      }
   }

   /**
    * Override replacing HTML as Svelte components control the rendering process. Only potentially change the outer
    * application frame / title for pop-out applications.
    *
    * @override
    * @inheritDoc
    */
   _replaceHTML(element, html)  // eslint-disable-line no-unused-vars
   {
      if (!element.length) { return; }

      super._replaceHTML(element, html);

      if (this.svelte?.applicationShell?.elementContent)
      {
         const elementContent = this.svelte.applicationShell.elementContent;

         // Remove existing children.
         while (elementContent.firstChild && !elementContent.lastChild.remove()) {} // eslint-disable-line no-empty

         elementContent.appendChild(...html);

         // Use the setter from `SvelteFormApplication` to set the title store.
         this.title = this.title; // eslint-disable-line no-self-assign
      }
      else
      {
         element.replaceWith(html);
         this._element = html;
         this.elementTarget = html[0];
      }
   }
}