/**
 * Create the context menu. There are two separate context menus for the active / in progress tab and all other tabs.
 *
 * @param {object}   opts - Required options.
 *
 * @param {string}   opts.questId - The UUID for the quest / journal entry.
 *
 * @param {string}   opts.name - The quest name.
 *
 * @param {Eventbus} opts.eventbus - The Plugin manager eventbus.
 *
 * @returns {object[]} An array of menu items for TJSMenu.
 */
export default function createMenuItems({ questId, name, eventbus })
{
   const menuItemCopyLink = {
      label: 'TyphonJSQuestLog.QuestLog.ContextMenu.CopyEntityLink',
      icon: 'fas fa-link',
      onclick: () =>
      {
         const success = eventbus.triggerSync('tql:utils:copy:text:to:clipboard', `@Quest[${questId}]{${name}}`);

         if (success)
         {
            ui.notifications.info(game.i18n.format('TyphonJSQuestLog.Notifications.LinkCopied'));
         }
      }
   };

   /**
    * @type {object[]}
    */
   const menuItems = [menuItemCopyLink];

   if (game.user.isGM)
   {
      menuItems.push({
         label: 'TyphonJSQuestLog.QuestLog.ContextMenu.CopyQuestID',
         icon: 'fas fa-key',
         onclick: () =>
         {
            const success = eventbus.triggerSync('tql:utils:copy:text:to:clipboard', questId);

            if (success)
            {
               ui.notifications.info(game.i18n.format('TyphonJSQuestLog.Notifications.QuestIDCopied'));
            }
         }
      });

      menuItems.push({
         label: 'TyphonJSQuestLog.QuestLog.ContextMenu.PrimaryQuest',
         icon: 'fas fa-star',
         onclick: () =>
         {
            const quest = eventbus.triggerSync('tql:questdb:quest:get', questId);

            if (quest) { eventbus.trigger('tql:socket:set:quest:primary', { quest }); }
         }
      });
   }

   return menuItems;
}