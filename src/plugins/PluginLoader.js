import { SessionStorage }  from '@typhonjs-fvtt/svelte/plugins/system';

import * as DataPlugins    from './data/index.js';
import * as SystemPlugins  from './system/index.js';

import pluginManager       from './PluginManager.js';

import { constants }       from '../constants.js';

export default class PluginLoader
{
   static foundryInit()
   {
      pluginManager.addAll([
         // Manages session storage w/ Svelte stores for each session item.
         {
            name: 'tql-system-session-storage',
            instance: SessionStorage,
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
            instance: SystemPlugins.DOMPurify
         },
         // Provides Quest enrichment for template display.
         {
            name: 'tql-system-enrich',
            instance: SystemPlugins.Enrich
         },
         // Add setting control / responder to settings changes.
         {
            name: 'tql-system-settings-control',
            instance: SystemPlugins.SettingsControl
         },
         // Add setting dispatch / triggers events w/ data for all settings changes.
         {
            name: 'tql-system-settings-dispatch',
            instance: SystemPlugins.SettingsDispatch
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
         // Initialize the in-memory QuestDB. Loads all quests that the user can see at this point.
         {
            name: 'tql-system-questdb',
            instance: SystemPlugins.QuestDB
         },
         // Initialize all main GUI views.
         {
            name: 'tql-system-viewmanager',
            instance: SystemPlugins.ViewManager
         },
         // Start watching sidebar updates.
         {
            name: 'tql-system-foundryuimanager',
            instance: SystemPlugins.FoundryUIManager
         },
         // Initialize public API plugin and assign to module data.
         {
            name: 'tql-system-quest-api',
            instance: SystemPlugins.QuestAPIModule
         }
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