// import FoundryUIManager from '../../control/FoundryUIManager.js';
import QuestAPI         from '../../control/public/QuestAPI.js';
import QuestDB          from '../../control/QuestDB.js';
import Socket           from '../../control/Socket.js';

import { constants, sessionConstants, settings } from '../../model/constants.js';

// TODO: Temporarily importing the plugin manager eventbus
import { eventbus } from '../../plugins/PluginManager.js';

/**
 * Provides all {@link JQuery} and {@link PointerEvent} callbacks for the {@link QuestTracker}.
 */
export default class HandlerTracker
{
   /**
    * Handles the pointer down event from the header to reset the pinned state.
    *
    * @param {PointerEvent}   event - PointerEvent
    *
    * @param {HTMLElement}    header - The app header element.
    *
    * @param {QuestTracker}   questTracker - The QuestTracker
    */
   static async headerPointerDown(event, header, questTracker)
   {
      if (event.target.classList.contains('window-title') ||
       event.target.classList.contains('window-header'))
      {
         questTracker._dragHeader = true;

         questTracker._pinned = false;

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
    *
    * @param {QuestTracker}   questTracker - The QuestTracker
    */
   static async headerPointerUp(event, header, questTracker)
   {
      header.releasePointerCapture(event.pointerId);
      questTracker._dragHeader = false;

      if (questTracker._inPinDropRect)
      {
         questTracker._pinned = true;
         await game.settings.set(constants.moduleName, settings.questTrackerPinned, true);
         questTracker.element.css('animation', '');
         eventbus.trigger('tql:foundryuimanager:update:tracker');
         // FoundryUIManager.updateTracker();
      }
   }

   /**
    * Handles the quest open click via {@link QuestAPI.open}.
    *
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    */
   static questOpen(event)
   {
      const questId = event.currentTarget.dataset.questId;
      QuestAPI.open({ questId });
   }

   /**
    * Data for the quest folder open / close state is saved in {@link sessionStorage}.
    *
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @param {QuestTracker} questTracker - The QuestTracker.
    */
   static questClick(event, questTracker)
   {
      const questId = event.currentTarget.dataset.questId;

      const questEntry = QuestDB.getQuestEntry(questId);
      if (questEntry && questEntry.enrich.hasObjectives)
      {
         const folderState = sessionStorage.getItem(`${sessionConstants.trackerFolderState}${questId}`);
         const collapsed = folderState !== 'false';
         sessionStorage.setItem(`${sessionConstants.trackerFolderState}${questId}`, (!collapsed).toString());

         questTracker.render();
      }
   }

   /**
    * Handles the header button to show the primary quest or all quests.
    *
    * @param {QuestTracker}   questTracker - The QuestTracker.
    */
   static questPrimaryShow(questTracker)
   {
      const newPrimary = !(sessionStorage.getItem(sessionConstants.trackerShowPrimary) === 'true');
      sessionStorage.setItem(sessionConstants.trackerShowPrimary, (newPrimary).toString());

      const showPrimaryIcon = $('#quest-tracker .header-button.show-primary i');
      showPrimaryIcon.attr('class', newPrimary ? 'fas fa-star' : 'far fa-star');
      showPrimaryIcon.attr('title', game.i18n.localize(newPrimary ?
       'TyphonJSQuestLog.QuestTracker.Tooltips.PrimaryQuestShow' :
        'TyphonJSQuestLog.QuestTracker.Tooltips.PrimaryQuestUnshow'));

      questTracker.render();
   }

   /**
    * Handles toggling {@link Quest} tasks when clicked on by a user that is the GM or owner of quest.
    *
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    */
   static async questTaskToggle(event)
   {
      // Don't handle any clicks of internal anchor elements such as entity content links.
      if ($(event.target).is('.quest-tracker-task a')) { return; }

      const questId = event.currentTarget.dataset.questId;
      const uuidv4 = event.currentTarget.dataset.uuidv4;

      const quest = QuestDB.getQuest(questId);

      if (quest)
      {
         const task = quest.getTask(uuidv4);
         if (task)
         {
            task.toggle();
            await quest.save();

            Socket.refreshQuestPreview({
               questId,
               focus: false
            });
         }
      }
   }
}