import Enrich     from '../../plugins/system/Enrich.js';
import Socket     from '../../plugins/system/Socket.js';
import Utils      from '../../plugins/system/Utils.js';
import TQLDialog  from '../TQLDialog.js';

import { constants, jquery, settings } from '../../model/constants.js';

/**
 * Provides all {@link JQuery} callbacks for the `details` tab.
 */
export default class HandlerDetails
{
   /**
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent.
    *
    * @param {Quest}             quest - The current quest being manipulated.
    *
    * @param {QuestPreview}      questPreview - The QuestPreview being manipulated.
    */
   static questEditName(event, quest, questPreview)
   {
      const target = $(event.target).data('target');

      let value = quest[target];

      value = value.replace(/"/g, '&quot;');

      const input = $(`<input type="text" class="editable-input" value="${value}" data-target="${
       target}" maxlength="48"/>`);

      const parent = $(event.target).closest('.actions-single').prev('.editable-container');

      parent.html('');
      parent.append(input);
      input.trigger(jquery.focus);

      // If the HTMLElement has setSelectionRange then set cursor to the end.
      if (input[0]?.setSelectionRange) { input[0].setSelectionRange(value.length, value.length); }

      /**
       * Store the input focus callback in the associated QuestPreview instance so that it can be invoked if the app is
       * closed in {@link QuestPreview.close} while the input field is focused / being edited allowing any edits to be
       * saved. Otherwise the callback is invoked normally below as part of the input focus out event.
       *
       * @param {JQuery.FocusOutEvent|void}  event - JQuery.FocusOutEvent
       *
       * @param {object}      saveOptions - Options to pass to `saveQuest`; used in {@link QuestPreview.close}.
       *
       * @returns {Promise<void>}
       * @package
       *
       * @see {@link QuestPreview.close}
       * @see {@link QuestPreview._activeFocusOutFunction}
       */
      questPreview._activeFocusOutFunction = async (event, saveOptions = void 0) =>
      {
         const valueOut = input.val();
         questPreview._activeFocusOutFunction = void 0;

         switch (target)
         {
            case 'name':
               quest.name = valueOut;
               questPreview.options.title = game.i18n.format('TyphonJSQuestLog.QuestPreview.Title', quest);
               break;
         }
         await questPreview.saveQuest(saveOptions);
      };

      input.on(jquery.focusout, questPreview._activeFocusOutFunction);
      input.on(jquery.keydown, (event) =>
      {
         // Handle `Esc` key down to cancel editing.
         if (event.which === 27)
         {
            questPreview._activeFocusOutFunction = void 0;
            questPreview.render(true, { focus: true });
            return false;
         }
      });
   }

   /**
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @param {Quest}             quest - The current quest being manipulated.
    *
    * @param {QuestPreview}      questPreview - The QuestPreview being manipulated.
    */
   static questGiverCustomEditName(event, quest, questPreview)
   {
      const target = $(event.target).data('target');

      let value = quest[target];

      value = value.replace(/"/g, '&quot;');

      const input = $(`<input type="text" class="editable-input" value="${value}" data-target="${
       target}" maxlength="24"/>`);

      const parent = $(event.target).closest('.actions-single').prev('.editable-container');

      parent.css('flex', '0 0 230px');
      parent.html('');
      parent.append(input);
      input.trigger(jquery.focus);

      // If the HTMLElement has setSelectionRange then set cursor to the end.
      if (input[0]?.setSelectionRange) { input[0].setSelectionRange(value.length, value.length); }

      /**
       * Store the input focus callback in the associated QuestPreview instance so that it can be invoked if the app is
       * closed in {@link QuestPreview.close} while the input field is focused / being edited allowing any edits to be
       * saved. Otherwise the callback is invoked normally below as part of the input focus out event.
       *
       * @param {JQuery.FocusOutEvent|void}  event - JQuery.FocusOutEvent
       *
       * @param {object}      saveOptions - Options to pass to `saveQuest`; used in {@link QuestPreview.close}.
       *
       * @returns {Promise<void>}
       * @package
       *
       * @see {@link QuestPreview.close}
       * @see {@link QuestPreview._activeFocusOutFunction}
       */
      questPreview._activeFocusOutFunction = async (event, saveOptions = void 0) =>
      {
         const valueOut = input.val();
         questPreview._activeFocusOutFunction = void 0;

         switch (target)
         {
            case 'giverName':
               quest.giverName = valueOut;
               if (typeof quest.giverData === 'object') { quest.giverData.name = valueOut; }
               questPreview.options.title = game.i18n.format('TyphonJSQuestLog.QuestPreview.Title', quest);
               await questPreview.saveQuest(saveOptions);
               break;
         }
      };

      input.on(jquery.focusout, questPreview._activeFocusOutFunction);
      input.on(jquery.keydown, (event) =>
      {
         // Handle `Esc` key down to cancel editing.
         if (event.which === 27)
         {
            questPreview._activeFocusOutFunction = void 0;
            questPreview.render(true, { focus: true });
            return false;
         }
      });
   }

   /**
    * @param {Quest}          quest - The current quest being manipulated.
    *
    * @param {QuestPreview}   questPreview - The QuestPreview being manipulated.
    */
   static questGiverCustomSelectImage(quest, questPreview)
   {
      const currentPath = quest.giver === 'abstract' ? quest.image : void 0;

      new FilePicker({
         type: 'image',
         current: currentPath,
         callback: async (path) =>
         {
            quest.giver = 'abstract';
            quest.image = path;
            quest.giverName = game.i18n.localize('TyphonJSQuestLog.QuestPreview.CustomSource');
            quest.giverData = await Enrich.giverFromQuest(quest);
            delete quest.giverData.uuid;

            await questPreview.saveQuest();
         },
      }).browse(currentPath);
   }

   /**
    * @param {Quest}          quest - The current quest being manipulated.
    *
    * @param {QuestPreview}   questPreview - The QuestPreview being manipulated.
    *
    * @returns {Promise<void>}
    */
   static async questGiverDelete(quest, questPreview)
   {
      quest.resetGiver();
      return questPreview.saveQuest();
   }

   /**
    * @param {JQuery.DropEvent}  event - JQuery.DropEvent
    *
    * @param {Quest}             quest - The current quest being manipulated.
    *
    * @param {QuestPreview}      questPreview - The QuestPreview being manipulated.
    *
    * @returns {Promise<void>}
    */
   static async questGiverDropDocument(event, quest, questPreview)
   {
      event.preventDefault();

      const data = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));

      if (typeof data.id === 'string')
      {
         const uuid = Utils.getUUID(data, ['Actor', 'Item', 'JournalEntry']);

         const giverData = await Enrich.giverFromUUID(uuid);
         if (giverData)
         {
            quest.giver = uuid;
            quest.giverData = giverData;
            await questPreview.saveQuest();
         }
         else
         {
            ui.notifications.warn(game.i18n.format('TyphonJSQuestLog.QuestPreview.Notifications.BadUUID', { uuid }));
         }
      }
      else
      {
         // Document has data, but lacks a UUID, so it is a data copy. Inform user that quest giver may only be
         // from world and compendium sources with a UUID.
         if (typeof data.data === 'object')
         {
            ui.notifications.warn(game.i18n.localize('TyphonJSQuestLog.QuestPreview.Notifications.WrongDocType'));
         }
      }
   }

   /**
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent.
    *
    * @param {QuestPreview}      questPreview - The QuestPreview being manipulated.
    *
    * @returns {Promise<void>}
    */
   static async questGiverShowActorSheet(event, questPreview)
   {
      const uuid = $(event.target).data('actor-uuid');

      if (typeof uuid === 'string' && uuid.length)
      {
         const appId = await Utils.showSheetFromUUID(uuid, { editable: false });

         // If a new sheet is rendered push it to the opened appIds.
         if (appId && !questPreview._openedAppIds.includes(appId)) { questPreview._openedAppIds.push(appId); }
      }
   }

   /**
    * @param {Quest}          quest - The current quest being manipulated.
    *
    * @param {QuestPreview}   questPreview - The QuestPreview being manipulated.
    *
    * @returns {Promise<void>}
    */
   static async questGiverToggleImage(quest, questPreview)
   {
      quest.toggleImage();

      const giverData = await Enrich.giverFromQuest(quest);
      if (giverData)
      {
         quest.giverData = giverData;
         await questPreview.saveQuest();
      }
   }

   /**
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @param {Quest}             quest - The current quest being manipulated.
    *
    * @param {QuestPreview}      questPreview - The QuestPreview being manipulated.
    */
   static rewardAbstractEditName(event, quest, questPreview)
   {
      const target = $(event.target).data('target');

      let value = quest[target];
      let uuidv4;

      if (target === 'reward.name')
      {
         uuidv4 = $(event.target).data('uuidv4');

         const reward = quest.getReward(uuidv4);
         if (!reward) { return; }

         value = reward.name;
      }

      value = value.replace(/"/g, '&quot;');

      const input = $(`<input type="text" class="editable-input" value="${value}" data-target="${target}" ${
       uuidv4 !== void 0 ? `data-uuidv4="${uuidv4}"` : ``} maxlength="96"/>`);

      // This consumes any clicks on the input element preventing the abstract reward image popup from showing when
      // clicking on the input element.
      input.on(jquery.click, (event) => { event.stopImmediatePropagation(); });

      const parent = $(event.target).closest('.actions').prev('.editable-container');

      parent.html('');
      parent.append(input);
      input.trigger(jquery.focus);

      // If the HTMLElement has setSelectionRange then set cursor to the end.
      if (input[0]?.setSelectionRange) { input[0].setSelectionRange(value.length, value.length); }

      /**
       * Store the input focus callback in the associated QuestPreview instance so that it can be invoked if the app is
       * closed in {@link QuestPreview.close} while the input field is focused / being edited allowing any edits to be
       * saved. Otherwise the callback is invoked normally below as part of the input focus out event.
       *
       * @param {JQuery.FocusOutEvent|void}  event - JQuery.FocusOutEvent
       *
       * @param {object}      saveOptions - Options to pass to `saveQuest`; used in {@link QuestPreview.close}.
       *
       * @returns {Promise<void>}
       * @package
       *
       * @see {@link QuestPreview.close}
       * @see {@link QuestPreview._activeFocusOutFunction}
       */
      questPreview._activeFocusOutFunction = async (event, saveOptions = void 0) =>
      {
         const valueOut = input.val();
         questPreview._activeFocusOutFunction = void 0;

         switch (target)
         {
            case 'reward.name':
            {
               uuidv4 = input.data('uuidv4');
               const reward = quest.getReward(uuidv4);
               if (!reward) { return; }

               reward.data.name = valueOut;
               await questPreview.saveQuest(saveOptions);
               break;
            }
         }
      };

      input.on(jquery.focusout, questPreview._activeFocusOutFunction);
      input.on(jquery.keydown, (event) =>
      {
         // Handle `Esc` key down to cancel editing.
         if (event.which === 27)
         {
            questPreview._activeFocusOutFunction = void 0;
            questPreview.render(true, { focus: true });
            return false;
         }
      });
   }

   /**
    * Creates a new abstract reward if the input entry is successful or contains data and a focus out event occurs.
    *
    * The module setting: {@link TQLSettings.defaultAbstractRewardImage} stores the default abstract reward image.
    *
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @param {Quest}             quest - The current quest being manipulated.
    *
    * @param {QuestPreview}      questPreview - The QuestPreview being manipulated.
    */
   static rewardAddAbstract(event, quest, questPreview)
   {
      const li = $('<li class="reward"></li>');

      const input = $(`<input type="text" class="editable-input" value="" placeholder="" maxlength="96"/>`);

      const box = $(event.target).closest('.quest-rewards').find('.rewards-box ul');

      li.append(input);
      box.append(li);

      input.trigger(jquery.focus);

      input.on(jquery.focusout, async (event) =>
      {
         const value = $(event.target).val();
         if (value !== void 0 && value.length)
         {
            quest.addReward({
               data: {
                  name: value,
                  img: game.settings.get(constants.moduleName, settings.defaultAbstractRewardImage)
               },
               hidden: true,
               type: 'Abstract'
            });
         }
         await questPreview.saveQuest();
      });
      input.on(jquery.keydown, (event) =>
      {
         // Handle `Esc` key down to cancel editing.
         if (event.which === 27)
         {
            questPreview.render(true, { focus: true });
            return false;
         }
      });
   }

   /**
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @param {Quest}             quest - The current quest being manipulated.
    *
    * @param {QuestPreview}      questPreview - The QuestPreview being manipulated.
    *
    * @returns {Promise<void>}
    */
   static async rewardDelete(event, quest, questPreview)
   {
      const target = $(event.target);
      const uuidv4 = target.data('uuidv4');
      const name = target.data('reward-name');

      // Await a semi-modal dialog.
      const result = await TQLDialog.confirmDeleteReward({ name, result: uuidv4, questId: quest.id });
      if (result)
      {
         quest.removeReward(result);

         await questPreview.saveQuest();
      }
   }

   /**
    * @param {JQuery.DragStartEvent}   event - JQuery.DragStartEvent
    *
    * @param {Quest}                   quest - The current quest being manipulated.
    */
   static async rewardDragStartItem(event, quest)
   {
      const data = $(event.target).data('transfer');

      const document = await Utils.getDocumentFromUUID(data, { permissionCheck: false });
      if (document)
      {
         const uuidData = Utils.getDataFromUUID(data);

         /**
          * @type {RewardDropData}
          */
         const dataTransfer = {
            _tqlData: {
               type: 'reward',
               questId: quest.id,
               uuidv4: data.uuidv4,
               itemName: data.name,
               userName: game.user.name,
            },
            type: 'Item',
            data: document.data,
            uuid: data.uuid,
            id: document.id
         };

         // Add compendium pack info if applicable
         if (uuidData && uuidData.pack) { dataTransfer.pack = uuidData.pack; }

         event.originalEvent.dataTransfer.setData('text/plain', JSON.stringify(dataTransfer));
      }
   }

   /**
    * @param {JQuery.DragStartEvent}   event - JQuery.DragStartEvent
    */
   static rewardDragStartSort(event)
   {
      event.stopPropagation();

      const li = event.target.closest('li') || null;
      if (!li) { return; }

      const dataTransfer = {
         type: 'Reward',
         mode: 'Sort',
         uuidv4: $(li).data('uuidv4')
      };
      event.originalEvent.dataTransfer.setData('text/plain', JSON.stringify(dataTransfer));
   }

   /**
    * Handles an external item reward drop. Also handles the sort reward item drop.
    *
    * @param {JQuery.DropEvent}  event - JQuery.DropEvent
    *
    * @param {Quest}             quest - The current quest being manipulated.
    *
    * @param {QuestPreview}      questPreview - The QuestPreview being manipulated.
    *
    * @returns {Promise<void>}
    */
   static async rewardDropItem(event, quest, questPreview)
   {
      event.preventDefault();

      let data;
      try
      {
         data = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));
      }
      catch (e)
      {
         return;
      }

      if (data.mode === 'Sort' && data.type === 'Reward')
      {
         const dt = event.target.closest('li.reward') || null;
         quest.sortRewards(data.uuidv4, dt?.dataset.uuidv4);
         await quest.save();
         Socket.refreshQuestPreview({ questId: quest.id });
      }

      if (data.type === 'Item' && data._tqlData === void 0)
      {
         if (typeof data.id === 'string')
         {
            const uuid = Utils.getUUID(data);

            const item = await Enrich.giverFromUUID(uuid);
            if (item)
            {
               quest.addReward({ type: 'Item', data: item, hidden: true });
               await questPreview.saveQuest();
            }
            else
            {
               ui.notifications.warn(game.i18n.format('TyphonJSQuestLog.QuestPreview.Notifications.BadUUID', { uuid }));
            }
         }
         else
         {
            // Document has data, but lacks a UUID, so it is a data copy. Inform user that rewards may only be
            // items that are backed by a document with a UUID.
            if (typeof data.data === 'object')
            {
               ui.notifications.warn(game.i18n.localize('TyphonJSQuestLog.QuestPreview.Notifications.WrongItemType'));
            }
         }
      }
   }

   /**
    * @param {Quest}          quest - The current quest being manipulated.
    *
    * @param {QuestPreview}   questPreview - The QuestPreview being manipulated.
    *
    * @returns {Promise<void>}
    */
   static async rewardsHideAll(quest, questPreview)
   {
      for (const reward of quest.rewards) {  reward.hidden = true; }
      if (quest.rewards.length) { await questPreview.saveQuest(); }
   }

   /**
    * @param {Quest}          quest - The current quest being manipulated.
    *
    * @param {QuestPreview}   questPreview - The QuestPreview being manipulated.
    *
    * @returns {Promise<void>}
    */
   static async rewardsLockAll(quest, questPreview)
   {
      for (const reward of quest.rewards) {  reward.locked = true; }
      if (quest.rewards.length) { await questPreview.saveQuest(); }
   }

   /**
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @param {Quest}             quest - The current quest being manipulated.
    *
    * @param {QuestPreview}      questPreview - The QuestPreview being manipulated.
    *
    * @returns {Promise<void>}
    */
   static async rewardSelectAbstractImage(event, quest, questPreview)
   {
      const uuidv4 = $(event.target).data('uuidv4');

      let reward = quest.getReward(uuidv4);
      if (!reward) { return; }

      const currentPath = reward.data.img;
      await new FilePicker({
         type: 'image',
         current: currentPath,
         callback: async (path) =>
         {
            reward = quest.getReward(uuidv4);
            if (reward)
            {
               reward.data.img = path;
               await questPreview.saveQuest();
            }
         },
      }).browse(currentPath);
   }

   /**
    * @param {Quest}          quest - The current quest being manipulated.
    *
    * @param {QuestPreview}   questPreview - The QuestPreview being manipulated.
    *
    * @returns {Promise<void>}
    */
   static async rewardsShowAll(quest, questPreview)
   {
      for (const reward of quest.rewards) {  reward.hidden = false; }
      if (quest.rewards.length) { await questPreview.saveQuest(); }
   }

   /**
    * If an abstract reward has an image set then show an image popout.
    *
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent.
    *
    * @param {Quest}             quest - The current quest being manipulated.
    *
    * @param {QuestPreview}      questPreview - The QuestPreview being manipulated.
    *
    * @returns {Promise<void>}
    */
   static async rewardShowImagePopout(event, quest, questPreview)
   {
      // Check the event target and make sure it is `p.reward-name` otherwise early out.
      if (event.target && !$(event.target).is('p.reward-name')) { return; }

      event.stopPropagation();

      const uuidv4 = $(event.currentTarget).data('uuidv4');

      const reward = quest.getReward(uuidv4);

      if (reward && (questPreview.canEdit || !reward.locked))
      {
         if (questPreview._rewardImagePopup !== void 0 && questPreview._rewardImagePopup.rendered)
         {
            if (reward.data?.img?.length)
            {
               questPreview._rewardImagePopup.object = reward.data.img;
               questPreview._rewardImagePopup.render(true);
               questPreview._rewardImagePopup.bringToTop();
            }
         }
         else
         {
            if (reward.data?.img?.length)
            {
               questPreview._rewardImagePopup = new ImagePopout(reward.data.img, { shareable: true });
               questPreview._rewardImagePopup.render(true);
            }
         }
      }
   }

   /**
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent.
    *
    * @param {Quest}             quest - The current quest being manipulated.
    *
    * @param {QuestPreview}      questPreview - The QuestPreview being manipulated.
    *
    * @returns {Promise<void>}
    */
   static async rewardShowItemSheet(event, quest, questPreview)
   {
      event.stopPropagation();
      const data = $(event.currentTarget).data('transfer');
      const uuidv4 = $(event.currentTarget).data('uuidv4');

      const reward = quest.getReward(uuidv4);

      if (reward && (questPreview.canEdit || !reward.locked))
      {
         const appId = await Utils.showSheetFromUUID(data, { permissionCheck: false, editable: false });

         // If a new sheet is rendered push it to the opened appIds.
         if (appId && !questPreview._openedAppIds.includes(appId)) { questPreview._openedAppIds.push(appId); }
      }
   }

   /**
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @param {Quest}             quest - The current quest being manipulated.
    *
    * @param {QuestPreview}      questPreview - The QuestPreview being manipulated.
    *
    * @returns {Promise<void>}
    */
   static async rewardToggleHidden(event, quest, questPreview)
   {
      const uuidv4 = $(event.target).data('uuidv4');
      const reward = quest.getReward(uuidv4);
      if (reward)
      {
         reward.toggleVisible();
         await questPreview.saveQuest();
      }
   }

   /**
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @param {Quest}             quest - The current quest being manipulated.
    *
    * @param {QuestPreview}      questPreview - The QuestPreview being manipulated.
    *
    * @returns {Promise<void>}
    */
   static async rewardToggleLocked(event, quest, questPreview)
   {
      const uuidv4 = $(event.target).data('uuidv4');
      const reward = quest.getReward(uuidv4);
      if (reward)
      {
         reward.toggleLocked();
         await questPreview.saveQuest();
      }
   }

   /**
    * @param {Quest}          quest - The current quest being manipulated.
    *
    * @param {QuestPreview}   questPreview - The QuestPreview being manipulated.
    *
    * @returns {Promise<void>}
    */
   static async rewardsUnlockAll(quest, questPreview)
   {
      for (const reward of quest.rewards) {  reward.locked = false; }
      if (quest.rewards.length) { await questPreview.saveQuest(); }
   }

   /**
    * @param {Quest}          quest - The current quest being manipulated.
    *
    * @param {QuestPreview}   questPreview - The QuestPreview being manipulated.
    */
   static async splashImagePopupShow(quest, questPreview)
   {
      if (questPreview._splashImagePopup !== void 0 && questPreview._splashImagePopup.rendered)
      {
         questPreview._splashImagePopup.bringToTop();
      }
      else
      {
         questPreview._splashImagePopup = new ImagePopout(quest.splash, { shareable: true });
         questPreview._splashImagePopup.render(true);
      }
   }

   /**
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @param {Quest}             quest - The current quest being manipulated.
    *
    * @param {QuestPreview}      questPreview - The QuestPreview being manipulated.
    */
   static taskAdd(event, quest, questPreview)
   {
      event.preventDefault();

      const li = $('<li class="task"></li>');

      const placeholder = $('<span><i class="fas fa-check hidden"></i></span>');

      const input = $(`<input type="text" class="editable-input" value="" placeholder="" />`);

      const box = $(event.target).closest('.quest-tasks').find('.tasks-box ul');

      li.append(placeholder);
      li.append(input);
      box.append(li);

      input.trigger(jquery.focus);

      input.on(jquery.focusout, async (event) =>
      {
         const value = $(event.target).val();
         if (value !== void 0 && value.length)
         {
            quest.addTask({ name: value, hidden: questPreview.canEdit });
         }
         await questPreview.saveQuest();
      });
      input.on(jquery.keydown, (event) =>
      {
         // Handle `Esc` key down to cancel editing.
         if (event.which === 27)
         {
            questPreview.render(true, { focus: true });
            return false;
         }
      });
   }

   /**
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @param {Quest}             quest - The current quest being manipulated.
    *
    * @param {QuestPreview}      questPreview - The QuestPreview being manipulated.
    *
    * @returns {Promise<void>}
    */
   static async taskDelete(event, quest, questPreview)
   {
      const target = $(event.target);
      const uuidv4 = target.data('uuidv4');
      const name = target.data('task-name');

      const result = await TQLDialog.confirmDeleteTask({ name, result: uuidv4, questId: quest.id });
      if (result)
      {
         quest.removeTask(result);

         await questPreview.saveQuest();
      }
   }

   /**
    * @param {JQuery.DragStartEvent}   event - JQuery.DragStartEvent
    */
   static taskDragStartSort(event)
   {
      event.stopPropagation();

      const li = event.target.closest('li') || null;
      if (!li) { return; }

      const dataTransfer = {
         type: 'Task',
         mode: 'Sort',
         uuidv4: $(li).data('uuidv4')
      };

      event.originalEvent.dataTransfer.setData('text/plain', JSON.stringify(dataTransfer));
   }

   /**
    * @param {JQuery.DropEvent}  event - JQuery.DropEvent
    *
    * @param {Quest}             quest - The current quest being manipulated.
    *
    * @returns {Promise<void>}
    */
   static async taskDropItem(event, quest)
   {
      event.preventDefault();

      const data = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));

      if (data.mode === 'Sort' && data.type === 'Task')
      {
         const dt = event.target.closest('li.task') || null;
         quest.sortTasks(data.uuidv4, dt?.dataset.uuidv4);
         await quest.save();
         Socket.refreshQuestPreview({ questId: quest.id });
      }
   }

   /**
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @param {Quest}             quest - The current quest being manipulated.
    *
    * @param {QuestPreview}      questPreview - The QuestPreview being manipulated.
    */
   static taskEditName(event, quest, questPreview)
   {
      const target = $(event.target).data('target');
      let uuidv4 = $(event.target).data('uuidv4');
      let task = quest.getTask(uuidv4);

      // Early out conditional if the target isn't `task.name` or the task doesn't exist.
      if (target === void 0 || target !== 'task.name' || !task) { return; }

      let value = task.name;

      value = value.replace(/"/g, '&quot;');

      const input = $(`<input type="text" class="editable-input" value="${value}" data-target="${target}" ${
       uuidv4 !== void 0 ? `data-uuidv4="${uuidv4}"` : ``}/>`);

      const parent = $(event.target).closest('.actions').prev('.editable-container');

      parent.html('');
      parent.append(input);
      input.trigger(jquery.focus);

      // If the HTMLElement has setSelectionRange then set cursor to the end.
      if (input[0]?.setSelectionRange) { input[0].setSelectionRange(value.length, value.length); }

      /**
       * Store the input focus callback in the associated QuestPreview instance so that it can be invoked if the app is
       * closed in {@link QuestPreview.close} while the input field is focused / being edited allowing any edits to be
       * saved. Otherwise the callback is invoked normally below as part of the input focus out event.
       *
       * @param {JQuery.FocusOutEvent|void}  event -JQuery.FocusOutEvent
       *
       * @param {object}      saveOptions - Options to pass to `saveQuest`; used in {@link QuestPreview.close}.
       *
       * @returns {Promise<void>}
       * @protected
       * @see {@link QuestPreview.close}
       * @see {@link QuestPreview._activeFocusOutFunction}
       */
      questPreview._activeFocusOutFunction = async (event, saveOptions = void 0) =>
      {
         const valueOut = input.val();
         questPreview._activeFocusOutFunction = void 0;

         switch (target)
         {
            case 'task.name':
            {
               uuidv4 = input.data('uuidv4');
               task = quest.getTask(uuidv4);
               if (task)
               {
                  task.name = valueOut;
                  await questPreview.saveQuest(saveOptions);
               }
               break;
            }
         }
      };

      input.on(jquery.focusout, questPreview._activeFocusOutFunction);
      input.on(jquery.keydown, (event) =>
      {
         // Handle `Esc` key down to cancel editing.
         if (event.which === 27)
         {
            questPreview._activeFocusOutFunction = void 0;
            questPreview.render(true, { focus: true });
            return false;
         }
      });
   }

   /**
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @param {Quest}             quest - The current quest being manipulated.
    *
    * @param {QuestPreview}      questPreview - The QuestPreview being manipulated.
    *
    * @returns {Promise<void>}
    */
   static async taskToggleHidden(event, quest, questPreview)
   {
      const uuidv4 = $(event.target).data('uuidv4');
      const task = quest.getTask(uuidv4);
      if (task)
      {
         task.toggleVisible();
         await questPreview.saveQuest();
      }
   }

   /**
    * @param {JQuery.ClickEvent} event - JQuery.ClickEvent
    *
    * @param {Quest}             quest - The current quest being manipulated.
    *
    * @param {QuestPreview}      questPreview - The QuestPreview being manipulated.
    *
    * @returns {Promise<void>}
    */
   static async taskToggleState(event, quest, questPreview)
   {
      const uuidv4 = $(event.target).data('uuidv4');

      const task = quest.getTask(uuidv4);
      if (task)
      {
         task.toggle();
         await questPreview.saveQuest();
      }
   }
}

/**
 * @typedef {object} TQLDropData An object attached to drop data transfer which describes the TQL reward item and who
 *                               is dropping it into an actor sheet.
 *
 * @property {string} type - The type of TQL drop data; one of: ['reward']
 *
 * @property {string} questId - The Quest ID
 *
 * @property {string} uuidv4 - The associated UUIDv4 of a quest reward.
 *
 * @property {string} itemName - The reward item name.
 *
 * @property {string} userName - The user name who is dropping the item.
 */

/**
 * @typedef {object} RewardDropData
 *
 * @property {TQLDropData} _tqlData - TQL drop data used to remove the reward from a quest.
 *
 * @property {string}      type - Type of document.
 *
 * @property {object}      data - Document data.
 *
 * @property {string}      uuid - The UUID of the document.
 *
 * @property {id}          id - The ID of the document.
 */
