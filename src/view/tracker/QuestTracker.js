import HandlerTracker   from './HandlerTracker.js';
import TQLContextMenu   from '../TQLContextMenu.js';
import collect          from '../../npm/collect.js';

import { constants, jquery, questStatus, sessionConstants, settings } from '#constants';

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

/**
 * Provides the quest tracker which provides an overview of active quests and objectives which can be opened / closed
 * to show all objectives for a given quest. The folder / open state is stored in {@link sessionStorage}.
 *
 * In the {@link QuestTracker.getData} method {@link QuestTracker.prepareQuests} is invoked which gets all sorted
 * {@link questStatus.active} via {@link QuestDB.sortCollect}. They are then mapped creating the specific data which is
 * used in the {@link Handlebars} template. In the future this may be cached in a similar way that {@link Quest} data
 * is cached for {@link QuestLog}.
 */
export default class QuestTracker extends Application
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
   }

   /**
    * Default {@link Application} options
    *
    * @returns {object} options - Application options.
    * @see https://foundryvtt.com/api/Application.html#options
    */
   static get defaultOptions()
   {
      return foundry.utils.mergeObject(super.defaultOptions, {
         id: 'quest-tracker',
         template: 'modules/typhonjs-quest-log/templates/quest-tracker.html',
         minimizable: false,
         resizable: true,
         popOut: false,
         width: 300,
         height: 480,
         title: game.i18n.localize('TyphonJSQuestLog.QuestTracker.Title')
      });
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

      const primaryState = this._eventbus.triggerSync('tql:storage:session:item:get',
       sessionConstants.trackerShowPrimary);

      const primaryIcon = primaryState ? 'fas fa-star' : 'far fa-star';
      const primaryTitle = primaryState ? 'TyphonJSQuestLog.QuestTracker.Tooltips.PrimaryQuestUnshow' :
       'TyphonJSQuestLog.QuestTracker.Tooltips.PrimaryQuestShow';

      buttons.unshift({
         title: primaryTitle,
         class: 'show-primary',
         icon: primaryIcon
      });

      return buttons;
   }

   /**
    * Gets the minimum width of this Application.
    *
    * @returns {number} Minimum width.
    */
   get minWidth() { return this._appExtents.minWidth || 275; }

   /**
    * Is the QuestTracker pinned to the sidebar.
    *
    * @returns {boolean} QuestTracker pinned.
    */
   get pinned() { return this._pinned; }

   /**
    * Defines all {@link JQuery} control callbacks with event listeners for click, drag, drop via various CSS selectors.
    *
    * @param {JQuery}  html - The jQuery instance for the window content of this Application.
    *
    * @see https://foundryvtt.com/api/FormApplication.html#activateListeners
    */
   activateListeners(html)
   {
      super.activateListeners(html);

      const eventbus = this._eventbus;

      // Make the window draggable
      const header = html.find('header');
      new Draggable(this, html, header[0], this.options.resizable);

      header[0].addEventListener('pointerdown', async (event) =>
       HandlerTracker.headerPointerDown(event, header[0], this));

      header[0].addEventListener('pointerup', async (event) =>
       HandlerTracker.headerPointerUp(event, eventbus, header[0], this));

      html.on(jquery.click, '.header-button.close', void 0, this.close);

      html.on(jquery.click, '.header-button.show-primary i', void 0,
       () => HandlerTracker.questPrimaryShow(this, eventbus));

      // Add context menu.
      this._contextMenu(html);

      this._eventbus.trigger('tql:utils:jquery:dblclick:create', {
         selector: '#quest-tracker .quest-tracker-header',
         singleCallback: (event) => HandlerTracker.questClick(event, eventbus, this),
         doubleCallback: (event) => HandlerTracker.questOpen(event, eventbus),
      });

      html.on(jquery.click, '.quest-tracker-link', void 0, (event) => HandlerTracker.questOpen(event, eventbus));

      html.on(jquery.click, '.quest-tracker-task', void 0, async (event) =>
       await HandlerTracker.questTaskToggle(event, eventbus));

      /**
       * @type {JQuery} The window header element.
       *
       * @private
       */
      this._elemWindowHeader = $('#quest-tracker .window-header');

      /**
       * @type {JQuery} The window content element.
       *
       * @private
       */
      this._elemWindowContent = $('#quest-tracker .window-content');

      /**
       * @type {JQuery} The window resize handle.
       *
       * @private
       */
      this._elemResizeHandle = $('#quest-tracker .window-resizable-handle');

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

      /**
       * Stores the state of {@link TQLSettings.questTrackerResizable}.
       *
       * @type {boolean}
       * @private
       */
      this._windowResizable = game.settings.get(constants.moduleName, settings.questTrackerResizable);

      if (this._windowResizable)
      {
         this._elemResizeHandle.show();
         this.element.css('min-height', this._appExtents.minHeight);
      }
      else
      {
         this._elemResizeHandle.hide();
         this.element.css('min-height', this._elemWindowHeader[0].scrollHeight);

         // A bit of a hack. We need to call the Application setPosition now to make sure the element parameters
         // are correctly set as the exact height for the element is calculated in this.setPosition which is called
         // by Application right after this method completes.
         // Must set popOut temporarily to true as there is a gate in `Application.setPosition`.
         this.options.popOut = true;
         super.setPosition(this.position);
         this.options.popOut = false;
      }

      /**
       * Stores whether the scroll bar is active.
       *
       * @type {boolean}
       *
       * @private
       */
      this._scrollbarActive = this._elemWindowContent[0].scrollHeight > this._elemWindowContent[0].clientHeight;

      // Set current scrollbar active state and potentially set 'point-events' to 'auto'.
      if (this._scrollbarActive) { this.element.css('pointer-events', 'auto'); }
   }

   /**
    * Override default Application `bringToTop` to stop adjustment of z-index.
    *
    * @override
    * @inheritDoc
    * @see https://foundryvtt.com/api/Application.html#bringToTop
    */
   bringToTop() {}

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
    * Parses quest data in {@link QuestTracker.prepareQuests}.
    *
    * @override
    * @inheritDoc
    * @see https://foundryvtt.com/api/FormApplication.html#getData
    */
   async getData(options = {})
   {
      const showOnlyPrimary = this._eventbus.triggerSync('tql:storage:session:item:get',
       sessionConstants.trackerShowPrimary);

      const primaryQuest = this._eventbus.triggerSync('tql:questdb:quest:entry:get',
       game.settings.get(constants.moduleName, settings.primaryQuest));

      // Stores the primary quest ID when all in progress quests are shown so that the star icon is drawn for the
      // primary quest.
      const primaryQuestId = !showOnlyPrimary && primaryQuest ? primaryQuest.id : '';

      const quests = await this.prepareQuests(showOnlyPrimary, primaryQuest);

      return foundry.utils.mergeObject(super.getData(options), {
         title: this.options.title,
         headerButtons: this._getHeaderButtons(),
         hasQuests: quests.count() > 0,
         primaryQuestId,
         quests
      });
   }

   /**
    * Transforms the quest data from sorted active quests. In this case we need to determine which quests can be
    * manipulated for trusted player edit.
    *
    * @param {boolean}           showOnlyPrimary - Shows only the primary quest.
    *
    * @param {QuestEntry|void}   primaryQuest - Any currently set primary quest.
    *
    * @returns {Promise<Collection<object>>} Sorted active quests.
    */
   async prepareQuests(showOnlyPrimary, primaryQuest)
   {
      /**
       * If showOnlyPrimary and the primaryQuest exists then build a Collection with just the primary quest otherwise
       * get all sorted in progress quests from the QuestDB.
       *
       * @type {Collection}
       */
      const questEntries = showOnlyPrimary ? collect(primaryQuest ? [primaryQuest] : []) :
       this._eventbus.triggerSync('tql:questdb:collect:sort', { status: questStatus.active });

      const isGM = game.user.isGM;

      const isTrustedPlayerEdit = this._eventbus.triggerSync('tql:utils:is:trusted:player:edit');

      return questEntries.transform((entry) =>
      {
         const q = entry.enrich;

         const opened = this._eventbus.triggerSync('tql:storage:session:item:get',
          `${sessionConstants.trackerFolderState}${q.id}`);

         const tasks = opened ? q.data_tasks : [];
         const subquests = opened ? q.data_subquest : [];

         return {
            id: q.id,
            canEdit: isGM || (entry.isOwner && isTrustedPlayerEdit),
            playerEdit: entry.isOwner,
            source: q.giver,
            name: q.name,
            isGM,
            isHidden: q.isHidden,
            isInactive: q.isInactive,
            isPersonal: q.isPersonal,
            personalActors: q.personalActors,
            hasObjectives: q.hasObjectives,
            subquests,
            tasks
         };
      });
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
      this.options.popOut = true;
      const currentPosition = super.setPosition(opts);
      this.options.popOut = false;

      if (!this._windowResizable)
      {
         // Add the extra `2` for small format (1080P and below screen size).
         currentPosition.height = this._elemWindowHeader[0].scrollHeight + this._elemWindowContent[0].scrollHeight + 2;
      }

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
      el.style.height = `${currentPosition.height}px`;

      const scrollbarActive = this._elemWindowContent[0].scrollHeight > this._elemWindowContent[0].clientHeight;

      if (scrollbarActive !== this._scrollbarActive)
      {
         this._scrollbarActive = scrollbarActive;
         this.element.css('pointer-events', scrollbarActive ? 'auto' : 'none');
      }

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