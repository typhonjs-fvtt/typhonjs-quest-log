import QuestDB from './QuestDB.js';
import Utils   from './Utils.js';

import { constants, questStatus, questStatusI18n, settings } from '../model/constants.js';

/**
 * Enrich populates content with a lot of additional data that doesn't necessarily have to be saved
 * with the Quest itself such as Actor data and provides embellishment for the Handlebars templates for tasks, rewards,
 * subquests, status actions, and provides a UUID lookup for the quest giver image.
 *
 * All enrich methods should only be used in the {@link QuestDB} during the caching phase of the update / create
 * lifecycle. {@link Enrich.giverFromQuest} / {@link Enrich.giverFromUUID} are used in {@link HandlerDetails} to lookup
 * and store the quest giver image / name in {@link Quest.giverData} when a quest giver is set.
 */
export default class Enrich
{
   /**
    * Lookup the Quest giver by UUID and return the data stored in {@link Quest.giverData}.
    *
    * @param {Quest} quest - The quest to lookup the quest giver.
    *
    * @returns {Promise<QuestImgNameData|null>} The image / name data associated with this Foundry UUID.
    */
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

   /**
    * @param {string}   uuid - The Foundry UUID to lookup for image / name data.
    *
    * @param {string}   [imageType] - The image type: 'actor' or 'token'
    *
    * @returns {Promise<QuestImgNameData|null>} The image / name data associated with this Foundry UUID.
    */
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
    * Builds the quest status / icons div to control quest status. There are many possible states to construct across
    * three different user states from GM, trusted player edit, to player accept so it is easier to build and cache
    * this data as performing this setup in the Handlebars template itself is cumbersome and error prone.
    *
    * @param {Quest} quest - The quest to build status action div / icons for based on current user state.
    *
    * @returns {string} The HTML to insert into a Handlebars template for quest status div / icons.
    */
   static statusActions(quest)
   {
      let result = '';

      const isTrustedPlayerEdit = Utils.isTrustedPlayerEdit();
      const canAccept = game.settings.get(constants.moduleName, settings.allowPlayersAccept);
      const canEdit = game.user.isGM || (isTrustedPlayerEdit && quest.isOwner);

      let addedAction = false;

      result += `<div class="actions quest-status${!isTrustedPlayerEdit && !canEdit ? ' is-player' : ''}">`;

      if (canEdit || canAccept)
      {
         if (canEdit && questStatus.active === quest.status)
         {
            result += `<i class="move fas fa-check-circle" title="${game.i18n.localize(
             'ForienQuestLog.Tooltips.SetCompleted')}" data-target="completed" data-quest-id="${quest.id}"></i>\n`;

            result += `<i class="move fas fa-times-circle" title="${game.i18n.localize(
             'ForienQuestLog.Tooltips.SetFailed')}" data-target="failed" data-quest-id="${quest.id}"></i>\n`;

            addedAction = true;
         }

         if ((canEdit && questStatus.inactive === quest.status) || questStatus.available === quest.status)
         {
            result += `<i class="move fas fa-play" title="${game.i18n.localize(
             'ForienQuestLog.Tooltips.SetActive')}" data-target="active" data-quest-id="${quest.id}"></i>\n`;

            addedAction = true;
         }

         if (canEdit && questStatus.inactive !== quest.status)
         {
            result += `<i class="move fas fa-stop-circle" title="${game.i18n.localize(
             'ForienQuestLog.Tooltips.Hide')}" data-target="inactive" data-quest-id="${quest.id}"></i>\n`;

            addedAction = true;
         }

         if ((canEdit && questStatus.inactive === quest.status) || questStatus.active === quest.status)
         {
            result += `<i class="move fas fa-clipboard" title="${game.i18n.localize(
             'ForienQuestLog.Tooltips.SetAvailable')}" data-target="available" data-quest-id="${quest.id}"></i>\n`;

            addedAction = true;
         }

         if (canEdit)
         {
            result += `<i class="delete fas fa-trash" title="${game.i18n.localize(
             'ForienQuestLog.Tooltips.Delete')}" data-quest-id="${quest.id}" data-quest-name="${quest.name}"></i>\n`;

            addedAction = true;
         }

         result += `</div>\n`;
      }

      return isTrustedPlayerEdit || addedAction ? result : '';
   }

   /**
    * This method also performs content manipulation, for example enriching HTML or calculating amount
    * of done/total tasks etc.
    *
    * @param {Quest}  quest - Quest data to construct view data.
    *
    * @returns {EnrichData} A single quest view or SortedQuests upgraded
    */
   static quest(quest)
   {
      const data = JSON.parse(JSON.stringify(quest.toJSON()));
      data.id = quest.id;
      data.isHidden = quest.isHidden;
      data.isInactive = questStatus.inactive === data.status;

      const personalActors = quest.getPersonalActors();

      const isTrustedPlayerEdit = Utils.isTrustedPlayerEdit();
      const canEdit =  game.user.isGM || (quest.isOwner && isTrustedPlayerEdit);

      const canPlayerAccept = game.settings.get(constants.moduleName, settings.allowPlayersAccept);
      const canPlayerDrag = game.settings.get(constants.moduleName, settings.allowPlayersDrag);
      const countHidden = game.settings.get(constants.moduleName, settings.countHidden);

      data.canEdit = canEdit;

      data.wrapNameLengthCSS = 'player';
      if (canPlayerAccept || quest.isOwner) { data.wrapNameLengthCSS = 'player-edit'; }
      if (canEdit) { data.wrapNameLengthCSS = 'can-edit'; }

      data.isPersonal = personalActors.length > 0;
      data.personalActors = personalActors.map((a) => a.name).sort((a, b) => a.localeCompare(b)).join('&#013;');

      data.description = TextEditor.enrichHTML(data.description);

      data.questIconType = void 0;

      if (data.splashAsIcon && data.splash.length)
      {
         data.questIconType = 'splash-image';
      }
      else if (data.giverData && data.giverData.img)
      {
         data.questIconType = 'quest-giver';
      }

      data.statusLabel = game.i18n.localize(`ForienQuestLog.QuestTypes.Labels.${data.status}`);

      data.statusActions = Enrich.statusActions(quest);

      data.isSubquest = false;

      data.data_parent = {};

      if (data.parent !== null)
      {
         const parentQuest = QuestDB.getQuest(data.parent);
         if (parentQuest)
         {
            data.isSubquest = parentQuest.isObservable;

            data.data_parent = {
               id: data.parent,
               giver: parentQuest.giver,
               name: parentQuest.name,
               status: parentQuest.status
            };
         }
      }

      data.data_subquest = [];

      if (data.subquests !== void 0)
      {
         for (const questId of data.subquests)
         {
            const subquest = QuestDB.getQuest(questId);

            // isObservable filters out non-owned hidden quests for trustedPlayerEdit.
            if (subquest && subquest.isObservable)
            {
               // Mirror Task data for state / button state
               let state = 'square';
               switch (subquest.status)
               {
                  case questStatus.completed:
                     state = 'check-square';
                     break;
                  case questStatus.failed:
                     state = 'minus-square';
                     break;
               }

               const subPersonalActors = subquest.getPersonalActors();

               const isInactive = subquest.isInactive;

               const statusTooltipData = isInactive ?
                { statusI18n: game.i18n.localize(questStatusI18n[questStatus.inactive]) } :
                 { statusI18n: game.i18n.localize(questStatusI18n[subquest.status]) };

               const statusTooltip = game.i18n.format('ForienQuestLog.Tooltips.Status', statusTooltipData);

               const canEditSubquest = game.user.isGM || (subquest.isOwner && isTrustedPlayerEdit);

               data.data_subquest.push({
                  id: questId,
                  giver: subquest.giver,
                  name: subquest.name,
                  status: subquest.status,
                  statusTooltip,
                  state,
                  statusActions: Enrich.statusActions(subquest),
                  canEdit: canEditSubquest,
                  isHidden: subquest.isHidden,
                  isInactive,
                  isPersonal: subPersonalActors.length > 0,
                  personalActors: subPersonalActors.map((a) => a.name).sort((a, b) => a.localeCompare(b)).join('&#013;')
               });
            }
         }
      }

      if (countHidden)
      {
         data.checkedTasks = data.tasks.filter((t) => t.completed).length;

         const finishedSubquests = data.data_subquest.filter((s) => questStatus.completed === s.status).length;

         data.checkedTasks += finishedSubquests;

         data.totalTasks = data.tasks.length + data.subquests.length;
      }
      else
      {
         data.checkedTasks = data.tasks.filter((t) => !t.hidden && t.completed).length;

         const finishedSubquests = data.data_subquest.filter(
          (s) => !s.isObservable && !s.isInactive && questStatus.completed === s.status).length;

         data.checkedTasks += finishedSubquests;

         data.totalTasks = data.tasks.filter((t) => !t.hidden).length +
          data.data_subquest.filter((s) => !s.isObservable && !s.isInactive).length;
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

         const draggable = (canEdit || canPlayerDrag) && (canEdit || !item.locked) && type !== 'abstract';

         const lockedTooltip = canEdit ? game.i18n.localize('ForienQuestLog.Tooltips.RewardLocked') :
          game.i18n.localize('ForienQuestLog.Tooltips.RewardLockedPlayer');

         const unlockedTooltip = canEdit ? game.i18n.localize('ForienQuestLog.Tooltips.RewardUnlocked') :
          game.i18n.localize('ForienQuestLog.Tooltips.RewardUnlockedPlayer');

         // Defines if the pointer cursor is displayed. For abstract reward it always displayed for GM or when unlocked
         // for players.
         const abstractLink = type === 'abstract' && (canEdit || !item.locked);

         // For item rewards.
         const itemLink = type === 'item' && !canEdit && !canPlayerDrag && !item.locked;

         return {
            name: item.data.name,
            img: item.data.img,
            type,
            hidden: item.hidden,
            locked: item.locked,
            lockedTooltip,
            unlockedTooltip,
            isLink: abstractLink || itemLink,
            draggable,
            transfer: type !== 'abstract' ? JSON.stringify(
             { uuid: item.data.uuid, uuidv4: item.uuidv4, name: item.data.name }) : void 0,
            uuidv4: item.uuidv4
         };
      });

      if (!canEdit)
      {
         data.data_tasks = data.data_tasks.filter((t) => t.hidden === false);
         data.data_rewards = data.data_rewards.filter((r) => r.hidden === false);
      }

      data.hasObjectives = data.data_tasks.length + data.data_subquest.length > 0;

      return data;
   }
}

/**
 * @typedef {QuestData}    EnrichData
 *
 * @property {boolean}     canEdit - Is full editing allowed. Either GM or trusted player w/ edit capability.
 *
 * @property {number}      checkedTasks - Number of completed tasks.
 *
 * @property {object}      data_parent - A data object with parent quest details.
 *
 * @property {string|null} data_parent.id - The parent quest ID / {@link Quest.id}
 *
 * @property {string|null} data_parent.giver - The parent quest giver / {@link Quest.giver}
 *
 * @property {string}      data_parent.name - The parent quest name / {@link Quest.name}
 *
 * @property {string}      data_parent.status - The parent quest status / {@link Quest.status}
 *
 * @property {object[]}    data_rewards - A list of reward item details.
 *
 * @property {boolean}     data_rewards.draggable - Can the player drag the reward to actor sheet.
 *
 * @property {boolean}     data_rewards.hidden - Is the reward hidden / only 'canEdit' users can see it.
 *
 * @property {string}      data_rewards.img - The image for the reward.
 *
 * @property {boolean}     data_rewards.isLink - Is the reward a link / pointer cursor.
 *
 * @property {boolean}     data_rewards.locked - Is the reward locked / only 'canEdit' manipulate it.
 *
 * @property {string}      data_rewards.lockedTooltip - The tooltip to display for the locked icon.
 *
 * @property {string}      data_rewards.name - The name of the reward.
 *
 * @property {string}      data_rewards.type - The type of reward / 'abstract' for abstract rewards.
 *
 * @property {object}      data_rewards.transfer - The data tranfer object.
 *
 * @property {string}      data_rewards.transfer.name - The reward name.
 *
 * @property {string}      data_rewards.transfer.uuid - The reward Foundry UUID.
 *
 * @property {string}      data_rewards.transfer.uuidv4 - The reward FQL UUIDv4.
 *
 * @property {string}      data_rewards.unlockedTooltip - The tooltip to display for the unlocked icon.
 *
 * @property {string}      data_rewards.uuidv4 - The reward FQL UUIDv4.
 *
 * @property {object[]}    data_subquest - A list of data objects with subquest details.
 *
 * @property {boolean}     data_subquest.canEdit - Is full editing allowed. Either GM or trusted player w/ edit.
 *
 * @property {string|null} data_subquest.giver - The parent quest giver / {@link Quest.giver}
 *
 * @property {string|null} data_subquest.id - The parent quest ID / {@link Quest.id}
 *
 * @property {boolean}     data_subquest.isHidden - Is quest hidden by permissions / {@link Quest.isHidden}
 *
 * @property {boolean}     data_subquest.isInactive - Is quest status 'inactive'
 *
 * @property {boolean}     data_subquest.isPersonal - Is quest personal / {@link Quest.isPersonal}
 *
 * @property {string}      data_subquest.name - The parent quest name / {@link Quest.name}
 *
 * @property {string[]}    data_subquest.personalActors - A sorted list of names / {@link Quest.personalActors}
 *
 * @property {string}      data_subquest.state - The CSS class for quest toggle / task state
 *
 * @property {string}      data_subquest.status - The parent quest status / {@link Quest.status}
 *
 * @property {string}      data_subquest.statusActions - HTML for quest status actions / {@link Enrich.statusActions}
 *
 * @property {string}      data_subquest.statusTooltip - The localized quest status tooltip / {@link Quest.status}
 *
 * @property {QuestTaskData[]}  data_tasks - The task data.
 *
 * @property {string}      description - The enriched quest description via {@link TextEditor.enrichHTML}.
 *
 * @property {boolean}     hasObjectives - Is there visible tasks & subjects.
 *
 * @property {string}      id - Quest ID / {@link Quest.id}
 *
 * @property {boolean}     isHidden - Is quest hidden by permissions / {@link Quest.isHidden}
 *
 * @property {boolean}     isInactive - Is quest status 'inactive'
 *
 * @property {boolean}     isPersonal - Is quest personal / not all players can access it / {@link Quest.isPersonal}
 *
 * @property {boolean}     isSubquest - Is quest a subquest.
 *
 * @property {string[]}    personalActors - A sorted list of names for HTML tooltip / {@link Quest.personalActors}
 *
 * @property {string}      questIconType - Indicates which icon to use 'splash-image' or 'quest-giver'.
 *
 * @property {string}      statusActions - HTML for quest status icon actions / {@link Enrich.statusActions}
 *
 * @property {string}      statusLabel - Localized label for {@link Quest.status}
 *
 * @property {string}      taskCountLabel - A label of completed / total tasks depending on module settings.
 *
 * @property {number}      totalTasks - Number of total tasks.
 *
 * @property {string}      wrapNameLengthCSS - The CSS class to add for content length wrapping based on user type.
 */

/**
 * @typedef QuestImgNameData
 *
 * @property {string}   name - Quest giver or item name
 *
 * @property {string}   img - Quest giver or item image
 *
 * @property {boolean}  hasTokenImg - boolean indicating the quest giver has a token prototype image.
 *
 * @property {string}   [uuid] - Any associated Foundry UUID for the quest giver / item.
 */