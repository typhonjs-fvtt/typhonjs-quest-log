import FoundryUIManager from '../../control/FoundryUIManager.js';
import QuestDB          from '../../control/QuestDB.js';
import Utils            from '../../control/Utils.js';
import ViewManager      from '../../control/ViewManager.js';

import { constants, noteControls, questStatus, sessionConstants, settings } from '../../model/constants.js';

/**
 * Defines if logging setting changes to the console occurs.
 *
 * @type {boolean}
 */
let loggingEnabled = true;

export default class SettingsControl
{
   static handleDispatch(data)
   {
      if (typeof data.setting !== 'string') { return; }

      if (loggingEnabled)
      {
         console.log(`SettingsControl - handleDispatch - data:\n${JSON.stringify(data)}`);
      }

      const dispatchFunction = this[`handle_${data.setting}`];

      if (typeof dispatchFunction === 'function')
      {
         dispatchFunction(data.value);
      }
   }

   static handle_allowPlayersAccept(value)
   {
      // Swap macro image based on current state. No need to await.
      if (game.user.isGM) { Utils.setMacroImage(settings.allowPlayersAccept, value); }

      // Must enrich all quests again in QuestDB.
      QuestDB.enrichAll();

      // Render all views as quest status actions need to be shown or hidden for some players.
      ViewManager.renderAll({ questPreview: true });
   }

   static handle_allowPlayersCreate(value)
   {
      // Swap macro image based on current state. No need to await.
      if (game.user.isGM) { Utils.setMacroImage(settings.allowPlayersCreate, value); }

      // Render quest log to show / hide add quest button.
      if (ViewManager.questLog.rendered) { ViewManager.questLog.render(); }
   }

   static handle_allowPlayersDrag(value)
   {
      // Swap macro image based on current state. No need to await.
      if (game.user.isGM) { Utils.setMacroImage(settings.allowPlayersDrag, value); }

      // Must enrich all quests again in QuestDB.
      QuestDB.enrichAll();

      // Render all views; immediately stops / enables player drag if Quest view is open.
      ViewManager.renderAll({ force: true, questPreview: true });
   }

   static handle_countHidden(value)
   {
      // Swap macro image based on current state. No need to await.
      if (game.user.isGM) { Utils.setMacroImage(settings.countHidden, value); }

      // Must enrich all quests again in QuestDB.
      QuestDB.enrichAll();

      // Must render the quest log / floating quest log / quest tracker.
      ViewManager.renderAll();
   }

   static handle_dynamicBookmarkBackground()
   {
      // Must render the quest log.
      if (ViewManager.questLog.rendered) { ViewManager.questLog.render(); }
   }

   static async handle_hideTQLFromPlayers(value)
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

   static handle_navStyle()
   {
      // Must enrich all quests again in QuestDB.
      QuestDB.enrichAll();

      // Must render the quest log.
      if (ViewManager.questLog.rendered) { ViewManager.questLog.render(); }
   }

   static handle_notifyRewardDrop(value)
   {
      // Swap macro image based on current state. No need to await.
      if (game.user.isGM) { Utils.setMacroImage(settings.notifyRewardDrop, value); }
   }

   static handle_primaryQuest(value)
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

   static handle_questTrackerEnable(value)
   {
      // Potentially Post notification that the quest tracker is enabled, but not visible as there are no active
      // quests.
      if (value && !Utils.isTQLHiddenFromPlayers() && QuestDB.getCount({ status: questStatus.active }) === 0)
      {
         ViewManager.notifications.info(game.i18n.localize('TyphonJSQuestLog.Notifications.QuestTrackerNoActive'));
      }

      // Swap macro image based on current state. No need to await.
      Utils.setMacroImage(settings.questTrackerEnable, value);

      ViewManager.renderOrCloseQuestTracker();
   }

   static handle_questTrackerPinned()
   {
      // The quest tracker pinned state has changed so update any Foundry UI management.
      FoundryUIManager.updateTrackerPinned();
   }

   static handle_questTrackerResizable(value)
   {
      ViewManager.renderOrCloseQuestTracker();

      // Swap macro image based on current state. No need to await.
      Utils.setMacroImage(settings.questTrackerResizable, value);
   }

   static handle_showFolder()
   {
      // Render the journal to show / hide the quest folder.
      game.journal.render();
   }

   static handle_showTasks()
   {
      // Must enrich all quests again in QuestDB.
      QuestDB.enrichAll();

      // Must render the quest log.
      ViewManager.renderAll();
   }

   static handle_trustedPlayerEdit(value)
   {
      // Swap macro image based on current state. No need to await.
      if (game.user.isGM) { Utils.setMacroImage(settings.trustedPlayerEdit, value); }

      // Must perform a consistency check as there are possible quests that need to be added / removed
      // from the in-memory DB based on trusted player edit status.
      QuestDB.consistencyCheck();

      // Render all views as trusted player edit adds / removes capabilities.
      ViewManager.renderAll({ questPreview: true });
   }

   static onPluginLoad(ev)
   {
      this._eventbus = ev.eventbus;

      ev.eventbus.on('tql:settings:change:any', SettingsControl.handleDispatch, SettingsControl);
      ev.eventbus.on('tql:settings:log:enable', (enabled) => loggingEnabled = enabled);
   }
}