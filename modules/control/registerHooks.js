import Fetch         from '../control/Fetch.js';
import { constants } from '../model/constants.js';
import ViewData      from '../view/ViewData.js';
import Utils         from '../utils/Utils.js';

/**
 * Function for registering API-related Hooks.
 */
export default function registerHooks()
{
   const fqlPublicAPI = Utils.getFQLPublicAPI();

   // Open quest log
   Hooks.on('ForienQuestLog.Open.QuestLog', () =>
   {
      fqlPublicAPI.questLog.render(true, { focus: true });
   });

   // Open quest log floating window
   Hooks.on('ForienQuestLog.Open.QuestLogFloating', () =>
   {
      fqlPublicAPI.questLogFloating.render(true, { focus: true });
   });

   // Create 'open quest' Macro when Quest is dropped onto Hotbar.
   Hooks.on('hotbarDrop', async (bar, data, slot) =>
   {
      if (data.type === 'Quest')
      {
         const questId = data.id;

         const quest = Fetch.quest(questId);
         if (!quest)
         {
            throw new Error(game.i18n.localize('ForienQuestLog.Api.hooks.createOpenQuestMacro.error.noQuest'));
         }

         const command = `game.modules.get('${constants.moduleName}').public.QuestAPI.open('${questId}');`;

         const macroData = {
            name: game.i18n.format('ForienQuestLog.Api.hooks.createOpenQuestMacro.name', { name: quest.title }),
            type: 'script',
            command
         };

         macroData.img = quest.splash.length ? quest.splash : (await ViewData.giverFromQuest(quest)).img;

         let macro = game.macros.contents.find((m) => (m.data.command === command));
         if (!macro)
         {
            macro = await Macro.create(macroData, { displaySheet: false });
         }

         game.user.assignHotbarMacro(macro, slot);
      }
      return false;
   });

   Hooks.on('getSceneControlButtons', (controls) =>
   {
      const notes = controls.find((c) => c.name === 'notes');

      notes.tools.push({
         name: 'forien-quest-log',
         title: 'ForienQuestLog.QuestLogButton',
         icon: 'fas fa-scroll',
         visible: true,
         onClick: () => fqlPublicAPI.questLog.render(true, { focus: true }),
         button: true
      });

      notes.tools.push({
         name: 'forien-quest-log-floating-window',
         title: 'ForienQuestLog.FloatingQuestWindow',
         icon: 'fas fa-tasks',
         visible: true,
         onClick: () => fqlPublicAPI.questLogFloating.render(true, { focus: true }),
         button: true
      });
   });
}