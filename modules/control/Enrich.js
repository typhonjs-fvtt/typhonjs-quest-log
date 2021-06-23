import Fetch                     from './Fetch.js';
import { constants, settings }   from '../model/constants.js';

/**
 * Enrich populates content with a lot of additional data that doesn't necessarily have to be saved
 * with the Quest itself such as Actor data.
 *
 * All enrich methods should only be used in getData of various Foundry apps / views.
 */
export default class Enrich
{
   static async giverFromQuest(quest)
   {
      let data = null;

      if (quest.giver === 'abstract')
      {
         data = {
            name: quest.giverName,
            img: quest.image,
            hasTokenImg: false
         };
      }
      else if (typeof quest.giver === 'string')
      {
         data = Enrich.giverFromUUID(quest.giver, quest.image);
      }

      return data;
   }

   static async giverFromUUID(uuid, imageType = 'actor')
   {
      let data = null;

      if (typeof uuid === 'string')
      {
         const document = await fromUuid(uuid);

         if (document !== null)
         {
            switch (document.documentName)
            {
               case Actor.documentName:
               {
                  const actorImage = document.img;
                  const tokenImage = document?.data?.token?.img;
                  const hasTokenImg = typeof tokenImage === 'string' && tokenImage !== actorImage;

                  data = {
                     uuid,
                     name: document.name,
                     img: imageType === 'token' && hasTokenImg ? tokenImage : actorImage,
                     hasTokenImg
                  };
                  break;
               }

               case Item.documentName:
                  data = {
                     uuid,
                     name: document.name,
                     img: document.img,
                     hasTokenImg: false
                  };
                  break;

               case JournalEntry.documentName:
                  data = {
                     uuid,
                     name: document.name,
                     img: document.data.img,
                     hasTokenImg: false
                  };
                  break;
            }
         }
      }

      return data;
   }

   /**
    * @param {SortedQuests}   sortedQuests
    *
    * @returns {Promise<object>}
    */
   static async sorted(sortedQuests)
   {
      const data = {};

      for (const key in sortedQuests)
      {
         data[key] = [];
         for (const quest of sortedQuests[key])
         {
            const questView = await Enrich.quest(quest);
            data[key].push(questView);
         }
      }

      return data;
   }

   /**
    * This method also performs content manipulation, for example enriching HTML or calculating amount
    * of done/total tasks etc.
    *
    * @param {Quest}  quest - Quest data to construct view data.
    *
    * @returns {Promise<object>} A single quest view or SortedQuests upgraded
    */
   static async quest(quest)
   {
      const data = {};

      data.id = quest.id;
      data.giver = quest.giver || null;
      data.name = quest.name || game.i18n.localize('ForienQuestLog.NewQuest');
      data.status = quest.status || 'hidden';
      data.description = quest.description || '';
      data.gmnotes = quest.gmnotes || '';
      data.image = quest.image || 'actor';
      data.giverName = quest.giverName || 'actor';
      data.splash = quest.splash || '';
      data.splashPos = quest.splashPos || 'center';
      data.location = quest.location || null;
      data.priority = quest.priority || 0;
      data.type = quest.type || null;
      data.parent = quest.parent || null;
      data.subquests = quest.subquests || [];
      data.tasks = Array.isArray(quest.tasks) ? quest.tasks.map((task) => task.toJSON()) : [];
      data.rewards = Array.isArray(quest.rewards) ? quest.rewards.map((reward) => reward.toJSON()) : [];

      data.date = typeof quest.date === 'object' ? quest.date : { create: null, start: null, end: null };

      const isGM = game.user.isGM;
      const canPlayerDrag = game.settings.get(constants.moduleName, 'allowPlayersDrag');
      const countHidden = game.settings.get(constants.moduleName, 'countHidden');

      data.description = TextEditor.enrichHTML(data.description);

      data.data_giver = await Enrich.giverFromQuest(quest);
      if (data.data_giver) { data.data_giver.uuid = quest.giver; }

      data.statusLabel = game.i18n.localize(`ForienQuestLog.QuestTypes.Labels.${data.status}`);

      data.isSubquest = false;

      if (data.parent !== null)
      {
         data.isSubquest = true;

         const parentData = Fetch.quest(data.parent);
         if (parentData)
         {
            data.data_parent = {
               id: data.parent,
               giver: parentData.giver,
               name: parentData.name,
               status: parentData.status
            };
         }
      }
      else
      {
         data.data_parent = {};
      }

      data.data_subquest = [];

      if (data.subquests !== void 0)
      {
         for (const questId of data.subquests)
         {
            const subData = Fetch.quest(questId);

            if (subData)
            {
               // Mirror Task data for state / button state
               let state = 'square';
               switch (subData.status)
               {
                  case 'completed':
                     state = 'check-square';
                     break;
                  case 'failed':
                     state = 'minus-square';
                     break;
               }

               data.data_subquest.push({
                  id: questId,
                  giver: subData.giver,
                  name: subData.name,
                  status: subData.status,
                  state,
                  isObservable: subData.isObservable
               });
            }
         }
      }

      if (countHidden)
      {
         data.checkedTasks = data.tasks.filter((t) => t.completed).length;

         const finishedSubquests = data.data_subquest.filter((s) => s.status === 'completed').length;

         data.checkedTasks += finishedSubquests;

         data.totalTasks = data.tasks.length + data.data_subquest.length;
      }
      else
      {
         data.checkedTasks = data.tasks.filter((t) => t.hidden === false && t.completed).length;

         const finishedSubquests = data.data_subquest.filter(
          (s) => s.isObservable && s.status === 'completed').length;

         data.checkedTasks += finishedSubquests;

         data.totalTasks = data.tasks.filter((t) => t.hidden === false).length +
          data.data_subquest.filter((s) => s.isObservable && s.status !== 'hidden').length;
      }

      switch (game.settings.get(constants.moduleName, settings.showTasks))
      {
         case 'default':
            data.taskCountLabel = `(${data.checkedTasks}/${data.totalTasks})`;
            break;

         case 'onlyCurrent':
            data.taskCountLabel = `(${data.checkedTasks})`;
            break;

         default:
            data.taskCountLabel = '';
            break;
      }

      data.data_tasks = data.tasks.map((task) =>
      {
         // Note: We no longer are allowing user data to be enriched / currently escaping in Handlebars template.
         // XSS vulnerability w/ script data entered by user. This may change in the future as it might be possible to
         // provide a regex to verify and only upgrade content links and avoid scripts though that is a hard task.
         // task.name = TextEditor.enrichHTML(task.name);

         return task;
      });

      data.data_rewards = data.rewards.map((item) =>
      {
         const type = item.type.toLowerCase();

         const draggable = (isGM || canPlayerDrag) && (isGM || !item.locked) && type !== 'abstract';

         return {
            name: item.data.name,
            img: item.data.img,
            type,
            hidden: item.hidden,
            locked: item.locked,
            isPlayerLink: !isGM && !canPlayerDrag && !item.locked && type !== 'abstract',
            draggable,
            transfer: type !== 'abstract' ? JSON.stringify(
             { uuid: item.data.uuid, uuidv4: item.uuidv4, name: item.data.name }) : void 0,
            uuidv4: item.uuidv4
         };
      });

      if (!isGM)
      {
         data.data_tasks = data.data_tasks.filter((t) => t.hidden === false);
         data.data_rewards = data.data_rewards.filter((r) => r.hidden === false);
      }

      return data;
   }
}
