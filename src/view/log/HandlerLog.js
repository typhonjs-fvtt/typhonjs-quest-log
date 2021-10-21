import QuestAPI      from '../../plugins/system/public/QuestAPI.js';
import QuestDB       from '../../plugins/system/QuestDB.js';
import ViewManager   from '../../plugins/system/ViewManager.js';
import Socket        from '../../plugins/system/Socket.js';
import TQLDialog     from '../TQLDialog.js';

/**
 * Provides all {@link JQuery} callbacks for the {@link QuestLog}.
 */
export default class HandlerLog
{
   /**
    * Handles the quest add button.
    *
    * @returns {Promise<void>}
    */
   static async questAdd()
   {
      if (ViewManager.verifyQuestCanAdd())
      {
         const quest = await QuestDB.createQuest();
         ViewManager.questAdded({ quest });
      }
   }

   /**
    * Handles deleting a quest. The trashcan icon.
    *
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @returns {Promise<void>}
    */
   static async questDelete(event)
   {
      const questId = $(event.target).data('quest-id');
      const name = $(event.target).data('quest-name');

      const result = await TQLDialog.confirmDeleteQuest({ name, result: questId, questId, isQuestLog: true });
      if (result)
      {
         await QuestDB.deleteQuest({ questId: result });
      }
   }

   /**
    * Prepares the data transfer when a quest is dragged from the {@link QuestLog}.
    *
    * @param {JQuery.DragStartEvent} event - JQuery.DragStartEvent
    */
   static questDragStart(event)
   {
      const dataTransfer = {
         type: 'Quest',
         id: $(event.target).data('quest-id')
      };

      event.originalEvent.dataTransfer.setData('text/plain', JSON.stringify(dataTransfer));
   }

   /**
    * Handles the quest open click via {@link QuestAPI.open}.
    *
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    */
   static questOpen(event)
   {
      const questId = $(event.target)?.closest('.title')?.data('quest-id');
      QuestAPI.open({ questId });
   }

   /**
    * Handles changing the quest status via {@link Socket.setQuestStatus}.
    *
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @returns {Promise<void>}
    */
   static async questStatusSet(event)
   {
      const target = $(event.target).data('target');
      const questId = $(event.target).data('quest-id');

      const quest = QuestDB.getQuest(questId);
      if (quest) { await Socket.setQuestStatus({ quest, target }); }
   }
}