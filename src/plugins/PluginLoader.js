import { DOMPurify }          from '@typhonjs-fvtt/runtime/dompurify/plugin/system';
import { TJSSessionStorage }  from '@typhonjs-fvtt/runtime/svelte/plugin/system';
import { TJSGameSettings }    from '@typhonjs-fvtt/svelte-standard/plugin/system';

import * as DataPlugins       from './data/index.js';
import * as SystemPlugins     from './system/index.js';

import pluginManager          from './PluginManager.js';

import { constants }          from '#constants';

export default class PluginLoader
{
   static foundryInit()
   {
      pluginManager.addAll([
         // Manages session storage w/ Svelte stores for each session item.
         {
            name: 'tjs-system-session-storage',
            instance: new TJSSessionStorage(),
            options: { eventPrepend: 'tql' }
         },
         // Provides utilities, but also preloads Handlebars templates and registers helpers.
         {
            name: 'tql-system-utils',
            instance: SystemPlugins.Utils
         },
         // Provides DOMPurify support.
         {
            name: 'tql-system-dompurify',
            instance: DOMPurify,
            options: { eventPrepend: 'tql' }
         },
         // Provides Quest enrichment for template display.
         {
            name: 'tql-system-enrich',
            instance: SystemPlugins.Enrich
         },
         // Add setting dispatch / triggers events w/ data for all settings changes; also provides Svelte stores.
         {
            name: 'tjs-system-game-settings',
            instance: new TJSGameSettings(constants.moduleName)
         },
         // Add setting control / responder to settings changes.
         {
            name: 'tql-system-settings-control',
            instance: new SystemPlugins.GameSettingsControl()
         },
         // Handles returning the left-hand note controls
         {
            name: 'tql-data-notecontrols',
            instance: DataPlugins.NoteControls
         },
         // Handles TinyMCE options generation.
         {
            name: 'tql-data-tinymce',
            instance: DataPlugins.TinyMCE
         }
      ]);
   }

   static async foundryReady()
   {
      await pluginManager.addAll([
         // Allow and process incoming socket data.
         {
            name: 'tql-system-socket',
            instance: SystemPlugins.Socket
         },
         // Handles DB migration; runs on plugin load.
         {
            name: 'tql-system-database-migration',
            instance: SystemPlugins.DBMigration
         },
         // Initialize all main GUI views.
         {
            name: 'tql-system-viewmanager',
            instance: SystemPlugins.ViewManager
         },
         // Initialize the in-memory QuestDB. Loads all quests that the user can see at this point.
         {
            name: 'tql-system-questdb',
            instance: SystemPlugins.QuestDB
         },
         // Initialize public API plugin and assign to module data.
         {
            name: 'tql-system-quest-api',
            instance: SystemPlugins.QuestAPIModule
         },
         // Provides creating data for dialogs.
         {
            name: 'tql-data-dialog',
            instance: DataPlugins.CreateDialogData
         },
      ]);

      // Store public QuestAPI in the game modules data object.
      const moduleData = game.modules.get(constants.moduleName);

      /**
       * @type {TQLPublicAPI}
       */
      moduleData.public = {
         QuestAPI: SystemPlugins.QuestAPIModule.default
      };

      // Freeze the public API so it can't be modified.
      Object.freeze(moduleData.public);
   }
}