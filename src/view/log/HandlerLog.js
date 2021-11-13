import { TJSDialog } from '../svelte/application/TJSDialog';

/**
 * Provides all {@link JQuery} callbacks for the {@link QuestLog}.
 */
export default class HandlerLog
{
   /**
    * Handles the quest add button.
    *
    * @param {Eventbus} eventbus - Plugin manager eventbus
    *
    * @returns {Promise<void>}
    */
   static async questAdd(eventbus)
   {
      if (eventbus.triggerSync('tql:viewmanager:verify:quest:can:add'))
      {
         const quest = await eventbus.triggerAsync('tql:questdb:quest:create');
         eventbus.trigger('tql:viewmanager:quest:added', { quest });
      }
   }

   /**
    * Handles deleting a quest. The trashcan icon.
    *
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @param {Eventbus} eventbus - Plugin manager eventbus
    *
    * @returns {Promise<void>}
    */
   static async questDelete(event, eventbus)
   {
      const questId = $(event.target).data('quest-id');
      const name = $(event.target).data('quest-name');

      const result = await TJSDialog.confirm(eventbus.triggerSync('tql:data:dialog:quest:delete:get', name));
      if (result)
      {
         await eventbus.triggerAsync('tql:questdb:quest:delete', { questId });
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
    *
    * @param {Eventbus} eventbus - Plugin manager eventbus
    */
   static questOpen(event, eventbus)
   {
      const questId = $(event.target)?.closest('.title')?.data('quest-id');
      eventbus.trigger('tql:questapi:open', { questId });
   }

   /**
    * Handles changing the quest status via {@link Socket.setQuestStatus}.
    *
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @param {Eventbus} eventbus - Plugin manager eventbus
    *
    * @returns {Promise<void>}
    */
   static async questStatusSet(event, eventbus)
   {
      const target = $(event.target).data('target');
      const questId = $(event.target).data('quest-id');

      const quest = eventbus.triggerSync('tql:questdb:quest:get', questId);

      if (quest) { await eventbus.triggerAsync('tql:socket:set:quest:status', { quest, target }); }
   }
}