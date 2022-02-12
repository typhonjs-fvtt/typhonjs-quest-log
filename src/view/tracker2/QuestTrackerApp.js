import { SvelteApplication }     from '@typhonjs-fvtt/runtime/svelte/application';

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

      // Subscribe to dragging state changes.
      this.reactive.storeUIOptions.dragging.subscribe(this.#handleDraggingState.bind(this));
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
         resizable: game.settings.get(constants.moduleName, settings.questTrackerResizable),
         minimizable: false,
         popOut: false,
         width: 300,
         height: game.settings.get(constants.moduleName, settings.questTrackerResizable) ? 'auto' : 480,
         title: game.i18n.localize('TyphonJSQuestLog.QuestTracker.Title'),
         headerButtonNoLabel: true,
         svelte: {
            class: QuestTrackerShell,
            intro: true,
            target: document.body
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
    * Override default Application `bringToTop` to stop adjustment of z-index and set height to auto if not resizable.
    *
    * @override
    * @inheritDoc
    * @see https://foundryvtt.com/api/Application.html#bringToTop
    */
   bringToTop()
   {
      if (!this.reactive.resizable) { this.elementTarget.style.height = 'auto'; }
   }

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
      return [...createHeaderButtons(this._eventbus), ...super._getHeaderButtons()];
   }

   /**
    * Handles setting {@link TQLSettings.questTrackerPinned} based on current dragging state.
    *
    * @param {boolean}   dragging - Current dragging state.
    */
   async #handleDraggingState(dragging)
   {
      if (dragging)
      {
         this.#dragHeader = true;
         this.#pinned = false;

         // Only set `setting.questTrackerPinned` to false if it is currently true.
         if (game.settings.get(constants.moduleName, settings.questTrackerPinned))
         {
            await game.settings.set(constants.moduleName, settings.questTrackerPinned, false);
         }
      }
      else
      {
         this.#dragHeader = false;

         if (this.#inPinDropRect)
         {
            this.#pinned = true;
            await game.settings.set(constants.moduleName, settings.questTrackerPinned, true);
            this.elementTarget.style.animation = '';
         }
      }
   }

   /**
    * Handles showing / hiding the resize element.
    *
    * @param {boolean}  resizable - Current value of {@link TQLSettings.questTrackerResizable}.
    */
   #handleSettingWindowResize(resizable)
   {
      // Early out if there is no root element; resize setting can be set when there is no quest tracker rendered.
      if (this.elementTarget === null || this.elementTarget === void 0) { return; }

      const elementTarget = this.elementTarget;

      if (resizable)
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

         elementTarget.style.minHeight = this.#appExtents.minHeight;

         // Set height to null. This will cause setPosition to set the height style.
         elementTarget.style.height = null;

         this.setPosition(this.position);
      }
      else
      {
         const elemWindowHeader = elementTarget.querySelector('#quest-tracker .window-header');

         elementTarget.style.minHeight = elemWindowHeader.scrollHeight;

         // Set height to auto. This will cause QuestTrackerShell to save the new position.
         elementTarget.style.height = 'auto';
      }

      this.reactive.resizable = resizable;
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
    * Some game systems and custom UI theming modules provide hard overrides on overflow-x / overflow-y styles. Alas we
    * need to set these for '.window-content' to 'visible' which will cause an issue for very long tables. Thus we must
    * manually set the table max-heights based on the position / height of the {@link Application}.
    *
    * @param {object}               [position] - Optional parameters.
    *
    * @param {number|null}          [position.left] - The left offset position in pixels.
    *
    * @param {number|null}          [position.top] - The top offset position in pixels.
    *
    * @param {number|null}          [position.width] - The application width in pixels.
    *
    * @param {number|string|null}   [position.height] - The application height in pixels.
    *
    * @param {number|null}          [position.scale] - The application scale as a numeric factor where 1.0 is default.
    *
    * @param {boolean}              [position.override] - Forces any manual pinned setting to take effect.
    *
    * @param {boolean}              [position.pinned] - Sets the pinned state.
    *
    * @returns {{left: number, top: number, width: number, height: number, scale:number}}
    * The updated position object for the application containing the new values.
    */
   setPosition(position = {})
   {
      const { override, pinned = this.#pinned } = position;

      // Potentially force override any pinned state. This is done from TQLHooks.openQuestTracker.
      if (typeof override === 'boolean')
      {
         if (pinned)
         {
            this.#pinned = true;
            this.#inPinDropRect = true;
            game.settings.set(constants.moduleName, settings.questTrackerPinned, true);
            this._eventbus.trigger('tql:foundryuimanager:update:tracker');
            return position; // Early out as updateTracker above calls setPosition again.
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
         if (typeof position.left === 'number') { position.left = this.position.left; }
         if (typeof position.top === 'number') { position.top = this.position.top; }
         if (typeof position.width === 'number') { position.width = this.position.width; }
      }

      // SvelteApplication provides a customized setPosition which works with popOut / non-popOut apps.
      const currentPosition = super.setPosition(position, { apply: false });

      // Pin width / height to min / max styles if defined.
      if (currentPosition.width < this.#appExtents.minWidth) { currentPosition.width = this.#appExtents.minWidth; }
      if (currentPosition.width > this.#appExtents.maxWidth) { currentPosition.width = this.#appExtents.maxWidth; }
      if (currentPosition.height < this.#appExtents.minHeight) { currentPosition.height = this.#appExtents.minHeight; }
      if (currentPosition.height > this.#appExtents.maxHeight) { currentPosition.height = this.#appExtents.maxHeight; }

      const el = this.elementTarget;

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
      if (this.reactive.resizable) { el.style.height = `${currentPosition.height}px`; }

      // Note: the root position is saved to `settings.questTrackerPosition` in QuestTrackerShell when any
      // height position changes are made to handle when `this.options.resizable` is false; height is set to `auto`.

      this.position.set(currentPosition);

      // Any position changes need to be saved here when there are actual changes.
      if (initialTop !== currentPosition.top || initialLeft !== currentPosition.left || initialWidth !== currentPosition.width || initialHeight !== currentPosition.height)
      {
         s_SAVE_POSITION(currentPosition);
      }

      return currentPosition;
   }

   onPluginLoad(ev)
   {
      this._eventbus = ev.eventbus;

      ev.eventbus.on(`tjs:system:game:settings:change:${settings.questTrackerResizable}`,
       this.#handleSettingWindowResize, this);
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