// import {
//    ApplicationShell,
//    SvelteApplication }        from '@typhonjs-fvtt/svelte';

import AppShell               from './AppShell.svelte';
import SvelteApplication      from '../svelte/SvelteApplication.js';

import QuestTracker           from './QuestTracker.svelte';

import HandlerTracker         from '../tracker/HandlerTracker.js';

import TQLContextMenu         from '../TQLContextMenu.js';

import ButtonShowPrimary      from './ButtonShowPrimary.js';

import { constants, settings } from '#constants';

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

      /**
       * Stores whether the header is being dragged.
       *
       * @type {boolean}
       * @package
       */
      this._dragHeader = false;

      /**
       * Stores whether the QuestTracker is pinned to the sidebar.
       *
       * @type {boolean}
       * @package
       */
      this._pinned = game.settings.get(constants.moduleName, settings.questTrackerPinned);

      /**
       * Stores whether the current position is in the sidebar pin drop rectangle.
       *
       * @type {boolean}
       * @package
       */
      this._inPinDropRect = false;

      this._windowResizable = game.settings.get(constants.moduleName, settings.questTrackerResizable);
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
         svelte: {
            class: AppShell,
            children: { class: QuestTracker },
            options: { injectApp: true, injectEventbus: true },
         }
      });
   }

   /**
    * Sets `questTrackerEnable` to false.
    *
    * @param {object}   [options] - Optional parameters.
    *
    * @param {boolean}  [options.updateSetting=true] - If true then {@link settings.questTrackerEnable} is set to false.
    *
    * @returns {Promise<void>}
    */
   async close({ updateSetting = true } = {})
   {
      await super.close();

      if (updateSetting)
      {
         await game.settings.set(constants.moduleName, settings.questTrackerEnable, false);
      }
   }

   /**
    * Create the context menu. There are two separate context menus for the active / in progress tab and all other tabs.
    *
    * @param {JQuery}   html - JQuery element for this application.
    *
    * @private
    */
   _contextMenu(html)
   {
      const menuItemCopyLink = {
         name: 'TyphonJSQuestLog.QuestLog.ContextMenu.CopyEntityLink',
         icon: '<i class="fas fa-link"></i>',
         callback: (menu) =>
         {
            const questId = $(menu)?.closest('.quest-tracker-header')?.data('quest-id');
            const quest = this._eventbus.triggerSync('tql:questdb:quest:get', questId);

            const success = this._eventbus.triggerSync('tql:utils:copy:text:to:clipboard',
             `@Quest[${quest.id}]{${quest.name}}`);

            if (quest && success)
            {
               ui.notifications.info(game.i18n.format('TyphonJSQuestLog.Notifications.LinkCopied'));
            }
         }
      };

      /**
       * @type {object[]}
       */
      const menuItems = [menuItemCopyLink];

      if (game.user.isGM)
      {
         menuItems.push({
            name: 'TyphonJSQuestLog.QuestLog.ContextMenu.CopyQuestID',
            icon: '<i class="fas fa-key"></i>',
            callback: (menu) =>
            {
               const questId = $(menu)?.closest('.quest-tracker-header')?.data('quest-id');
               const quest = this._eventbus.triggerSync('tql:questdb:quest:get', questId);

               const success = this._eventbus.triggerSync('tql:utils:copy:text:to:clipboard', quest.id);

               if (quest && success)
               {
                  ui.notifications.info(game.i18n.format('TyphonJSQuestLog.Notifications.QuestIDCopied'));
               }
            }
         });

         menuItems.push({
            name: 'TyphonJSQuestLog.QuestLog.ContextMenu.PrimaryQuest',
            icon: '<i class="fas fa-star"></i>',
            callback: (menu) =>
            {
               const questId = $(menu)?.closest('.quest-tracker-header')?.data('quest-id');
               const quest = this._eventbus.triggerSync('tql:questdb:quest:get', questId);

               if (quest) { this._eventbus.trigger('tql:socket:set:quest:primary', { quest }); }
            }
         });
      }

      new TQLContextMenu(html, '.quest-tracker-header', menuItems);
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

      const eventbus = this._eventbus.triggerSync('tql:eventbus:secure:get');

      buttons.unshift(new ButtonShowPrimary(eventbus));

      return buttons;
   }

   // Handles showing / hiding
   _handleSettingWindowResize(value)
   {
      /**
       * Stores the state of {@link TQLSettings.questTrackerResizable}.
       *
       * @type {boolean}
       * @private
       */
      this._windowResizable = value;

      // Early out if there is no root element.
      if (this.element === null || this.element === void 0 || this.element[0] === void 0) { return; }

      const elemResizeHandle = $('#quest-tracker .window-resizable-handle');

      if (this._windowResizable)
      {
         elemResizeHandle.show();
         this.element.css('min-height', this._appExtents.minHeight);
      }
      else
      {
         const elemWindowHeader = $('#quest-tracker .window-header');

         elemResizeHandle.hide();
         this.element.css('min-height', elemWindowHeader[0].scrollHeight);
         this.element[0].style.height = 'auto';
      }
   }

   /**
    * Defines all {@link JQuery} control callbacks with event listeners for click, drag, drop via various CSS selectors.
    *
    * @param {JQuery}  element - The jQuery instance for the window content of this Application.
    *
    * @see https://foundryvtt.com/api/FormApplication.html#activateListeners
    */
   onSvelteMount(element)
   {
      super.onSvelteMount(element);

      const eventbus = this._eventbus;

      // Make the window draggable
      const header = element.find('header');
      new Draggable(this, element, header[0], this.options.resizable);

      header[0].addEventListener('pointerdown', async (event) =>
       HandlerTracker.headerPointerDown(event, header[0], this));

      header[0].addEventListener('pointerup', async (event) =>
       HandlerTracker.headerPointerUp(event, eventbus, header[0], this));

      // Add context menu.
      this._contextMenu(element);

      /**
       * Stores the app / window extents from styles.
       *
       * @type {{minHeight: number, maxHeight: number, minWidth: number, maxWidth: number}}
       *
       * @private
       */
      this._appExtents = {
         minWidth: parseInt(this.element.css('min-width')),
         maxWidth: parseInt(this.element.css('max-width')),
         minHeight: parseInt(this.element.css('min-height')),
         maxHeight: parseInt(this.element.css('max-height'))
      };

      // this._windowResizable = game.settings.get(constants.moduleName, settings.questTrackerResizable);
      this._handleSettingWindowResize(game.settings.get(constants.moduleName, settings.questTrackerResizable));
   }

   /**
    * Override default Application `bringToTop` to stop adjustment of z-index.
    *
    * @override
    * @inheritDoc
    * @see https://foundryvtt.com/api/Application.html#bringToTop
    */
   bringToTop()
   {
      if (!this._windowResizable)
      {
         this.element[0].style.height = 'auto';
      }
   }

   superSetPosition({ left, top, width, height, scale } = {})
   {
      const el = this.element[0];
      const currentPosition = this.position;
      const styles = window.getComputedStyle(el);

      // Update width if an explicit value is passed, or if no width value is set on the element
      if (!el.style.width || width)
      {
         const tarW = width || el.offsetWidth;
         const minW = parseInt(styles.minWidth) || MIN_WINDOW_WIDTH;
         const maxW = el.style.maxWidth || window.innerWidth;
         currentPosition.width = width = Math.clamped(tarW, minW, maxW);
         el.style.width = `${width}px`;
         if ((width + currentPosition.left) > window.innerWidth) { left = currentPosition.left; }
      }
      width = el.offsetWidth;

      // Update height if an explicit value is passed, or if no height value is set on the element
      if (!el.style.height || height)
      {
         const tarH = height || (el.offsetHeight + 1);
         const minH = parseInt(styles.minHeight) || MIN_WINDOW_HEIGHT;
         const maxH = el.style.maxHeight || window.innerHeight;
         currentPosition.height = height = Math.clamped(tarH, minH, maxH);

         // MOD: Don't change height if not resizable!
         if (this._windowResizable)
         {
            el.style.height = `${height}px`;
         }

         if ((height + currentPosition.top) > window.innerHeight + 1) { top = currentPosition.top - 1; }
      }
      height = el.offsetHeight;

      // Update Left
      if ((!el.style.left) || Number.isFinite(left))
      {
         const tarL = Number.isFinite(left) ? left : (window.innerWidth - width) / 2;
         const maxL = Math.max(window.innerWidth - width, 0);
         currentPosition.left = left = Math.clamped(tarL, 0, maxL);
         el.style.left = `${left}px`;
      }

      // Update Top
      if ((!el.style.top) || Number.isFinite(top))
      {
         const tarT = Number.isFinite(top) ? top : (window.innerHeight - height) / 2;
         const maxT = Math.max(window.innerHeight - height, 0);
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
    * @param {boolean}              [opts.override] - Forces any manual pinned setting to take effect.
    *
    * @param {boolean}              [opts.pinned] - Sets the pinned state.
    *
    * @returns {{left: number, top: number, width: number, height: number, scale:number}}
    * The updated position object for the application containing the new values.
    */
   setPosition({ override, pinned = this._pinned, ...opts } = {})
   {
      // Potentially force override any pinned state. This is done from TQLHooks.openQuestTracker.
      if (typeof override === 'boolean')
      {
         if (pinned)
         {
            this._pinned = true;
            this._inPinDropRect = true;
            game.settings.set(constants.moduleName, settings.questTrackerPinned, true);
            this._eventbus.trigger('tql:foundryuimanager:update:tracker');
            return opts; // Early out as updateTracker above calls setPosition again.
         }
         else
         {
            this._pinned = false;
            this._inPinDropRect = false;
            game.settings.set(constants.moduleName, settings.questTrackerPinned, false);
         }
      }

      const initialWidth = this.position.width;
      const initialHeight = this.position.height;

      if (pinned)
      {
         if (typeof opts.left === 'number') { opts.left = this.position.left; }
         if (typeof opts.top === 'number') { opts.top = this.position.top; }
         if (typeof opts.width === 'number') { opts.width = this.position.width; }
      }

      // Must set popOut temporarily to true as there is a gate in `Application.setPosition`.
      const currentPosition = this.superSetPosition(opts);

      // Pin width / height to min / max styles if defined.
      if (currentPosition.width < this._appExtents.minWidth) { currentPosition.width = this._appExtents.minWidth; }
      if (currentPosition.width > this._appExtents.maxWidth) { currentPosition.width = this._appExtents.maxWidth; }
      if (currentPosition.height < this._appExtents.minHeight) { currentPosition.height = this._appExtents.minHeight; }
      if (currentPosition.height > this._appExtents.maxHeight) { currentPosition.height = this._appExtents.maxHeight; }

      const el = this.element[0];

      currentPosition.resizeWidth = initialWidth < currentPosition.width;
      currentPosition.resizeHeight = initialHeight < currentPosition.height;

      // Mutates `checkPosition` to set maximum left position. Must do this calculation after `super.setPosition`
      // as in some cases `super.setPosition` will override the changes of `FoundryUIManager.checkPosition`.
      const currentInPinDropRect = this._inPinDropRect;
      this._inPinDropRect = this._eventbus.triggerSync('tql:foundryuimanager:check:position', currentPosition);

      // Set the jiggle animation if the position movement is coming from dragging the header and the pin drop state
      // has changed.
      if (!this._pinned && this._dragHeader && currentInPinDropRect !== this._inPinDropRect)
      {
         this.element.css('animation', this._inPinDropRect ? 'tql-jiggle 0.3s infinite' : '');
      }

      el.style.top = `${currentPosition.top}px`;
      el.style.left = `${currentPosition.left}px`;
      el.style.width = `${currentPosition.width}px`;

      if (this._windowResizable)
      {
         el.style.height = `${currentPosition.height}px`;
      }

      // TODO: SWITCH TO DEBOUNCE
      if (currentPosition && currentPosition.width && currentPosition.height)
      {
         if (_timeoutPosition)
         {
            clearTimeout(_timeoutPosition);
         }

         _timeoutPosition = setTimeout(() =>
         {
            game.settings.set(constants.moduleName, settings.questTrackerPosition, JSON.stringify(currentPosition));
         }, s_TIMEOUT_POSITION);
      }

      return currentPosition;
   }

   onPluginLoad(ev)
   {
      this._eventbus = ev.eventbus;

      ev.eventbus.on(`tql:settings:change:${settings.questTrackerResizable}`, this._handleSettingWindowResize, this);
   }
}

/**
 * Defines the timeout length to gate saving position to settings.
 *
 * @type {number}
 */
const s_TIMEOUT_POSITION = 1000;

/**
 * Stores the last call to setTimeout for {@link QuestTracker.setPosition} changes, so that they can be cancelled as
 * new updates arrive gating the calls to saving position to settings.
 *
 * @type {number}
 * @private
 */
let _timeoutPosition = void 0;