/**
 * Provides creating dialog data for various delete dialogs using {@link TJSDialog}. The delete dialogs are modal and
 * not draggable.
 */
export class CreateDialogData
{
   static #commonDeleteData;

   static createDeleteQuest(name)
   {
      return foundry.utils.mergeObject({
         title: game.i18n.format('TyphonJSQuestLog.DeleteDialog.TitleDel', {
            title: game.i18n.localize('TyphonJSQuestLog.Quest')
         }),
         content: `<h3>${game.i18n.format('TyphonJSQuestLog.DeleteDialog.HeaderDel', { name })}</h3><p>${
          game.i18n.localize('TyphonJSQuestLog.DeleteDialog.BodyQuest')}</p>`,
      }, this.#commonDeleteData);
   }

   static createDeleteReward(name)
   {
      return foundry.utils.mergeObject({
         title: game.i18n.format('TyphonJSQuestLog.DeleteDialog.TitleDel', {
            title: game.i18n.localize('TyphonJSQuestLog.QuestPreview.Reward')
         }),
         content: `<h3>${game.i18n.format('TyphonJSQuestLog.DeleteDialog.HeaderDel', { name })}</h3><p>${
          game.i18n.localize('TyphonJSQuestLog.DeleteDialog.BodyReward')}</p>`,
      }, this.#commonDeleteData);
   }

   static createDeleteTask(name)
   {
      return foundry.utils.mergeObject({
         title: game.i18n.format('TyphonJSQuestLog.DeleteDialog.TitleDel', {
            title: game.i18n.localize('TyphonJSQuestLog.QuestPreview.Objective')
         }),
         content: `<h3>${game.i18n.format('TyphonJSQuestLog.DeleteDialog.HeaderDel', { name })}</h3><p>${
          game.i18n.localize('TyphonJSQuestLog.DeleteDialog.BodyObjective')}</p>`,
      }, this.#commonDeleteData);
   }

   static onPluginLoad(ev)
   {
      ev.eventbus.on('tql:data:dialog:quest:delete:get', this.createDeleteQuest, this);
      ev.eventbus.on('tql:data:dialog:reward:delete:get', this.createDeleteReward, this);
      ev.eventbus.on('tql:data:dialog:task:delete:get', this.createDeleteTask, this);

      // Creates the common data shared between all delete dialogs.
      this.#commonDeleteData = {
         draggable: false,
         modal: true,
         buttons: {
            yes: {
               icon: '<i class="fas fa-trash"></i>',
               label: game.i18n.localize('TyphonJSQuestLog.DeleteDialog.Delete'),
            },
            no: {
               icon: '<i class="fas fa-times"></i>',
               label: game.i18n.localize('TyphonJSQuestLog.DeleteDialog.Cancel'),
            }
         }
      };
   }
}