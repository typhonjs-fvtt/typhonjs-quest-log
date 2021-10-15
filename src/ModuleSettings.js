import FoundryUIManager from './control/FoundryUIManager.js';
import QuestDB          from './control/QuestDB.js';
import Utils            from './control/Utils.js';
import ViewManager      from './control/ViewManager.js';

import { constants, noteControls, questStatus, sessionConstants, settings } from './model/constants.js';

/**
 * The default location for the QuestTracker
 *
 * @type {{top: number}}
 */
const s_QUEST_TRACKER_DEFAULT = { top: 80, width: 296 };

/**
 * Constants for setting scope type.
 *
 * @type {{world: string, client: string}}
 */
const scope = {
   client: 'client',
   world: 'world'
};

/**
 * Provides registration for all module settings.
 */
export default class ModuleSettings
{
   /**
    * Registers all module settings.
    *
    * @see {@link settings}
    */
   static register()
   {
      game.settings.register(constants.moduleName, settings.allowPlayersDrag, {
         name: 'TyphonJSQuestLog.Settings.allowPlayersDrag.Enable',
         hint: 'TyphonJSQuestLog.Settings.allowPlayersDrag.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean,
         onChange: (value) =>
         {
            // Swap macro image based on current state. No need to await.
            if (game.user.isGM) { Utils.setMacroImage(settings.allowPlayersDrag, value); }

            // Must enrich all quests again in QuestDB.
            QuestDB.enrichAll();

            // Render all views; immediately stops / enables player drag if Quest view is open.
            ViewManager.renderAll({ force: true, questPreview: true });
         }
      });

      game.settings.register(constants.moduleName, settings.allowPlayersCreate, {
         name: 'TyphonJSQuestLog.Settings.allowPlayersCreate.Enable',
         hint: 'TyphonJSQuestLog.Settings.allowPlayersCreate.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean,
         onChange: (value) =>
         {
            // Swap macro image based on current state. No need to await.
            if (game.user.isGM) { Utils.setMacroImage(settings.allowPlayersCreate, value); }

            // Render quest log to show / hide add quest button.
            if (ViewManager.questLog.rendered) { ViewManager.questLog.render(); }
         }
      });

      game.settings.register(constants.moduleName, settings.allowPlayersAccept, {
         name: 'TyphonJSQuestLog.Settings.allowPlayersAccept.Enable',
         hint: 'TyphonJSQuestLog.Settings.allowPlayersAccept.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean,
         onChange: (value) =>
         {
            // Swap macro image based on current state. No need to await.
            if (game.user.isGM) { Utils.setMacroImage(settings.allowPlayersAccept, value); }

            // Must enrich all quests again in QuestDB.
            QuestDB.enrichAll();

            // Render all views as quest status actions need to be shown or hidden for some players.
            ViewManager.renderAll({ questPreview: true });
         }
      });

      game.settings.register(constants.moduleName, settings.trustedPlayerEdit, {
         name: 'TyphonJSQuestLog.Settings.trustedPlayerEdit.Enable',
         hint: 'TyphonJSQuestLog.Settings.trustedPlayerEdit.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean,
         onChange: (value) =>
         {
            // Swap macro image based on current state. No need to await.
            if (game.user.isGM) { Utils.setMacroImage(settings.trustedPlayerEdit, value); }

            // Must perform a consistency check as there are possible quests that need to be added / removed
            // from the in-memory DB based on trusted player edit status.
            QuestDB.consistencyCheck();

            // Render all views as trusted player edit adds / removes capabilities.
            ViewManager.renderAll({ questPreview: true });
         }
      });

      game.settings.register(constants.moduleName, settings.countHidden, {
         name: 'TyphonJSQuestLog.Settings.countHidden.Enable',
         hint: 'TyphonJSQuestLog.Settings.countHidden.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean,
         onChange: (value) =>
         {
            // Swap macro image based on current state. No need to await.
            if (game.user.isGM) { Utils.setMacroImage(settings.countHidden, value); }

            // Must enrich all quests again in QuestDB.
            QuestDB.enrichAll();

            // Must render the quest log / floating quest log / quest tracker.
            ViewManager.renderAll();
         }
      });

      game.settings.register(constants.moduleName, settings.dynamicBookmarkBackground, {
         name: 'TyphonJSQuestLog.Settings.dynamicBookmarkBackground.Enable',
         hint: 'TyphonJSQuestLog.Settings.dynamicBookmarkBackground.EnableHint',
         scope: scope.world,
         config: true,
         default: true,
         type: Boolean,
         onChange: () =>
         {
            // Must render the quest log.
            if (ViewManager.questLog.rendered) { ViewManager.questLog.render(); }
         }
      });

      game.settings.register(constants.moduleName, settings.navStyle, {
         name: 'TyphonJSQuestLog.Settings.navStyle.Enable',
         hint: 'TyphonJSQuestLog.Settings.navStyle.EnableHint',
         scope: scope.client,
         config: true,
         default: 'bookmarks',
         type: String,
         choices: {
            bookmarks: 'TyphonJSQuestLog.Settings.navStyle.bookmarks',
            classic: 'TyphonJSQuestLog.Settings.navStyle.classic'
         },
         onChange: () =>
         {
            // Must enrich all quests again in QuestDB.
            QuestDB.enrichAll();

            // Must render the quest log.
            if (ViewManager.questLog.rendered) { ViewManager.questLog.render(); }
         }
      });

      game.settings.register(constants.moduleName, settings.showTasks, {
         name: 'TyphonJSQuestLog.Settings.showTasks.Enable',
         hint: 'TyphonJSQuestLog.Settings.showTasks.EnableHint',
         scope: scope.world,
         config: true,
         default: 'default',
         type: String,
         choices: {
            default: 'TyphonJSQuestLog.Settings.showTasks.default',
            onlyCurrent: 'TyphonJSQuestLog.Settings.showTasks.onlyCurrent',
            no: 'TyphonJSQuestLog.Settings.showTasks.no'
         },
         onChange: () =>
         {
            // Must enrich all quests again in QuestDB.
            QuestDB.enrichAll();

            // Must render the quest log.
            ViewManager.renderAll();
         }
      });

      game.settings.register(constants.moduleName, settings.defaultPermission, {
         name: 'TyphonJSQuestLog.Settings.defaultPermissionLevel.Enable',
         hint: 'TyphonJSQuestLog.Settings.defaultPermissionLevel.EnableHint',
         scope: scope.world,
         config: true,
         default: 'Observer',
         type: String,
         choices: {
            OBSERVER: 'TyphonJSQuestLog.Settings.defaultPermissionLevel.OBSERVER',
            NONE: 'TyphonJSQuestLog.Settings.defaultPermissionLevel.NONE',
            OWNER: 'TyphonJSQuestLog.Settings.defaultPermissionLevel.OWNER'
         }
      });

      game.settings.register(constants.moduleName, settings.hideTQLFromPlayers, {
         name: 'TyphonJSQuestLog.Settings.hideTQLFromPlayers.Enable',
         hint: 'TyphonJSQuestLog.Settings.hideTQLFromPlayers.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean,
         onChange: async(value) =>
         {
            // Swap macro image based on current state. No need to await.
            if (game.user.isGM) { Utils.setMacroImage(settings.hideTQLFromPlayers, value); }

            if (!game.user.isGM)
            {
               // Hide all TQL apps from non GM user and remove the ui.controls for TQL.
               if (value)
               {
                  ViewManager.closeAll({ questPreview: true, updateSetting: false });

                  const notes = ui?.controls?.controls.find((c) => c.name === 'notes');
                  if (notes) { notes.tools = notes?.tools.filter((c) => !c.name.startsWith(constants.moduleName)); }

                  // Remove all quests from in-memory DB. This is required so that users can not retrieve quests
                  // from the QuestAPI or content links in Foundry resolve when TQL is hidden.
                  QuestDB.removeAll();
               }
               else
               {
                  // Initialize QuestDB loading all quests that are currently observable for the user.
                  await QuestDB.init();

                  // Add back ui.controls
                  const notes = ui?.controls?.controls.find((c) => c.name === 'notes');
                  if (notes) { notes.tools.push(...noteControls); }
               }

               ui?.controls?.render(true);
            }

            // Render the journal to show / hide open quest log button & folder.
            game?.journal?.render();

            // Close or open the quest tracker based on active quests (users w/ TQL hidden will have no quests in
            // QuestDB)
            ViewManager.renderOrCloseQuestTracker({ updateSetting: false });
         }
      });

      game.settings.register(constants.moduleName, settings.notifyRewardDrop, {
         name: 'TyphonJSQuestLog.Settings.notifyRewardDrop.Enable',
         hint: 'TyphonJSQuestLog.Settings.notifyRewardDrop.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean,
         onChange: (value) =>
         {
            // Swap macro image based on current state. No need to await.
            if (game.user.isGM) { Utils.setMacroImage(settings.notifyRewardDrop, value); }
         }
      });

      game.settings.register(constants.moduleName, settings.showFolder, {
         name: 'TyphonJSQuestLog.Settings.showFolder.Enable',
         hint: 'TyphonJSQuestLog.Settings.showFolder.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean,
         onChange: () => game.journal.render()  // Render the journal to show / hide the quest folder.
      });

// Settings not displayed in the module settings ---------------------------------------------------------------------

      // Currently provides a hidden setting to set the default abstract reward image.
      // It may never be displayed in the module settings menu, but if it is in the future this is where it would go.
      game.settings.register(constants.moduleName, settings.defaultAbstractRewardImage, {
         scope: scope.world,
         config: false,
         default: 'icons/svg/item-bag.svg',
         type: String
      });

      game.settings.register(constants.moduleName, settings.questTrackerEnable, {
         scope: scope.client,
         config: false,
         default: false,
         type: Boolean,
         onChange: (value) =>
         {
            // Potentially Post notification that the quest tracker is enabled, but not visible as there are no active
            // quests.
            if (value && QuestDB.getCount({ status: questStatus.active }) === 0)
            {
               ViewManager.notifications.info(game.i18n.localize('TyphonJSQuestLog.Notifications.QuestTrackerNoActive'));
            }

            // Swap macro image based on current state. No need to await.
            Utils.setMacroImage(settings.questTrackerEnable, value);

            ViewManager.renderOrCloseQuestTracker();
         }
      });

      /**
       * This is the most complex module setting handling as quite a bit of logic is contained below to handle
       * setting the primary quest. Since the onChange event does not pass the old and new value the old value for
       * {@link TQLSettings.primaryQuest} is stored in {@link TQLSessionConstants.currentPrimaryQuest} which is
       * initially set in {@link TQLHooks.foundryReady}.
       *
       * This setting is set from {@link Socket.setQuestPrimary} or the handler in Socket.
       *
       * `value` may be a quest ID or an empty string.
       */
      game.settings.register(constants.moduleName, settings.primaryQuest, {
         scope: scope.world,
         config: false,
         default: '',
         type: String,
         onChange: (value) =>
         {
            // Any current primary quest.
            const currentQuestEntry = QuestDB.getQuestEntry(
             sessionStorage.getItem(sessionConstants.currentPrimaryQuest));

            // The new primary quest or none at all if value is an empty string.
            const newQuestEntry = QuestDB.getQuestEntry(value);

            // Store all quest IDs that need to be updated which include parent / subquests.
            const updateQuestIds = [];

            // Store the new primary quest name to post a notification.
            let newPrimaryQuestName = void 0;

            // Store the old primary quest IDs that need UI updates.
            if (currentQuestEntry && currentQuestEntry.id !== value)
            {
               updateQuestIds.push(...currentQuestEntry.questIds);

               // If there is a new quest then store the quest name and also all quests that need UI updates.
               if (newQuestEntry)
               {
                  newPrimaryQuestName = newQuestEntry.quest.name;
                  updateQuestIds.push(...newQuestEntry.questIds);
               }
            }
            else if (newQuestEntry)
            {
               // There was not a presently set primary quest, so store only the new
               updateQuestIds.push(...newQuestEntry.questIds);

               if (value.length) { newPrimaryQuestName = newQuestEntry.quest.name; }
            }

            // Store the current primary quest. Either Quest ID or empty string.
            sessionStorage.setItem(sessionConstants.currentPrimaryQuest, value);

            // If any quest IDs were stored then update all QuestPreviews after enriching the quest data.
            if (updateQuestIds.length)
            {
               QuestDB.enrichQuests(...updateQuestIds);
               ViewManager.refreshQuestPreview(updateQuestIds);
               ViewManager.renderAll({ force: true });
            }

            // Post a notification if a new primary quest was set.
            if (newPrimaryQuestName)
            {
               ViewManager.notifications.info(game.i18n.format('TyphonJSQuestLog.Notifications.QuestPrimary',
                { name: newPrimaryQuestName }));
            }
         }
      });

      game.settings.register(constants.moduleName, settings.questTrackerPinned, {
         scope: scope.client,
         config: false,
         type: Boolean,
         default: false,
         onChange: () =>
         {
            // The quest tracker pinned state has changed so update any Foundry UI management.
            FoundryUIManager.updateTrackerPinned();
         }
      });

      game.settings.register(constants.moduleName, settings.questTrackerPosition, {
         scope: scope.client,
         config: false,
         default: s_QUEST_TRACKER_DEFAULT,
      });

      game.settings.register(constants.moduleName, settings.questTrackerResizable, {
         name: 'TyphonJSQuestLog.Settings.questTrackerResizable.Enable',
         hint: 'TyphonJSQuestLog.Settings.questTrackerResizable.EnableHint',
         scope: scope.client,
         config: true,
         default: false,
         type: Boolean,
         onChange: (value) =>
         {
            ViewManager.renderOrCloseQuestTracker();

            // Swap macro image based on current state. No need to await.
            Utils.setMacroImage(settings.questTrackerResizable, value);
         }
      });
   }
}
