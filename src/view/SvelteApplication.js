/**
 * Provides a Svelte aware extension to Application to control the app lifecycle appropriately.
 */
export default class SvelteApplication extends Application
{
   /**
    * @inheritDoc
    */
   constructor(options)
   {
      super(options);

      /**
       * Stores instantiated Svelte components.
       *
       * @type {object[]}
       * @private
       */
      this._svelteComponents = [];
   }


   /**
    * Handle removing any stored Svelte components when the application is closed.
    *
    * @override
    * @inheritDoc
    */
   async close(options)
   {
      this._svelteComponents = [];
      return super.close(options);
   }

   /**
    * Inject the Svelte components defined in `this.options.svelte`.
    *
    * @override
    * @inheritDoc
    */
   _injectHTML(html)
   {
      if (this.popOut && html.length === 0 && Array.isArray(this.options.svelte))
      {
         throw new Error(
          'SvelteApplication - _injectHTML - A popout app with no template can only support one Svelte component.');
      }

      if (Array.isArray(this.options.svelte))
      {
         for (const svelteConfig of this.options.svelte)
         {
            this._svelteComponents.push(s_LOAD_CONFIG(this, html, svelteConfig));
         }
      }
      else if (typeof this.options.svelte === 'object')
      {
         this._svelteComponents.push(s_LOAD_CONFIG(this, html, this.options.svelte));
      }
      else
      {
         throw new TypeError(`SvelteApplication - _injectHTML - this.options.svelte not an array or object.`);
      }

      // Detect if this is a synthesized DocumentFragment.
      const isDocumentFragment = html.length && html[0] instanceof DocumentFragment && html[0].firstElementChild;

      // Store first child element if DocumentFragment.
      const newElement = isDocumentFragment ? $(html[0].firstElementChild) : void 0;

      super._injectHTML(html);

      // Set the element of the app to the first child of any document fragment.
      if (isDocumentFragment)
      {
         this._element = newElement;
      }

      this.onSvelteMount(this.element);
   }

   /**
    * Provides a callback after all Svelte components are initialized.
    *
    * @param {JQuery} element - JQuery container for main application element.
    */
   onSvelteMount(element) {} // eslint-disable-line no-unused-vars

   /**
    * Override replacing HTML as Svelte components control the rendering process. Only potentially change the outer
    * application frame / title for popout applications.
    *
    * @override
    * @inheritDoc
    */
   _replaceHTML(element, html)  // eslint-disable-line no-unused-vars
   {
      if (!element.length) { return; }

      // For pop-out windows update the window title
      if (this.popOut)
      {
         element.find('.window-title').text(this.title);
      }
   }

   /**
    * Render the inner application content. Only render a template if one is defined otherwise provide an empty
    * JQuery element.
    *
    * @param {Object} data         The data used to render the inner template
    *
    * @returns {Promise.<JQuery>}   A promise resolving to the constructed jQuery object
    *
    * @override
    * @private
    */
   async _renderInner(data)
   {
      const html = typeof this.template === 'string' ? await renderTemplate(this.template, data) :
       document.createDocumentFragment();

      return $(html);
   }
}

/**
 * Instantiates and attaches a Svelte component to the main inserted HTML.
 *
 * @param {Application} app - The application
 *
 * @param {JQuery}      html - The inserted HTML.
 *
 * @param {object}      config - Svelte component options
 *
 * @returns {object} The config + instantiated Svelte component.
 */
function s_LOAD_CONFIG(app, html, config)
{
   const svelteOptions = typeof config.options === 'object' ? config.options : {};
   const injectApp = typeof svelteOptions.injectApp === 'boolean' ? svelteOptions.injectApp : false;
   const hasTemplate = typeof app.template === 'string';
   const hasTarget = typeof config.target === 'string';

   if (typeof config.class !== 'function')
   {
      throw new TypeError(
       `SvelteApplication - s_LOAD_CONFIG - class not a constructor for config:\n${JSON.stringify(config)}.`);
   }

   if (hasTemplate && !hasTarget)
   {
      throw new TypeError(`SvelteApplication - s_LOAD_CONFIG - target selector not a string for config:\n${
       JSON.stringify(config)}`);
   }

   // If a target selector is defined then find it in the JQuery `html` otherwise create an empty fragment.
   const target = hasTarget ? html.find(config.target).get(0) : document.createDocumentFragment();

   if (target === void 0)
   {
      throw new Error(
       `SvelteApplication - s_LOAD_CONFIG - could not find target selector: ${config.target} for config:\n${
        JSON.stringify(config)}`);
   }

   const SvelteComponent = config.class;

   const svelteConfig = { ...config, target  };

   // potentially inject the Foundry application instance as a Svelte prop.
   if (injectApp)
   {
      // Add props object if not defined.
      if (typeof svelteConfig.props !== 'object') { svelteConfig.props = {}; }

      svelteConfig.props._foundryApp = app;
   }

   const result = { config: svelteConfig, component: new SvelteComponent(svelteConfig) };

   if (!hasTarget)
   {
      html.append(target);
   }

   return result;
}