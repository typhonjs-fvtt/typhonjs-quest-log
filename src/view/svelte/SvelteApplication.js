import { outroAndDestroy, parseSvelteConfig }   from '@typhonjs-fvtt/svelte/util';

import { isApplicationShell } from './isApplicationShell';

/**
 * Provides a Svelte aware extension to Application to control the app lifecycle appropriately. You can declaratively
 * load one or more components from `defaultOptions`. For the time being please refer to this temporary demo code
 * in `typhonjs-quest-log` for examples of how to declare Svelte components.
 * {@link https://github.com/typhonjs-fvtt/typhonjs-quest-log/tree/master/src/view/demo}
 *
 * A repository of demos will be available soon.
 */
export class SvelteApplication extends Application
{
   /**
    * Stores the first mounted ApplicationShell or TJSApplicationShell.
    *
    * @type {ApplicationShell|TJSApplicationShell}
    */
   #applicationShell = null;

   /**
    * Stores SvelteData entries with instantiated Svelte components.
    *
    * @type {object[]}
    * @private
    */
   #svelteData = [];

   /**
    * Stores the target element which may not necessarily be the main element.
    *
    * @type {JQuery}
    */
   #elementTarget = null;

   /**
    * Stores the content element which is set for application shells.
    *
    * @type {JQuery}
    */
   #elementContent = null;

   /**
    * @inheritDoc
    */
   constructor(options)
   {
      super(options);
   }
   /**
    * Returns the content element if an application shell is mounted.
    *
    * @returns {JQuery} Content element.
    */
   get elementContent() { return this.#elementContent; }

   /**
    * Returns the length of the SvelteData entry array.
    *
    * @returns {number} Number of SvelteData entries loaded.
    */
   get svelteDataLength() { return this.#svelteData.length; }

   /**
    * Returns the target element or main element if no target defined.
    *
    * @returns {JQuery} Target element.
    */
   get elementTarget() { return this.#elementTarget; }

   /**
    * Note: This method is fully overridden and duplicated as Svelte components need to be destroyed manually and the
    * best visual result is to destroy them after the default JQuery slide up animation occurs, but before the element
    * is removed from the DOM.
    *
    * If you destroy the Svelte components before the slide up animation the Svelte elements are removed immediately
    * from the DOM. The purpose of overriding ensures the slide up animation is always completed before
    * the Svelte components are destroyed and then the element is removed from the DOM.
    *
    * Close the application and un-register references to it within UI mappings.
    * This function returns a Promise which resolves once the window closing animation concludes
    *
    * @param {object}   options - Optional parameters.
    *
    * @param {boolean}  options.force - Force close regardless of render state.
    *
    * @returns {Promise<void|number>}    A Promise which resolves once the application is closed
    */
   async close(options = {})
   {
      const states = Application.RENDER_STATES;
      if (!options.force && ![states.RENDERED, states.ERROR].includes(this._state)) { return; }

      this._state = states.CLOSING;

      /**
       * Get the element.
       *
       * @type {JQuery}
       */
      const el = this.#elementTarget;
      if (!el) { return this._state = states.CLOSED; }

      el[0].style.minHeight = '0';

      // Dispatch Hooks for closing the base and subclass applications
      for (const cls of this.constructor._getInheritanceChain())
      {
         /**
          * A hook event that fires whenever this Application is closed.
          *
          * @param {Application} app                     The Application instance being closed
          *
          * @param {jQuery[]} html                       The application HTML when it is closed
          *
          * @function closeApplication
          *
          * @memberof hookEvents
          */
         Hooks.call(`close${cls.name}`, this, el);
      }

      // Await on JQuery to slide up the main element.
      await new Promise((resolve) => { el.slideUp(200, () => resolve()); });

      // Stores the Promises returned from running outro transitions and destroying each Svelte component.
      const svelteDestroyPromises = [];

      // Manually invoke the destroy callbacks for all Svelte components.
      for (const entry of this.#svelteData)
      {
         // Use `outroAndDestroy` to run outro transitions before destroying.
         svelteDestroyPromises.push(outroAndDestroy(entry.component));

         // If any proxy eventbus has been added then remove all event registrations from the component.
         const eventbus = entry.config.eventbus;
         if (typeof eventbus === 'object' && typeof eventbus.off === 'function')
         {
            eventbus.off();
            entry.config.eventbus = void 0;
         }
      }

      this.#svelteData = [];

      // Await all Svelte components to destroy.
      await Promise.all(svelteDestroyPromises);

      el.remove();

      // Clean up data
      this.#applicationShell = null;
      this._element = null;
      this.#elementContent = null;
      this.#elementTarget = null;
      delete ui.windows[this.appId];
      this._minimized = false;
      this._scrollPositions = null;
      this._state = states.CLOSED;
   }

   /**
    * Returns any mounted application shell.
    *
    * @returns {ApplicationShell|TJSApplicationShell} Mounted application shell.
    */
   getApplicationShell()
   {
      return this.#applicationShell;
   }

   /**
    * Returns the indexed Svelte component.
    *
    * @param {number}   index -
    *
    * @returns {object} The loaded Svelte component.
    */
   getSvelteComponent(index)
   {
      const data = this.#svelteData[index];
      return typeof data === 'object' ? data?.component : void 0;
   }

   /**
    * Returns the Svelte component entries iterator.
    *
    * @returns {Generator<(number|*)[], void, *>} Svelte component entries iterator.
    * @yields
    */
   *getSvelteComponentEntries()
   {
      for (let cntr = 0; cntr < this.#svelteData.length; cntr++)
      {
         yield [cntr, this.#svelteData[cntr].component];
      }
   }

   /**
    * Returns the Svelte component values iterator.
    *
    * @returns {Generator<*, void, *>} Svelte component values iterator.
    * @yields
    */
   *getSvelteComponentValues()
   {
      for (let cntr = 0; cntr < this.#svelteData.length; cntr++)
      {
         yield this.#svelteData[cntr].component;
      }
   }

   /**
    * Returns the indexed SvelteData entry.
    *
    * @param {number}   index -
    *
    * @returns {object} The loaded Svelte config + component.
    */
   getSvelteData(index)
   {
      return this.#svelteData[index];
   }

   /**
    * Returns the SvelteData entries iterator.
    *
    * @returns {IterableIterator<[number, Object]>} SvelteData entries iterator.
    */
   getSvelteDataEntries()
   {
      return this.#svelteData.entries();
   }

   /**
    * Returns the SvelteData values iterator.
    *
    * @returns {IterableIterator<Object>} SvelteData values iterator.
    */
   getSvelteDataValues()
   {
      return this.#svelteData.values();
   }

   /**
    * Returns whether an application shell is mounted.
    *
    * @returns {boolean} Application shell mounted.
    */
   hasApplicationShell()
   {
      return this.#applicationShell !== null;
   }

   /**
    * Inject the Svelte components defined in `this.options.svelte`. The Svelte component can attach to the existing
    * pop-out of Application or provide no template and render into a document fragment which is then attached to the
    * DOM.
    *
    * @param {JQuery} html -
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
            const svelteData = s_LOAD_CONFIG(this, html, svelteConfig);
            if (isApplicationShell(svelteData.component))
            {
               if (this.#applicationShell !== null)
               {
                  throw new Error(
                   `SvelteApplication - _injectHTML - An application shell is already mounted; offending config: 
                    ${JSON.stringify(svelteConfig)}`);
               }

               this.#applicationShell = svelteData.component;
            }

            this.#svelteData.push(svelteData);
         }
      }
      else if (typeof this.options.svelte === 'object')
      {
         const svelteData = s_LOAD_CONFIG(this, html, this.options.svelte);
         if (isApplicationShell(svelteData.component))
         {
            // A sanity check as shouldn't hit this case as only one component is being mounted.
            if (this.#applicationShell !== null)
            {
               throw new Error(
                `SvelteApplication - _injectHTML - An application shell is already mounted; offending config: 
                 ${JSON.stringify(this.options.svelte)}`);
            }

            this.#applicationShell = svelteData.component;
         }

         this.#svelteData.push(svelteData);
      }
      else
      {
         throw new TypeError(`SvelteApplication - _injectHTML - this.options.svelte not an array or object.`);
      }

      // Detect if this is a synthesized DocumentFragment.
      const isDocumentFragment = html.length && html[0] instanceof DocumentFragment;

      // If any of the Svelte components mounted directly targets an HTMLElement then do not inject HTML.
      let injectHTML = true;
      for (const svelteData of this.#svelteData)
      {
         if (!svelteData.injectHTML) { injectHTML = false; break; }
      }
      if (injectHTML) { super._injectHTML(html); }

      if (this.hasApplicationShell())
      {
         this._element = $(this.#applicationShell.elementRoot);
         this.#elementContent = $(this.#applicationShell.elementContent);
      }
      else if (isDocumentFragment) // Set the element of the app to the first child element in order of Svelte components mounted.
      {
         for (const svelteData of this.#svelteData)
         {
            if (svelteData.element instanceof HTMLElement)
            {
               this._element = $(svelteData.element);
               break;
            }
         }
      }

      // Potentially retrieve a specific target element if `selectorTarget` is defined otherwise make the target the
      // main element.
      this.#elementTarget = typeof this.options.selectorTarget === 'string' ?
       this._element.find(this.options.selectorTarget) : this._element;


      if (this.#elementTarget === null || this.#elementTarget === void 0 || this.#elementTarget.length === 0)
      {
         throw new Error(`SvelteApplication - _injectHTML: Target element '${this.options.selectorTarget}' not found.`);
      }

      this.onSvelteMount({ element: this._element[0], elementContent: this.#elementContent !== null ?
       this.elementContent[0] : void 0, elementTarget: this.#elementTarget[0] });
   }

   /**
    * Provides a callback after all Svelte components are initialized.
    *
    * @param {object}      opts - Options.
    *
    * @param {HTMLElement} opts.element - HTMLElement container for main application element.
    *
    * @param {HTMLElement} opts.elementContent - HTMLElement container for content area of application shells.
    *
    * @param {HTMLElement} opts.elementTarget - HTMLElement container for main application target element.
    */
   onSvelteMount({ element, elementContent, elementTarget }) {} // eslint-disable-line no-unused-vars

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

   /**
    * Modified Application `setPosition` to support QuestTrackerApp for switchable resizable globalThis.
    * Set the application position and store its new location.
    *
    * @param {object}               [opts] - Optional parameters.
    *
    * @param {number|null}          [opts.left] - The left offset position in pixels
    *
    * @param {number|null}          [opts.top] - The top offset position in pixels
    *
    * @param {number|null}          [opts.width] - The application width in pixels
    *
    * @param {number|string|null}   [opts.height] - The application height in pixels
    *
    * @param {number|null}          [opts.scale] - The application scale as a numeric factor where 1.0 is default
    *
    * @param {boolean}              [opts.noHeight] - When true no element height is modified.
    *
    * @param {boolean}              [opts.noWidth] - When true no element Width is modified.
    *
    * @returns {{left: number, top: number, width: number, height: number, scale:number}}
    * The updated position object for the application containing the new values
    */
   setPosition({ left, top, width, height, scale, noHeight = false, noWidth = false } = {})
   {
      const el = this.elementTarget[0];
      const currentPosition = this.position;
      const styles = globalThis.getComputedStyle(el);

      // Update width if an explicit value is passed, or if no width value is set on the element
      if (!el.style.width || width)
      {
         const tarW = width || el.offsetWidth;
         const minW = parseInt(styles.minWidth) || MIN_WINDOW_WIDTH;
         const maxW = el.style.maxWidth || globalThis.innerWidth;
         currentPosition.width = width = Math.clamped(tarW, minW, maxW);

         if (!noWidth) { el.style.width = `${width}px`; }
         if ((width + currentPosition.left) > globalThis.innerWidth) { left = currentPosition.left; }
      }
      width = el.offsetWidth;

      // Update height if an explicit value is passed, or if no height value is set on the element
      if (!el.style.height || height)
      {
         const tarH = height || (el.offsetHeight + 1);
         const minH = parseInt(styles.minHeight) || MIN_WINDOW_HEIGHT;
         const maxH = el.style.maxHeight || globalThis.innerHeight;
         currentPosition.height = height = Math.clamped(tarH, minH, maxH);

         if (!noHeight) { el.style.height = `${height}px`; }
         if ((height + currentPosition.top) > globalThis.innerHeight + 1) { top = currentPosition.top - 1; }
      }
      height = el.offsetHeight;

      // Update Left
      if ((!el.style.left) || Number.isFinite(left))
      {
         const tarL = Number.isFinite(left) ? left : (globalThis.innerWidth - width) / 2;
         const maxL = Math.max(globalThis.innerWidth - width, 0);
         currentPosition.left = left = Math.clamped(tarL, 0, maxL);
         el.style.left = `${left}px`;
      }

      // Update Top
      if ((!el.style.top) || Number.isFinite(top))
      {
         const tarT = Number.isFinite(top) ? top : (globalThis.innerHeight - height) / 2;
         const maxT = Math.max(globalThis.innerHeight - height, 0);
         currentPosition.top = top = Math.clamped(tarT, 0, maxT);
         el.style.top = `${currentPosition.top}px`;
      }

      // Update Scale
      if (scale)
      {
         currentPosition.scale = Math.max(scale, 0);
         if (scale === 1) { el.style.transform = ""; }
         else { el.style.transform = `scale(${scale})`; }
      }

      // Return the updated position object
      return currentPosition;
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

   if (typeof app.template === 'string' && typeof config.target !== 'string')
   {
      throw new TypeError(
       `SvelteApplication - s_LOAD_CONFIG - Template defined and target selector not a string for config:\n${
        JSON.stringify(config)}`);
   }

   let target;

   if (config.target instanceof HTMLElement)       // A specific HTMLElement to append Svelte component.
   {
      target = config.target;
   }
   else if (typeof config.target === 'string')     // A string target defines a selector to find in existing HTML.
   {
      target = html.find(config.target).get(0);
   }
   else                                            // No target defined, create a document fragment.
   {
      target = document.createDocumentFragment();
   }

   if (target === void 0)
   {
      throw new Error(
       `SvelteApplication - s_LOAD_CONFIG - could not find target selector: ${config.target} for config:\n${
        JSON.stringify(config)}`);
   }

   const SvelteComponent = config.class;

   const svelteConfig = parseSvelteConfig({ ...config, target }, app);

   const injectApp = typeof svelteOptions.injectApp === 'boolean' ? svelteOptions.injectApp : false;
   const injectEventbus = typeof svelteOptions.injectEventbus === 'boolean' ? svelteOptions.injectEventbus : false;

   // Potentially inject the Foundry application instance as a Svelte prop.
   if (injectApp)
   {
      svelteConfig.context.get('external').foundryApp = app;
   }

   let eventbus;

   // Potentially inject any TyphonJS eventbus and track the proxy in the options.
   if (injectEventbus && typeof app._eventbus === 'object' && typeof app._eventbus.createProxy === 'function')
   {
      eventbus = app._eventbus.createProxy();
      svelteConfig.context.get('external').eventbus = eventbus;
   }

   // Create the Svelte component.
   const component = new SvelteComponent(svelteConfig);

   // Set any eventbus to the config.
   svelteConfig.eventbus = eventbus;

   let element;

   // We can directly get the root element from components which follow the application store contract.
   if (isApplicationShell(component))
   {
      element = component.elementRoot;
   }

   // Detect if target is a synthesized DocumentFragment with an child element. Child elements will be present
   // if the Svelte component mounts and renders initial content into the document fragment.
   if (config.target instanceof DocumentFragment && target.firstElementChild)
   {
      if (element === void 0) { element = target.firstElementChild; }
      html.append(target);
   }
   else if (config.target instanceof HTMLElement && element === void 0)
   {
      if (config.target instanceof HTMLElement && typeof svelteOptions.selectorElement !== 'string')
      {
         throw new Error(
          `SvelteApplication - s_LOAD_CONFIG - HTMLElement target with no 'selectorElement' defined for config:\n${
           JSON.stringify(config)}`);
      }

      // The target is an HTMLElement so find the Application element from `selectorElement` option.
      element = target.querySelector(svelteOptions.selectorElement);

      if (element === null || element === void 0)
      {
         throw new Error(
          `SvelteApplication - s_LOAD_CONFIG - HTMLElement target - could not find 'selectorElement' for config:\n${
           JSON.stringify(config)}`);
      }
   }

   // If the configuration / original target is an HTML element then do not inject HTML.
   const injectHTML = !(config.target instanceof HTMLElement);

   const result = { config: svelteConfig, component, element, injectHTML };

   Object.freeze(result);

   return result;
}