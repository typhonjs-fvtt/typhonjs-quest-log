import TQLContextMenu   from '../TQLContextMenu.js';
import TQLDialog        from '../TQLDialog.js';

import HandlerLog       from './HandlerLog.js';

import { constants, jquery, questStatusI18n, questTabIndex, settings } from '#constants';

/**
 * Provides the main quest log app which shows the quests separated by status either with bookmark or classic tabs.
 *
 * In {@link QuestLog.getData} the {@link QuestsCollect} data is retrieved from {@link QuestDB.sortCollect} which
 * provides automatic sorting of each quest status category by either {@link SortFunctions.ALPHA} or
 * {@link SortFunctions.DATE_END} for status categories {@link questStatus.completed} and {@link questStatus.failed}.
 * Several module settings and whether the current user is a GM is also passed back as data to be used in rendering the
 * {@link Handlebars} template.
 *
 * {@link JQuery} control callbacks are setup in {@link QuestLog.activateListeners} and are located in a separate static
 * control class {@link HandlerLog}.
 */
export default class QuestLog extends Application
{
   /**
    * @inheritDoc
    * @see https://foundryvtt.com/api/Application.html
    */
   constructor(options = {})
   {
      super(options);
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
         id: constants.moduleName,
         classes: [constants.moduleName],
         template: 'modules/typhonjs-quest-log/templates/quest-log.html',
         width: 700,
         height: 480,
         minimizable: true,
         resizable: true,
         title: game.i18n.localize('TyphonJSQuestLog.QuestLog.Title'),
         tabs: [{ navSelector: '.log-tabs', contentSelector: '.log-body', initial: 'active' }]
      });
   }

   /**
    * Defines all jQuery control callbacks with event listeners for click, drag, drop via various CSS selectors.
    *
    * @param {JQuery}  html - The jQuery instance for the window content of this Application.
    *
    * @see https://foundryvtt.com/api/FormApplication.html#activateListeners
    */
   activateListeners(html)
   {
      super.activateListeners(html);

      // Here we use a bit of jQuery to retrieve the background image of .window-content to match the game system
      // background image for the bookmark tabs. This is only done if the module setting is checked which it is by
      // default and the background image actually exists. The fallback is the default parchment image set in the
      // TQL styles.
      const navStyle = game.settings.get(constants.moduleName, settings.navStyle);
      const dynamicBackground = game.settings.get(constants.moduleName, settings.dynamicBookmarkBackground);
      if ('bookmarks' === navStyle && dynamicBackground)
      {
         const windowContent = $('#typhonjs-quest-log .window-content');
         const tqlBookmarkItem = $('#typhonjs-quest-log .item');

         const backImage = windowContent.css('background-image');
         const backBlendMode = windowContent.css('background-blend-mode');
         const backColor = windowContent.css('background-color');

         tqlBookmarkItem.css('background-image', backImage);
         tqlBookmarkItem.css('background-color', backColor);
         tqlBookmarkItem.css('background-blend-mode', backBlendMode);
      }

      const eventbus = this._eventbus;

      html.on(jquery.click, '.new-quest-btn', () => HandlerLog.questAdd(eventbus));

      html.on(jquery.click, '.actions.quest-status i.delete', (event) => HandlerLog.questDelete(event, eventbus));

      // This registers for any element and prevents the circle / slash icon displaying for not being a drag target.
      html.on(jquery.dragenter, (event) => event.preventDefault());

      html.on(jquery.dragstart, '.drag-quest', void 0, HandlerLog.questDragStart);

      html.on(jquery.click, '.title', void 0, (event) => HandlerLog.questOpen(event, eventbus));

      html.on(jquery.click, '.actions.quest-status i.move', (event) => HandlerLog.questStatusSet(event, eventbus));

      this._contextMenu(html);
   }

   /**
    * Handle closing any confirm delete quest dialog attached to QuestLog.
    *
    * @override
    * @inheritDoc
    */
   async close(options)
   {
      TQLDialog.closeDialogs({ isQuestLog: true });
      return super.close(options);
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
            const questId = $(menu)?.closest('.drag-quest')?.data('quest-id');
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
      const menuItemsOther = [menuItemCopyLink];

      /**
       * @type {object[]}
       */
      const menuItemsActive = [menuItemCopyLink];

      if (game.user.isGM)
      {
         const menuItemQuestID = {
            name: 'TyphonJSQuestLog.QuestLog.ContextMenu.CopyQuestID',
            icon: '<i class="fas fa-key"></i>',
            callback: (menu) =>
            {
               const questId = $(menu)?.closest('.drag-quest')?.data('quest-id');
               const quest = this._eventbus.triggerSync('tql:questdb:quest:get', questId);

               const success = this._eventbus.triggerSync('tql:utils:copy:text:to:clipboard', quest.id);

               if (quest && success)
               {
                  ui.notifications.info(game.i18n.format('TyphonJSQuestLog.Notifications.QuestIDCopied'));
               }
            }
         };

         menuItemsActive.push(menuItemQuestID);
         menuItemsOther.push(menuItemQuestID);

         menuItemsActive.push({
            name: 'TyphonJSQuestLog.QuestLog.ContextMenu.PrimaryQuest',
            icon: '<i class="fas fa-star"></i>',
            callback: (menu) =>
            {
               const questId = $(menu)?.closest('.drag-quest')?.data('quest-id');
               const quest = this._eventbus.triggerSync('tql:questdb:quest:get', questId);
               if (quest)
               {
                  this._eventbus.trigger('tql:socket:set:quest:primary', { quest });
               }
            }
         });
      }

      // Must show two different context menus as only the active / in progress tab potentially has the menu option to
      // allow the GM to set the primary quest.
      new TQLContextMenu(html, '.tab:not([data-tab="active"]) .drag-quest', menuItemsOther);
      new TQLContextMenu(html, '.tab[data-tab="active"] .drag-quest', menuItemsActive);
   }

   /**
    * Retrieves the sorted quest collection from the {@link QuestDB.sortCollect} and sets several state parameters for
    * GM / player / trusted player edit along with several module settings: {@link TQLSettings.allowPlayersAccept},
    * {@link TQLSettings.allowPlayersCreate}, {@link TQLSettings.showTasks} and {@link TQLSettings.navStyle}.
    *
    * @override
    * @inheritDoc
    * @see https://foundryvtt.com/api/FormApplication.html#getData
    */
   async getData(options = {})
   {
      return foundry.utils.mergeObject(super.getData(), {
         options,
         isGM: game.user.isGM,
         isPlayer: !game.user.isGM,
         isTrustedPlayerEdit: this._eventbus.triggerSync('tql:utils:is:trusted:player:edit'),
         canAccept: game.settings.get(constants.moduleName, settings.allowPlayersAccept),
         canCreate: game.settings.get(constants.moduleName, settings.allowPlayersCreate),
         showTasks: game.settings.get(constants.moduleName, settings.showTasks),
         style: game.settings.get(constants.moduleName, settings.navStyle),
         questStatusI18n,
         quests: this._eventbus.triggerSync('tql:questdb:collect:sort')
      });
   }

   /**
    * Some game systems and custom UI theming modules provide hard overrides on overflow-x / overflow-y styles. Alas we
    * need to set these for '.window-content' to 'visible' which will cause an issue for very long tables. Thus we must
    * manually set the table max-heights based on the position / height of the {@link Application}.
    *
    * @param {object}               opts - Optional parameters.
    *
    * @param {number|null}          opts.left - The left offset position in pixels.
    *
    * @param {number|null}          opts.top - The top offset position in pixels.
    *
    * @param {number|null}          opts.width - The application width in pixels.
    *
    * @param {number|string|null}   opts.height - The application height in pixels.
    *
    * @param {number|null}          opts.scale - The application scale as a numeric factor where 1.0 is default.
    *
    * @returns {{left: number, top: number, width: number, height: number, scale:number}}
    * The updated position object for the application containing the new values.
    */
   setPosition(opts)
   {
      const currentPosition = super.setPosition(opts);

      // Retrieve all the table elements.
      const tableElements = $('#typhonjs-quest-log .table');

      // Retrieve the active table.
      const tabIndex = questTabIndex[this?._tabs[0]?.active];
      const table = tableElements[tabIndex];

      if (table)
      {
         const tqlPosition = $('#typhonjs-quest-log')[0].getBoundingClientRect();
         const tablePosition = table.getBoundingClientRect();

         // Manually calculate the max height for the table based on the position of the main window div and table.
         tableElements.css('max-height', `${currentPosition.height - (tablePosition.top - tqlPosition.top + 16)}px`);
      }

      return currentPosition;
   }

   onPluginLoad(ev)
   {
      this._eventbus = ev.eventbus;
   }
}
