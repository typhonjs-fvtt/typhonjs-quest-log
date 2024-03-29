import { HandlebarsApplication } from '@typhonjs-fvtt/runtime/svelte/application/legacy';
import { TJSContextMenu }        from '@typhonjs-fvtt/svelte-standard/application';

import createMenuItems           from './createMenuItems.js';
import HandlerLog                from './HandlerLog.js';
import PositionValidator         from './PositionValidator.js';

import { constants, jquery, questStatusI18n, settings } from '#constants';

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
export default class QuestLog extends HandlebarsApplication
{
   /**
    * @inheritDoc
    * @see https://foundryvtt.com/api/Application.html
    */
   constructor(options = {})
   {
      super(options);

      this.position.validators.add(PositionValidator.checkPosition.bind(PositionValidator));
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

      html.on('contextmenu', '.tab:not([data-tab="active"]) .drag-quest', (event) =>
      {
         const questId = $(event.target).closest('.drag-quest')?.data('quest-id');
         const quest = this._eventbus.triggerSync('tql:questdb:quest:get', questId);

         if (quest)
         {
            TJSContextMenu.create({
               duration: 200,
               id: 'tjs-quest-menu',
               x: event.pageX,
               y: event.pageY,
               items: createMenuItems({ questId, name: quest.name, eventbus: this._eventbus, activeTab: false })
            });
         }
      });

      html.on('contextmenu', '.tab[data-tab="active"] .drag-quest', (event) =>
      {
         const questId = $(event.target).closest('.drag-quest')?.data('quest-id');
         const quest = this._eventbus.triggerSync('tql:questdb:quest:get', questId);

         if (quest)
         {
            TJSContextMenu.create({
               duration: 200,
               id: 'tjs-quest-menu',
               x: event.pageX,
               y: event.pageY,
               items: createMenuItems({ questId, name: quest.name, eventbus: this._eventbus, activeTab: true })
            });
         }
      });
   }

   /**
    * Handle closing any confirm delete quest dialog attached to QuestLog.
    *
    * @override
    * @inheritDoc
    */
   async close(options)
   {
      return super.close(options);
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

   onPluginLoad(ev)
   {
      this._eventbus = ev.eventbus;
   }
}
