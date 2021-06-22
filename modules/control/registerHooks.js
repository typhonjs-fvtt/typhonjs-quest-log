import Enrich                                from './Enrich.js';
import Fetch                                 from './Fetch.js';
import Utils                                 from './Utils.js';
import Socket                                from './Socket.js';
import { constants, noteControls, settings } from '../model/constants.js';

/**
 * Function for registering API-related Hooks.
 */
export default function registerHooks()
{
   const fqlPublicAPI = Utils.getFQLPublicAPI();

   // Open quest log
   Hooks.on('ForienQuestLog.Open.QuestLog', () =>
   {
      if (game.user.isGM || !game.settings.get(constants.moduleName, settings.hideFQLFromPlayers))
      {
         fqlPublicAPI.questLog.render(true, { focus: true });
      }
   });

   // Open quest log floating window
   Hooks.on('ForienQuestLog.Open.QuestLogFloating', () =>
   {
      if (game.user.isGM || !game.settings.get(constants.moduleName, settings.hideFQLFromPlayers))
      {
         fqlPublicAPI.questLogFloating.render(true, { focus: true });
      }
   });

   Hooks.on('dropActorSheetData', async (actor, sheet, data) =>
   {
      if (typeof data !== 'object' || typeof data._fqlQuestId !== 'string') { return; }

      Socket.questRewardDrop({
         actor: { id: actor.id, name: actor.data.name },
         sheet: { id: sheet.id },
         data
      });
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

         const command = `game.modules.get('${constants.moduleName}').public.QuestAPI.open({ questId: '${questId}' });`;

         const macroData = {
            name: game.i18n.format('ForienQuestLog.Api.hooks.createOpenQuestMacro.name', { name: quest.name }),
            type: 'script',
            command
         };

         macroData.img = quest.splash.length ? quest.splash : (await Enrich.giverFromQuest(quest)).img;

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
      if (game.user.isGM || !game.settings.get(constants.moduleName, settings.hideFQLFromPlayers))
      {
         const notes = controls.find((c) => c.name === 'notes');
         if (notes) { notes.tools.push(...noteControls); }
      }
   });
}
