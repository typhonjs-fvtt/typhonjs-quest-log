import { TJSDialog } from '@typhonjs-fvtt/runtime/svelte/application';

/**
 * These handler {@link JQuery} callbacks can be called on any tab.
 */
export default class HandlerAny
{
   /**
    * Confirms deleting a quest with {@link TQLDialog.confirmDeleteQuest} before invoking {@link QuestDB.deleteQuest}.
    *
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @param {Eventbus}          eventbus - Plugin manager eventbus
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
    * Opens a {@link QuestPreview} via {@link QuestAPI.open}.
    *
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent.
    *
    * @param {Eventbus}          eventbus - Plugin manager eventbus
    */
   static questOpen(event, eventbus)
   {
      const questId = $(event.currentTarget).data('quest-id');
      eventbus.trigger('tql:questapi:open', { questId });
   }

   /**
    * Potentially sets a new {@link Quest.status} via {@link Socket.setQuestStatus}. If the current user is not a GM
    * a GM level user must be logged in for a successful completion of the set status operation.
    *
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @param {Eventbus}          eventbus - Plugin manager eventbus
    *
    * @returns {Promise<void>}
    */
   static async questStatusSet(event, eventbus)
   {
      const target = $(event.target).data('target');
      const questId = $(event.target).data('quest-id');

      const quest = eventbus.triggerSync('tql:questdb:quest:get', questId);
      if (quest)
      {
         await eventbus.triggerAsync('tql:socket:set:quest:status', { quest, target });
      }
   }
}