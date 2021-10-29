import { constants, sessionConstants, settings } from '../../constants.js';

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
    * @param {Eventbus}       eventbus - Plugin manager eventbus
    *
    * @param {HTMLElement}    header - The app header element.
    *
    * @param {QuestTracker}   questTracker - The QuestTracker
    */
   static async headerPointerUp(event, eventbus, header, questTracker)
   {
      header.releasePointerCapture(event.pointerId);
      questTracker._dragHeader = false;

      if (questTracker._inPinDropRect)
      {
         questTracker._pinned = true;
         await game.settings.set(constants.moduleName, settings.questTrackerPinned, true);
         questTracker.element.css('animation', '');
         eventbus.trigger('tql:foundryuimanager:update:tracker');
      }
   }

   /**
    * Handles the quest open click via {@link QuestAPI.open}.
    *
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @param {Eventbus}          eventbus - Plugin manager eventbus
    */
   static questOpen(event, eventbus)
   {
      const questId = event.currentTarget.dataset.questId;
      eventbus.trigger('tql:questapi:open', { questId });
   }

   /**
    * Data for the quest folder open / close state is saved in {@link sessionStorage}.
    *
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @param {Eventbus}          eventbus - Plugin manager eventbus
    *
    * @param {QuestTracker}      questTracker - The QuestTracker.
    */
   static questClick(event, eventbus, questTracker)
   {
      const questId = event.currentTarget.dataset.questId;

      const questEntry = eventbus.triggerSync('tql:questdb:quest:entry:get', questId);
      if (questEntry && questEntry.enrich.hasObjectives)
      {
         // const folderState = sessionStorage.getItem(`${sessionConstants.trackerFolderState}${questId}`);
         const folderState = eventbus.triggerSync('tql:storage:session:item:get',
          `${sessionConstants.trackerFolderState}${questId}`);

         // const collapsed = folderState !== 'false';
         const collapsed = folderState !== false;

         // sessionStorage.setItem(`${sessionConstants.trackerFolderState}${questId}`, (!collapsed).toString());
         eventbus.trigger('tql:storage:session:item:set', `${sessionConstants.trackerFolderState}${questId}`,
          !collapsed);

         questTracker.render();
      }
   }

   /**
    * Handles the header button to show the primary quest or all quests.
    *
    * @param {QuestTracker}   questTracker - The QuestTracker.
    */
   static questPrimaryShow(questTracker, eventbus)
   {
      // const newPrimary = !(sessionStorage.getItem(sessionConstants.trackerShowPrimary) === 'true');
      const newPrimary = !eventbus.triggerSync('tql:storage:session:item:get', sessionConstants.trackerShowPrimary);

      // sessionStorage.setItem(sessionConstants.trackerShowPrimary, (newPrimary).toString());
      eventbus.trigger('tql:storage:session:item:set', sessionConstants.trackerShowPrimary, newPrimary);

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
    *
    * @param {Eventbus}          eventbus - Plugin manager eventbus
    */
   static async questTaskToggle(event, eventbus)
   {
      // Don't handle any clicks of internal anchor elements such as entity content links.
      if ($(event.target).is('.quest-tracker-task a')) { return; }

      const questId = event.currentTarget.dataset.questId;
      const uuidv4 = event.currentTarget.dataset.uuidv4;

      const quest = eventbus.triggerSync('tql:questdb:quest:get', questId);

      if (quest)
      {
         const task = quest.getTask(uuidv4);
         if (task)
         {
            task.toggle();
            await quest.save();

            eventbus.trigger('tql:socket:refresh:quest:preview', {
               questId,
               focus: false
            });
         }
      }
   }
}