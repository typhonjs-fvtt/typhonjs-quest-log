import { constants, questStatus, sessionConstants, settings } from '#constants';

/**
 * Defines if logging setting changes to the console occurs.
 *
 * @type {boolean}
 */
let loggingEnabled = false;

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
         dispatchFunction.call(this, data.value);
      }
   }

   static handle_allowPlayersAccept(value)
   {
      // Swap macro image based on current state. No need to await.
      if (game.user.isGM)
      {
         this._eventbus.trigger('tql:utils:macro:image:set', settings.allowPlayersAccept, value);
      }

      // Must enrich all quests again in QuestDB.
      this._eventbus.trigger('tql:questdb:enrich:all');

      // Render all views as quest status actions need to be shown or hidden for some players.
      this._eventbus.trigger('tql:viewmanager:render:all', { questPreview: true });
   }

   static handle_allowPlayersCreate(value)
   {
      // Swap macro image based on current state. No need to await.
      if (game.user.isGM)
      {
         this._eventbus.trigger('tql:utils:macro:image:set', settings.allowPlayersCreate, value);
      }

      // Render quest log to show / hide add quest button.
      const questLog = this._eventbus.triggerSync('tql:viewmanager:quest:log:get');
      if (questLog && questLog.rendered)
      {
         questLog.render();
      }
   }

   static handle_allowPlayersDrag(value)
   {
      // Swap macro image based on current state. No need to await.
      if (game.user.isGM)
      {
         this._eventbus.trigger('tql:utils:macro:image:set', settings.allowPlayersDrag, value);
      }

      // Must enrich all quests again in QuestDB.
      this._eventbus.trigger('tql:questdb:enrich:all');

      // Render all views; immediately stops / enables player drag if Quest view is open.
      this._eventbus.trigger('tql:viewmanager:render:all', { force: true, questPreview: true });
   }

   static handle_countHidden(value)
   {
      // Swap macro image based on current state. No need to await.
      if (game.user.isGM)
      {
         this._eventbus.trigger('tql:utils:macro:image:set', settings.countHidden, value);
      }

      // Must enrich all quests again in QuestDB.
      this._eventbus.trigger('tql:questdb:enrich:all');

      // Must render the quest log / floating quest log / quest tracker.
      this._eventbus.trigger('tql:viewmanager:render:all');
   }

   static handle_dynamicBookmarkBackground()
   {
      // Must render the quest log.
      const questLog = this._eventbus.triggerSync('tql:viewmanager:quest:log:get');
      if (questLog && questLog.rendered)
      {
         questLog.render();
      }
   }

   static async handle_hideTQLFromPlayers(value)
   {
      // Swap macro image based on current state. No need to await.
      if (game.user.isGM)
      {
         this._eventbus.trigger('tql:utils:macro:image:set', settings.hideTQLFromPlayers, value);
      }

      if (!game.user.isGM)
      {
         // Hide all TQL apps from non GM user and remove the ui.controls for TQL.
         if (value)
         {
            this._eventbus.trigger('tql:viewmanager:close:all', { questPreview: true, updateSetting: false });

            const notes = ui?.controls?.controls.find((c) => c.name === 'notes');
            if (notes) { notes.tools = notes?.tools.filter((c) => !c.name.startsWith(constants.moduleName)); }

            // Remove all quests from in-memory DB. This is required so that users can not retrieve quests
            // from the QuestAPI or content links in Foundry resolve when TQL is hidden.
            this._eventbus.trigger('tql:questdb:remove:all');
         }
         else
         {
            // Initialize QuestDB loading all quests that are currently observable for the user.
            await this._eventbus.triggerAsync('tql:questdb:init');

            const noteControls = this._eventbus.triggerSync('tql:data:notecontrol:get');

            // Add back ui.controls
            const notes = ui?.controls?.controls.find((c) => c.name === 'notes');
            if (notes) { notes.tools.push(...noteControls); }
         }

         ui?.controls?.render(true);
      }

      // Render the journal to show / hide open quest log button & folder.
      game?.journal?.render();

      // Close or open the quest tracker based on active quests (users w/ TQL hidden will have no quests in
      // QuestDB).
      this._eventbus.trigger('tql:viewmanager:render:or:close:quest:tracker', { updateSetting: false });
   }

   static handle_navStyle()
   {
      // Must enrich all quests again in QuestDB.
      this._eventbus.trigger('tql:questdb:enrich:all');

      // Must render the quest log.
      const questLog = this._eventbus.triggerSync('tql:viewmanager:quest:log:get');
      if (questLog && questLog.rendered)
      {
         questLog.render();
      }
   }

   static handle_notifyRewardDrop(value)
   {
      // Swap macro image based on current state. No need to await.
      if (game.user.isGM)
      {
         this._eventbus.trigger('tql:utils:macro:image:set', settings.notifyRewardDrop, value);
      }
   }

   static handle_primaryQuest(value)
   {
      // Any current primary quest.
      const currentQuestEntry = this._eventbus.triggerSync('tql:questdb:quest:entry:get',
       this._eventbus.triggerSync('tql:storage:session:item:get', sessionConstants.currentPrimaryQuest));

      // The new primary quest or none at all if value is an empty string.
      const newQuestEntry = this._eventbus.triggerSync('tql:questdb:quest:entry:get', value);

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
      this._eventbus.triggerSync('tql:storage:session:item:set', sessionConstants.currentPrimaryQuest, value);

      // If any quest IDs were stored then update all QuestPreviews after enriching the quest data.
      if (updateQuestIds.length)
      {
         this._eventbus.trigger('tql:questdb:enrich:quests', ...updateQuestIds);
         this._eventbus.trigger('tql:viewmanager:refresh:quest:preview', updateQuestIds);
         this._eventbus.trigger('tql:viewmanager:render:all', { force: true });
      }

      // Post a notification if a new primary quest was set.
      if (newPrimaryQuestName)
      {
         this._eventbus.trigger('tql:viewmanager:notifications:info', game.i18n.format(
          'TyphonJSQuestLog.Notifications.QuestPrimary', { name: newPrimaryQuestName }));
      }
   }

   static handle_questTrackerEnable(value)
   {
      // Potentially Post notification that the quest tracker is enabled, but not visible as there are no active
      // quests.
      const isTQLHiddenFromPlayers = this._eventbus.triggerSync('tql:utils:is:hidden:from:players');
      const activeCount = this._eventbus.triggerSync('tql:questdb:count:get', { status: questStatus.active });

      if (value && !isTQLHiddenFromPlayers && activeCount === 0)
      {
         this._eventbus.trigger('tql:viewmanager:notifications:info', game.i18n.localize(
          'TyphonJSQuestLog.Notifications.QuestTrackerNoActive'));
      }

      // Swap macro image based on current state. No need to await.
      this._eventbus.trigger('tql:utils:macro:image:set', settings.questTrackerEnable, value);

      this._eventbus.trigger('tql:viewmanager:render:or:close:quest:tracker');
   }

   // TODO CONSIDER HAVING FoundryUIManager listen directly for this change.
   static handle_questTrackerPinned()
   {
      // The quest tracker pinned state has changed so update any Foundry UI management.
      this._eventbus.trigger('tql:foundryuimanager:update:tracker:pinned');
   }

   static handle_questTrackerResizable(value)
   {
      this._eventbus.trigger('tql:viewmanager:render:or:close:quest:tracker');

      // Swap macro image based on current state. No need to await.
      this._eventbus.trigger('tql:utils:macro:image:set', settings.questTrackerResizable, value);
   }

   static handle_showFolder()
   {
      // Render the journal to show / hide the quest folder.
      game.journal.render();
   }

   static handle_showTasks()
   {
      // Must enrich all quests again in QuestDB.
      this._eventbus.trigger('tql:questdb:enrich:all');

      // Must render the quest log.
      this._eventbus.trigger('tql:viewmanager:render:all');
   }

   static handle_trustedPlayerEdit(value)
   {
      // Swap macro image based on current state. No need to await.
      if (game.user.isGM)
      {
         this._eventbus.trigger('tql:utils:macro:image:set', settings.trustedPlayerEdit, value);
      }

      // Must perform a consistency check as there are possible quests that need to be added / removed
      // from the in-memory DB based on trusted player edit status.
      this._eventbus.trigger('tql:questdb:consistency:check');

      // Render all views as trusted player edit adds / removes capabilities.
      this._eventbus.trigger('tql:viewmanager:render:all', { questPreview: true });
   }

   static onPluginLoad(ev)
   {
      this._eventbus = ev.eventbus;

      const opts = { guard: true };

      ev.eventbus.on('tql:settings:change:any', this.handleDispatch, this, opts);
      ev.eventbus.on('tql:settings:log:enable', (enabled) => loggingEnabled = enabled, void 0, opts);
   }
}