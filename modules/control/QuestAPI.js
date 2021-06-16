import Socket        from './Socket.js';
import Quest         from '../model/Quest.js';
import QuestPreview  from '../view/QuestPreview.js';

/**
 * Quest public Api available under `Quests.`
 */
export default class QuestAPI
{
   /**
    * Creates new Quest programmatically through API
    *
    * @param data
    *
    * @returns {Quest}
    */
   static create(data = {})
   {
      if (data.title === undefined)
      {
         throw new Error(game.i18n.localize('ForienQuestLog.Api.create.title'));
      }

      return new Quest({});
   }

   /**
    * Retrieves Quest instance for given quest ID
    *
    * @param questId
    *
    * @returns {Quest}
    */
   static get(questId)
   {
      // TODO: EVALUATE THROWING HERE
      // if (!entry)
      // {
      //    throw new Error(game.i18n.localize('ForienQuestLog.QuestPreview.InvalidQuestId'));
      // }

      return Quest.get(questId);
   }

   /**
    * Opens Quest Details for given quest ID
    *
    * @param questId
    *
    * @param notif
    */
   static open(questId, notif = true)
   {
      try
      {
         const quest = Quest.get(questId);
         const questPreview = new QuestPreview(quest);
         questPreview.render(true);
      }
      catch (error)
      {
         if (notif)
         {
            ui.notifications.error(game.i18n.localize('ForienQuestLog.Notifications.CannotOpen'), {});
         }
         else
         {
            Socket.userCantOpenQuest();
         }
      }
   }
}
