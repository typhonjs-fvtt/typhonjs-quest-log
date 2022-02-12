import Quest            from './plugins/system/database/Quest.js';
import QuestCollection  from './plugins/data/QuestCollection.js';

import QuestPreview     from './view/preview/QuestPreview.js';

import PluginLoader     from './plugins/PluginLoader.js';
import { eventbus }     from './plugins/PluginManager.js';

import { constants, sessionConstants, settings } from '#constants';
import PositionValidator from "./view/tracker2/PositionValidator.js";

/**
 * Provides implementations for all Foundry hooks that TQL responds to and registers under. Please view the
 * {@link QuestDB} documentation for hooks that it fires in the QuestDB lifecycle.
 *
 * Foundry lifecycle:
 * - `init` - {@link TQLHooks.foundryInit}
 * - `ready` - {@link TQLHooks.foundryReady} - A hook `TyphonJSQuestLog.Lifecycle.ready` is fired after TQL is ready.
 *
 * Foundry game hooks:
 * - `collapseSidebar` - {@link FoundryUIManager.collapseSidebar} - Handle tracking state of the sidebar.
 * - `dropActorSheetData` - {@link TQLHooks.dropActorSheetData} - Handle drop data for reward items in actor sheet.
 * - `dropCanvasData` - {@link TQLHooks.dropCanvasData} - Handle drop data for {@link Quest} on Foundry canvas.
 * - `getSceneControlButtons` - {@link TQLHooks.getSceneControlButtons} - Add TQL scene controls to 'note'.
 * - `hotbarDrop` - {@link TQLHooks.hotbarDrop} - Handle {@link Quest} drops to the macro hotbar.
 * - `renderJournalDirectory` - {@link TQLHooks.renderJournalDirectory} - Add 'open quest log' / show TQL folder.
 * - `renderJournalSheet` - {@link TQLHooks.renderJournalSheet} - Hide TQL directory from journal sheet option items.
 *
 * TQL hooks (response):
 * - `TyphonJSQuestLog.Open.QuestLog` - {@link TQLHooks.openQuestLog} - Open the quest log.
 * - `TyphonJSQuestLog.Open.QuestTracker` - {@link TQLHooks.openQuestTracker} - Open the quest tracker.
 * - `TyphonJSQuestLog.Run.DBMigration` - {@link TQLHooks.runDBMigration} - Allow GMs to run the DBMigration manually.
 *
 * TQL hooks (called):
 * - `TyphonJSQuestLog.Lifecycle.ready` - {@link TQLHooks.foundryReady} - Called at the end of the `ready` hook when TQL
 * is fully setup.
 */
export default class TQLHooks
{
   /**
    * Initializes all hooks that TQL responds to in the Foundry lifecycle and in game hooks.
    */
   static init()
   {
      // Foundry startup hooks.
      Hooks.once('init', TQLHooks.foundryInit);
      Hooks.once('ready', TQLHooks.foundryReady);

      // Respond to Foundry in game hooks.
      Hooks.on('dropActorSheetData', TQLHooks.dropActorSheetData);
      Hooks.on('dropCanvasData', TQLHooks.dropCanvasData);
      Hooks.on('getSceneControlButtons', TQLHooks.getSceneControlButtons);
      Hooks.on('hotbarDrop', TQLHooks.hotbarDrop);
      Hooks.on('renderJournalDirectory', TQLHooks.renderJournalDirectory);
      Hooks.on('renderJournalSheet', TQLHooks.renderJournalSheet);

      // FQL compatibility hooks
      Hooks.on('ForienQuestLog.Open.QuestLog', TQLHooks.openQuestLog);
      Hooks.on('ForienQuestLog.Open.QuestTracker', TQLHooks.openQuestTracker);

      // TQL specific hooks.
      Hooks.on('TyphonJSQuestLog.Open.QuestLog', TQLHooks.openQuestLog);
      Hooks.on('TyphonJSQuestLog.Open.QuestTracker', TQLHooks.openQuestTracker);
      Hooks.on('TyphonJSQuestLog.Run.DBMigration', TQLHooks.runDBMigration);
   }

   /**
    * Responds to when a data drop occurs on an ActorSheet. If there is an {@link TQLDropData} instance attached by
    * checking the `_tqlData.type` set to `reward` then process the reward item drop via {@link Socket.questRewardDrop}
    * to remove the item from the associated quest.
    *
    * @param {Actor}          actor - The Actor which received the data drop.
    *
    * @param {ActorSheet}     sheet - The ActorSheet which received the data drop.
    *
    * @param {RewardDropData} data - Any data drop, but only handle RewardDropData.
    *
    * @returns {Promise<void>}
    * @see https://foundryvtt.com/api/Actor.html
    * @see https://foundryvtt.com/api/ActorSheet.html
    */
   static async dropActorSheetData(actor, sheet, data)
   {
      if (typeof data !== 'object' || data?._tqlData?.type !== 'reward') { return; }

      await eventbus.triggerAsync('tql:socket:quest:reward:drop', {
         actor: { id: actor.id, name: actor.data.name },
         sheet: { id: sheet.id },
         data
      });
   }

   /**
    * Converts a Quest drop on the canvas type to `JournalEntry` if the quest exists in the QuestDB.
    *
    * @param {Canvas}   foundryCanvas - The Foundry canvas.
    *
    * @param {object}   data - Drop data for canvas.
    */
   static dropCanvasData(foundryCanvas, data)
   {
      if (data.type === 'Quest' && eventbus.triggerSync('tql:questdb:quest:get', data.id) !== void 0)
      {
         data.type = 'JournalEntry';
      }
   }

   /**
    * Provides TQL initialization during the `init` Foundry lifecycle hook.
    */
   static foundryInit()
   {
      // Set the sheet to render quests.
      Quest.setSheet(QuestPreview);

      // Initialize / add plugins.
      PluginLoader.foundryInit();
   }

   /**
    * Provides the remainder of TQL initialization during the `ready` Foundry lifecycle hook.
    *
    * @returns {Promise<void>}
    */
   static async foundryReady()
   {
      // Add the TQL unique Quest data type to the Foundry core data types.
      // CONST.ENTITY_TYPES?.push(constants.questDocumentName);
      // CONST.ENTITY_LINK_TYPES?.push(constants.questDocumentName);

      // // Add the TQL Quest data type to CONFIG.
      // CONFIG[constants.questDocumentName] = {
      //    entityClass: Quest,
      //    documentClass: Quest,
      //    collection: QuestCollection,
      //    sidebarIcon: 'fas fa-scroll',
      //    sheetClass: QuestPreview
      // };

      // const questCollection = new QuestCollection();
      //
      // // Add the quest collection to the plugin eventbus to access QuestDB.
      // await eventbus.triggerAsync('plugins:async:add', {
      //    name: 'tql-data-quest-collection',
      //    instance: questCollection
      // });

      // Add our QuestCollection to the game collections.
      // game.collections.set(constants.questDocumentName, questCollection);

      // Initialize / add plugins.
      await PluginLoader.foundryReady();

      // Need to track any current primary quest as Foundry settings don't provide a old / new state on setting
      // change. The current primary quest state is saved in session storage.
      eventbus.trigger('tql:storage:session:item:set', sessionConstants.currentPrimaryQuest,
       game.settings.get(constants.moduleName, settings.primaryQuest));

      // Initialize current client based macro images based on current state.
      // await Utils.setMacroImage([settings.questTrackerEnabled, settings.questTrackerResizable]);
      await eventbus.triggerAsync('tql:utils:macro:image:set',
       [settings.questTrackerEnabled, settings.questTrackerResizable]);

      // Support for LibThemer; add TQL options to LibThemer.
      const libThemer = game.modules.get('lib-themer');
      if (libThemer?.active)
      {
         await libThemer?.api?.registerTheme('/modules/typhonjs-quest-log/assets/themes/lib-themer/tql.json');
      }

      // TODO REMOVE: for testing - lists events registered
      // const data = eventbus.triggerSync('plugins:get:plugin:events').sort(
      //  (el1, el2) => el1.plugin.localeCompare(el2.plugin));
      // console.log(`PluginManager events:\n${JSON.stringify(data, null, 3)}`);

      // Fire our own lifecycle event to inform any other modules that depend on TQL QuestDB.
      Hooks.callAll('TyphonJSQuestLog.Lifecycle.ready');

      // TODO REMOVE: for temporary testing
      // Hooks.call('TyphonJSQuestLog.Open.QuestLog', { top: 1200 });
   }

   /**
    * Responds to the in game hook `getSceneControlButtons` to add the TQL quest log and floating quest log to the
    * journal / 'notes' tool as sub categories. These controls are always added for the GM, but if TQL is hidden from
    * players based on module setting {@link TQLSettings.hideTQLFromPlayers} the note controls do not display.
    *
    * @param {SceneControl[]} controls - The scene controls to add TQL controls.
    *
    * @see {@link noteControls}
    * @see https://foundryvtt.com/api/SceneControls.html
    */
   static getSceneControlButtons(controls)
   {
      if (game.user.isGM || !game.settings.get(constants.moduleName, settings.hideTQLFromPlayers))
      {
         const noteControls = eventbus.triggerSync('tql:data:notecontrol:get');

         const notes = controls.find((c) => c.name === 'notes');
         if (notes) { notes.tools.push(...noteControls); }
      }
   }

   /**
    * Handles Quest data drops. Also handles setting image state of any macro dropped from the TQL macro compendiums.
    *
    * @param {object} data - The dropped data object.
    *
    * @param {number} slot - The target hotbar slot
    *
    * @returns {Promise<void>}
    */
   static async handleMacroHotbarDrop(data, slot)
   {
      // const uuid = Utils.getUUID(data);
      const uuid = eventbus.triggerSync('tql:utils:uuid:get', data);

      const document = await fromUuid(uuid);

      if (!document) { return; }

      // Find any existing macro that is authored by the current user and matches the dropped macro.
      const existingMacro = game.macros.contents.find((m) =>
       (m.data.author === game.user.id && m.data.command === document.data.command));

      let macro = existingMacro;

      // If there is no existing macro then create one.
      if (!existingMacro)
      {
         const macroData = {
            name: document.data.name,
            type: document.data.type,
            command: document.data.command,
            img: document.data.img,
            flags: document.data.flags
         };

         macro = await Macro.create(macroData, { displaySheet: false });
      }

      // If the macro is from the TQL macro compendiums then update the image state.
      if (macro)
      {
         const macroSetting = macro.getFlag(constants.moduleName, 'macro-setting');
         if (macroSetting)
         {
            // await Utils.setMacroImage(macroSetting);
            await eventbus.triggerAsync('tql:utils:macro:image:set', macroSetting);
         }

         await game.user.assignHotbarMacro(macro, slot);
      }
   }

   /**
    * Handles creating a macro for a Quest drop on the hotbar. Uses existing macro if possible before creating a macro.
    *
    * @param {object} data - The dropped data object.
    *
    * @param {number} slot - The target hotbar slot
    *
    * @returns {Promise<void>}
    */
   static async handleQuestHotbarDrop(data, slot)
   {
      const questId = data.id;

      const quest = eventbus.triggerSync('tql:questdb:quest:get', questId);

      // Early out if Quest isn't in the QuestDB.
      if (!quest)
      {
         throw new Error(game.i18n.localize('TyphonJSQuestLog.Api.hooks.createOpenQuestMacro.error.noQuest'));
      }

      // The macro script data to open the quest via the public QuestAPI.
      const command = `game.modules.get('${constants.moduleName}').public.QuestAPI.open({ questId: '${questId}' });`;

      const macroData = {
         name: game.i18n.format('TyphonJSQuestLog.Api.hooks.createOpenQuestMacro.name', { name: quest.name }),
         type: 'script',
         command
      };

      // Determine the image for the macro. Use the splash image if `splashAsIcon` is true otherwise the giver image.
      macroData.img = quest.splashAsIcon && quest.splash.length ? quest.splash : quest?.giverData?.img;

      // Search for an already existing macro with the same command.
      let macro = game.macros.contents.find((m) => (m.data.command === command));

      // If not found then create a new macro with the command.
      if (!macro)
      {
         macro = await Macro.create(macroData, { displaySheet: false });
      }

      // Assign the macro to the hotbar.
      await game.user.assignHotbarMacro(macro, slot);
   }

   /**
    * Two cases are handled. Because hooks can not be asynchronous an immediate value is returned that reflects whether
    * the drop was handled or not.
    *
    * The first case is when an TQL macro is dropped in from a compendium.
    *
    * The second is when a quest is dropped into the macro hotbar. A new Quest open macro is created. The macro command
    * invokes opening the {@link QuestPreview} via {@link QuestAPI.open} by quest ID.
    *
    * @param {Hotbar} hotbar - The Hotbar application instance.
    *
    * @param {object} data - The dropped data object.
    *
    * @param {number} slot - The target hotbar slot
    *
    * @returns {boolean} - Whether the callback was handled.
    * @see https://foundryvtt.com/api/Hotbar.html
    */
   static hotbarDrop(hotbar, data, slot)
   {
      let handled = false;

      // Verify if the hotbar drop is data that is handled; either a quest or macro from TQL macro compendium.
      if (data.type === constants.questDocumentName || (data.type === 'Macro' && typeof data.pack === 'string' &&
       data.pack.startsWith(constants.moduleName)))
      {
         handled = true;
      }

      // Wrap the handling code in an async IIFE. If this is a Quest data drop or a macro from the TQL macro compendium
      // pack then handle it.
      (async () =>
      {
         if (data.type === 'Macro' && typeof data.pack === 'string' && data.pack.startsWith(constants.moduleName))
         {
            await TQLHooks.handleMacroHotbarDrop(data, slot);
         }

         if (data.type === constants.questDocumentName)
         {
            await TQLHooks.handleQuestHotbarDrop(data, slot);
         }
      })();

      // Immediately return the handled state in the hook callback. Foundry expects false to stop the callback change.
      return !handled;
   }

   /**
    * Opens the QuestLog if the game user is a GM or if TQL isn't hidden to players by module setting
    * {@link TQLSettings.hideTQLFromPlayers}.
    *
    * @param {object}               [opts] - Optional parameters.
    *
    * @param {number|null}          [opts.left] - The left offset position in pixels.
    *
    * @param {number|null}          [opts.top] - The top offset position in pixels.
    *
    * @param {number|null}          [opts.width] - The application width in pixels.
    *
    * @param {number|string|null}   [opts.height] - The application height in pixels.
    */
   static openQuestLog(opts)
   {
      if (!game.user.isGM && game.settings.get(constants.moduleName, settings.hideTQLFromPlayers)) { return; }

      let constraints = {};

      if (typeof opts === 'object')
      {
         // Select only constraint related parameters.
         constraints = (({ left, top, width, height }) => ({ left, top, width, height }))(opts);
      }

      const questLog = eventbus.triggerSync('tql:viewmanager:quest:log:get');
      if (questLog) { questLog.render(true, { focus: true, ...constraints }); }
   }

   /**
    * Opens the {@link QuestTracker} if the game user is a GM or if TQL isn't hidden to players by module setting
    * {@link TQLSettings.hideTQLFromPlayers}.
    *
    * @param {object}               [opts] - Optional parameters.
    *
    * @param {number|null}          [opts.left] - The left offset position in pixels.
    *
    * @param {number|null}          [opts.top] - The top offset position in pixels.
    *
    * @param {number|null}          [opts.width] - The application width in pixels.
    *
    * @param {number|null}          [opts.height] - The application height in pixels.
    *
    * @param {boolean}              [opts.pinned] - Sets the pinned state.
    *
    * @param {boolean}              [opts.primary] - Sets whether showing the primary quest is enabled.
    *
    * @param {boolean}              [opts.resizable] - Sets the resizable state.
    */
   static async openQuestTracker(opts)
   {
      if (!game.user.isGM && game.settings.get(constants.moduleName, settings.hideTQLFromPlayers)) { return; }

      await game.settings.set(constants.moduleName, settings.questTrackerEnabled, true);

      if (typeof opts === 'object')
      {
         // Handle setting quest tracker primary change.
         if (typeof opts.primary === 'boolean')
         {
            eventbus.trigger('tql:storage:session:item:set', sessionConstants.trackerShowPrimary, opts.primary);
         }

         // Select only constraint related parameters.
         const constraints = (({ left, top, width, height, pinned }) => ({ left, top, width, height, pinned }))(opts);

         const tracker = eventbus.triggerSync('tql:viewmanager:quest:tracker:get');

         if (Object.keys(constraints).length > 0)
         {
            // Set to indicate an override of any pinned state.
            constraints.override = true;

            // Defer to make sure quest tracker is rendered before setting position.
            setTimeout(() =>
            {
               if (tracker.rendered) { tracker.setPosition(constraints); }
            }, 0);
         }

         if (typeof opts.pinned === 'boolean')
         {
            const pinned = opts.pinned;

            setTimeout(() =>
            {
               if (pinned)
               {
                  tracker.options.pinned = true;
                  // this.#inPinDropRect = true;
                  game.settings.set(constants.moduleName, settings.questTrackerPinned, true);
                  PositionValidator.updateTracker();
               }
               else
               {
                  tracker.options.pinned = false;
                  // this.#inPinDropRect = false;
                  game.settings.set(constants.moduleName, settings.questTrackerPinned, false);
               }
            }, 0);
         }

         // Handle setting quest tracker resizable change.
         if (typeof opts.resizable === 'boolean')
         {
            setTimeout(() =>
            {
               game.settings.set(constants.moduleName, settings.questTrackerResizable, opts.resizable);
            }, 0);
         }
      }
   }

   /**
    * Handles adding the 'open quest log' button at the bottom of the journal directory. Always displayed for the GM,
    * but only displayed to players if TQL isn't hidden via module setting {@link TQLSettings.hideTQLFromPlayers}.
    *
    * For GMs if module setting {@link TQLSettings.showFolder} is true then the hidden `_tql_quests` folder is shown.
    *
    * @param {JournalDirectory}  app - The JournalDirectory app.
    *
    * @param {JQuery}            html - The jQuery element for the window content of the app.
    *
    * @see https://foundryvtt.com/api/JournalDirectory.html
    */
   static renderJournalDirectory(app, html)
   {
      if (!(game.user.isGM && game.settings.get(constants.moduleName, settings.showFolder)))
      {
         const folder = eventbus.triggerSync('tql:utils:quest:folder:get');
         if (folder !== void 0)
         {
            const element = html.find(`.folder[data-folder-id="${folder.id}"]`);
            if (element !== void 0)
            {
               element.remove();
            }
         }
      }
   }

   /**
    * Remove option item for quest journal folder when any journal entry is rendered. This prevents users from placing
    * non-quest journals into the quest journal folder.
    *
    * @param {JournalSheet}   app - The JournalSheet app.
    *
    * @param {JQuery}         html - The jQuery element for the window content of the app.
    *
    * @see https://foundryvtt.com/api/JournalSheet.html
    */
   static renderJournalSheet(app, html)
   {
      // const folder = Utils.getQuestFolder();
      const folder = eventbus.triggerSync('tql:utils:quest:folder:get');
      if (folder)
      {
         const option = html.find(`option[value="${folder.id}"]`);

         if (option) { option.remove(); }
      }
   }

   /**
    * Provides a GM only hook to manually run DB Migration. When schemaVersion is not provided
    * {@link DBMigration.migrate} will perform migration loading this value from module settings. However, a specific
    * migration schema version can be supplied to force DB migration. To run all migration provide `0` otherwise a
    * specific schema version to start migration at which is below the max version.
    *
    * @param {number}   [schemaVersion] - A valid schema version from 0 to {@link DBMigration.version}
    *
    * @returns {Promise<void>}
    */
   static async runDBMigration(schemaVersion = void 0)
   {
      // Only GMs can run the migration.
      if (!game.user.isGM) { return; }

      await eventbus.triggerAsync('tql:dbmigration:migrate', schemaVersion);
   }
}

/**
 * @typedef {object} TQLPublicAPI - Exposes a few TQL classes and instances publicly.
 *
 * @property {QuestAPI} QuestAPI - QuestAPI class - Exposes static methods to interact with the quest system.
 */
