import { SvelteApplication }     from '@typhonjs-fvtt/runtime/svelte/application';

import createHeaderButtons       from './createHeaderButtons.js';
import PositionValidator         from './PositionValidator.js';
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
    * @inheritDoc
    * @see https://foundryvtt.com/api/Application.html
    */
   constructor(options = {})
   {
      super({ pinned: game.settings.get(constants.moduleName, settings.questTrackerPinned), ...options });

      try
      {
         /**
          * Stores the current position of the quest tracker.
          *
          * @type {object}
          * {@link Application.position}
          */
         this.position = JSON.parse(game.settings.get(constants.moduleName, settings.questTrackerPosition));
      }
      catch (err)
      {
         this.position = s_DEFAULT_POSITION;
      }

      this.position.validators.add(PositionValidator.checkPosition.bind(PositionValidator));

      PositionValidator.init(this);
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
         positionOrtho: false,
         transformOrigin: null,

         svelte: {
            class: QuestTrackerShell,
            intro: true,
            target: document.body
         }
      });
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
      if (!this.reactive.resizable) { this.position.height = 'auto'; }
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
    * Handles showing / hiding the resize element.
    *
    * @param {boolean}  resizable - Current value of {@link TQLSettings.questTrackerResizable}.
    */
   #handleSettingWindowResize(resizable)
   {
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

         // Set height to null. This will cause height to be set to current offset extent.
         this.position.height = null;
      }
      else
      {
         // Set height to auto. This will cause QuestTrackerShell to save the new position.
         this.position.height = 'auto';
      }

      this.reactive.resizable = resizable;
   }

   /**
    * Defines all {@link JQuery} control callbacks with event listeners for click, drag, drop via various CSS selectors.
    *
    * @see https://foundryvtt.com/api/FormApplication.html#activateListeners
    */
   onSvelteMount()
   {
      this.#handleSettingWindowResize(game.settings.get(constants.moduleName, settings.questTrackerResizable));

      PositionValidator.updateTracker();
   }

   onPluginLoad(ev)
   {
      this._eventbus = ev.eventbus;

      ev.eventbus.on(`tjs:system:game:settings:change:${settings.questTrackerResizable}`,
       this.#handleSettingWindowResize, this);
   }
}