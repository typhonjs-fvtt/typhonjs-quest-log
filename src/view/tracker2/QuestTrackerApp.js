// import { SvelteApplication }     from '@typhonjs-fvtt/svelte';
import { SvelteApplication }     from '../svelte/SvelteApplication.js';

import createHeaderButtons       from './createHeaderButtons.js';
import QuestTrackerShell         from './QuestTrackerShell.svelte';

import { constants, settings }   from '#constants';

/**
 * Provides the default width for the QuestTracker if not defined.
 *
 * @type {number}
 */
const s_DEFAULT_WIDTH = 296;

/**
 * Provides the default position for the QuestTracker if not defined.
 *
 * @type {{top: number, width: number}}
 */
const s_DEFAULT_POSITION = { top: 80, width: s_DEFAULT_WIDTH };

export default class QuestTrackerApp extends SvelteApplication
{
   /**
    * Stores CSS attributes for min / max width and height.
    *
    * @type {object}
    */
   #appExtents;

   /**
    * Stores whether the header is being dragged.
    *
    * @type {boolean}
    * @private
    */
   #dragHeader = false;

   /**
    * Stores whether the current position is in the sidebar pin drop rectangle.
    *
    * @type {boolean}
    * @private
    */
   #inPinDropRect = false;

   /**
    * Stores whether the QuestTracker is pinned to the sidebar.
    *
    * @type {boolean}
    * @private
    */
   #pinned = game.settings.get(constants.moduleName, settings.questTrackerPinned);

   /**
    * Stores whether the QuestTracker window is resizable.
    *
    * @type {boolean}
    */
   #windowResizable = game.settings.get(constants.moduleName, settings.questTrackerResizable);

   /**
    * @inheritDoc
    * @see https://foundryvtt.com/api/Application.html
    */
   constructor(options = {})
   {
      super(options);

      try
      {
         /**
          * Stores the current position of the quest tracker.
          *
          * @type {object}
          * {@link Application.position}
          */
         this.position = JSON.parse(game.settings.get(constants.moduleName, settings.questTrackerPosition));

         // When upgrading to `v0.7.7` it is necessary to set the default width.
         if (!this.position?.width) { this.position.width = s_DEFAULT_WIDTH; }
      }
      catch (err)
      {
         this.position = s_DEFAULT_POSITION;
      }
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
         id: 'quest-tracker',
         resizable: true,
         minimizable: true,
         popOut: false,
         width: 300,
         height: game.settings.get(constants.moduleName, settings.questTrackerResizable) ? 'auto' : 480,
         title: game.i18n.localize('TyphonJSQuestLog.QuestTracker.Title'),
         jqueryAnimation: false,    // The Foundry JQuery close animation is not run.
         svelte: {
            class: QuestTrackerShell,
            intro: true,
            target: document.body,
            options: {
               injectApp: true,
               injectEventbus: true,
            }
         }
      });
   }

   /**
    * Gets the minimum width of this Application.
    *
    * @returns {number} Minimum width.
    */
   get minWidth() { return this.#appExtents.minWidth || 275; }

   /**
    * Is the QuestTracker pinned to the sidebar.
    *
    * @returns {boolean} QuestTracker pinned.
    */
   get pinned() { return this.#pinned; }

   /**
    * Sets `questTrackerEnabled` to false.
    *
    * @param {object}   [options] - Optional parameters.
    *
    * @param {boolean}  [options.updateSetting=true] - If true then {@link settings.questTrackerEnabled} is set to false.
    *
    * @returns {Promise<void>}
    */
   async close({ updateSetting = true } = {})
   {
      await super.close();

      if (updateSetting)
      {
         await game.settings.set(constants.moduleName, settings.questTrackerEnabled, false);
      }
   }

   /**
    * Specify the set of config buttons which should appear in the Application header. Buttons should be returned as an
    * Array of objects.
    *
    * Provides an explicit override of Application._getHeaderButtons to add
    *
    * @returns {ApplicationHeaderButton[]} The app header buttons.
    * @override
    */
   _getHeaderButtons()
   {
      const buttons = super._getHeaderButtons();

      // Remove default `Close` label for close button.
      const closeButton = buttons.find((button) => button?.class === 'close');
      if (closeButton) { closeButton.label = void 0; }

      return [...createHeaderButtons(this._eventbus), ...buttons];
   }

   /**
    * Handles showing / hiding the resize element.
    *
    * @param {boolean}  value - Current value of {@link TQLSettings.questTrackerResizable}.
    */
   #handleSettingWindowResize(value)
   {
      /**
       * Stores the state of {@link TQLSettings.questTrackerResizable}.
       *
       * @type {boolean}
       * @private
       */
      this.#windowResizable = value;

      // Early out if there is no root element; resize setting can be set when there is no quest tracker rendered.
      if (this.elementTarget === null || this.elementTarget === void 0 || this.elementTarget[0] === void 0) { return; }

      const elementTarget = this.elementTarget[0];

      const elemResizeHandle = elementTarget.querySelector('#quest-tracker .window-resizable-handle');

      if (this.#windowResizable)
      {
         // When resizable is set to true set the current position to the stored position. This allows the position
         // variable to be updated to the last auto height set position.
         try
         {
            this.position = JSON.parse(game.settings.get(constants.moduleName, settings.questTrackerPosition));
         }
         catch (err)
         {
            console.log(`TyphonJSQuestLog - QuestTracker - #handleSettingWindowResize - error: ${err.message}`);
         }

         elemResizeHandle.style.display = 'block';
         elementTarget.style.minHeight = this.#appExtents.minHeight;
      }
      else
      {
         const elemWindowHeader = elementTarget.querySelector('#quest-tracker .window-header');

         elemResizeHandle.style.display = 'none';

         elementTarget.style.minHeight = elemWindowHeader.scrollHeight;

         // Set height to auto. This will cause QuestTrackerShell to save the new position.
         elementTarget.style.height = 'auto';
      }
   }
   /**
    * Handles the pointer down event from the header to reset the pinned state.
    *
    * @param {PointerEvent}   event - PointerEvent
    *
    * @param {HTMLElement}    header - The app header element.
    */
   async #handleHeaderPointerDown(event, header)
   {
      if (event.target.classList.contains('window-title') ||
       event.target.classList.contains('window-header'))
      {
         this.#dragHeader = true;
         this.#pinned = false;
         await game.settings.set(constants.moduleName, settings.questTrackerPinned, false);
         header.setPointerCapture(event.pointerId);
      }
   }

   /**
    * Handles the pointer up event from the header to check for and set the pinned state.
    *
    * @param {PointerEvent}   event - PointerEvent
    *
    * @param {HTMLElement}    header - The app header element.
    */
   async #handleHeaderPointerUp(event, header)
   {
      header.releasePointerCapture(event.pointerId);
      this.#dragHeader = false;

      if (this.#inPinDropRect)
      {
         this.#pinned = true;
         await game.settings.set(constants.moduleName, settings.questTrackerPinned, true);
         this.elementTarget[0].style.animation = '';
      }
   }

   /**
    * Defines all {@link JQuery} control callbacks with event listeners for click, drag, drop via various CSS selectors.
    *
    * @param {HTMLElement}  element - The jQuery instance for the window content of this Application.
    *
    * @see https://foundryvtt.com/api/FormApplication.html#activateListeners
    */
   onSvelteMount({ elementTarget })
   {
      // Make the window draggable
      const header = elementTarget.querySelector('header');
      new Draggable(this, [elementTarget], header, this.options.resizable);

      // Use pointer events to make sure accurate drag & drop is detected especially when mouse outside window bounds.
      header.addEventListener('pointerdown', async (event) => this.#handleHeaderPointerDown(event, header));
      header.addEventListener('pointerup', async (event) => this.#handleHeaderPointerUp(event, header));

      const styles = globalThis.getComputedStyle(elementTarget);

      /**
       * Stores the app / window extents from styles.
       *
       * @type {{minHeight: number, maxHeight: number, minWidth: number, maxWidth: number}}
       *
       * @private
       */
      this.#appExtents = {
         minWidth: parseInt(styles.minWidth),
         maxWidth: parseInt(styles.maxWidth),
         minHeight: parseInt(styles.minHeight),
         maxHeight: parseInt(styles.maxHeight)
      };

      this.#handleSettingWindowResize(game.settings.get(constants.moduleName, settings.questTrackerResizable));
   }

   /**
    * Override default Application `bringToTop` to stop adjustment of z-index and set height to auto if not resizable.
    *
    * @override
    * @inheritDoc
    * @see https://foundryvtt.com/api/Application.html#bringToTop
    */
   bringToTop()
   {
      if (!this.#windowResizable) { this.elementTarget[0].style.height = 'auto'; }
   }

   /**
    * Some game systems and custom UI theming modules provide hard overrides on overflow-x / overflow-y styles. Alas we
    * need to set these for '.window-content' to 'visible' which will cause an issue for very long tables. Thus we must
    * manually set the table max-heights based on the position / height of the {@link Application}.
    *
    * @param {object}               [opts] - Optional parameters.
    *
    * @param {number|null}          [opts.left] - The left offset position in pixels.
    *
    * @param {number|null}          [opts.top] - The top offset position in pixels.
    *
    * @param {number|null}          [opts.width] - The application width in pixels.
    *
    * @param {number|string|null}   [opts.height] - The application height in pixels.
    *
    * @param {number|null}          [opts.scale] - The application scale as a numeric factor where 1.0 is default.
    *
    * @param {boolean}              [opts.noHeight] - When true no element height is modified.
    *
    * @param {boolean}              [opts.noWidth] - When true no element Width is modified.
    *
    * @param {boolean}              [opts.override] - Forces any manual pinned setting to take effect.
    *
    * @param {boolean}              [opts.pinned] - Sets the pinned state.
    *
    * @returns {{left: number, top: number, width: number, height: number, scale:number}}
    * The updated position object for the application containing the new values.
    */
   setPosition({ override, pinned = this.#pinned, ...opts } = {})
   {
      // Potentially force override any pinned state. This is done from TQLHooks.openQuestTracker.
      if (typeof override === 'boolean')
      {
         if (pinned)
         {
            this.#pinned = true;
            this.#inPinDropRect = true;
            game.settings.set(constants.moduleName, settings.questTrackerPinned, true);
            this._eventbus.trigger('tql:foundryuimanager:update:tracker');
            return opts; // Early out as updateTracker above calls setPosition again.
         }
         else
         {
            this.#pinned = false;
            this.#inPinDropRect = false;
            game.settings.set(constants.moduleName, settings.questTrackerPinned, false);
         }
      }

      const initialTop = this.position.top;
      const initialLeft = this.position.left;
      const initialWidth = this.position.width;
      const initialHeight = this.position.height;

      if (pinned)
      {
         if (typeof opts.left === 'number') { opts.left = this.position.left; }
         if (typeof opts.top === 'number') { opts.top = this.position.top; }
         if (typeof opts.width === 'number') { opts.width = this.position.width; }
      }

      // SvelteApplication provides a customized setPosition which works with popOut / non-popOut apps and
      // takes a `noHeight` / `noWidth` parameters to alter setting height / width.
      opts.noHeight = !this.#windowResizable;
      const currentPosition = super.setPosition(opts);

      // Pin width / height to min / max styles if defined.
      if (currentPosition.width < this.#appExtents.minWidth) { currentPosition.width = this.#appExtents.minWidth; }
      if (currentPosition.width > this.#appExtents.maxWidth) { currentPosition.width = this.#appExtents.maxWidth; }
      if (currentPosition.height < this.#appExtents.minHeight) { currentPosition.height = this.#appExtents.minHeight; }
      if (currentPosition.height > this.#appExtents.maxHeight) { currentPosition.height = this.#appExtents.maxHeight; }

      const el = this.elementTarget[0];

      currentPosition.resizeWidth = initialWidth < currentPosition.width;
      currentPosition.resizeHeight = initialHeight < currentPosition.height;

      // Mutates `checkPosition` to set maximum left position. Must do this calculation after `super.setPosition`
      // as in some cases `super.setPosition` will override the changes of `FoundryUIManager.checkPosition`.
      const currentInPinDropRect = this.#inPinDropRect;
      this.#inPinDropRect = this._eventbus.triggerSync('tql:foundryuimanager:check:position', currentPosition);

      // Set the jiggle animation if the position movement is coming from dragging the header and the pin drop state
      // has changed.
      if (!this.#pinned && this.#dragHeader && currentInPinDropRect !== this.#inPinDropRect)
      {
         el.style.animation = this.#inPinDropRect ? 'tql-jiggle 0.3s infinite' : '';
      }

      el.style.top = `${currentPosition.top}px`;
      el.style.left = `${currentPosition.left}px`;
      el.style.width = `${currentPosition.width}px`;

      // Only set height if resizable.
      if (this.#windowResizable) { el.style.height = `${currentPosition.height}px`; }

      // Note: the root position is saved to `settings.questTrackerPosition` in QuestTrackerShell when any
      // height position changes are made to handle when #windowResizable is false / height is set to `auto`.

      // top / left position changes need to be saved here.
      if (initialTop !== currentPosition.top || initialLeft !== currentPosition.left)
      {
         s_SAVE_POSITION(currentPosition);
      }

      return currentPosition;
   }

   onPluginLoad(ev)
   {
      this._eventbus = ev.eventbus;

      ev.eventbus.on(`tql:settings:change:${settings.questTrackerResizable}`, this.#handleSettingWindowResize, this);
   }
}

/**
 * Provides a debounced function to save position to {@link TQLSettings.questTrackerPosition}.
 *
 * @type {(function(object): void)}
 */
const s_SAVE_POSITION = foundry.utils.debounce((currentPosition) =>
{
   game.settings.set(constants.moduleName, settings.questTrackerPosition, JSON.stringify(currentPosition));
}, 1000);