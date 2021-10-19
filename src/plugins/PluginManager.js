import * as SystemPlugins  from './system/index.js';

import PluginManager       from '../../external/PluginManager.js';

const pluginManager = new PluginManager();

export const eventbus = pluginManager.getEventbus();

export default pluginManager;

export class PluginLoader
{
   static foundryInit()
   {
      // Handles TinyMCE options generation.
      pluginManager.add({
         name: 'tql-system-tinymce',
         instance: SystemPlugins.TinyMCE
      });

      // Preload Handlebars templates and register helpers.
      pluginManager.add({
         name: 'tql-system-utils',
         instance: SystemPlugins.Utils
      });

      // Provides DOMPurify.
      pluginManager.add({
         name: 'tql-system-dompurify',
         instance: SystemPlugins.DOMPurify
      });

      // Provides Quest enrichment for template display.
      pluginManager.add({
         name: 'tql-system-enrich',
         instance: SystemPlugins.Enrich
      });
   }

   static async foundryReady()
   {
      // Initialize the in-memory QuestDB. Loads all quests that the user can see at this point.
      await pluginManager.add({
         name: 'tql-system-questdb',
         instance: SystemPlugins.QuestDB
      });

      // Initialize all main GUI views.
      await pluginManager.add({
         name: 'tql-system-viewmanager',
         instance: SystemPlugins.ViewManager
      });

      // Allow and process incoming socket data.
      await pluginManager.add({
         name: 'tql-system-socket',
         instance: SystemPlugins.Socket
      });

      // Start watching sidebar updates.
      await pluginManager.add({
         name: 'tql-system-foundryuimanager',
         instance: SystemPlugins.FoundryUIManager
      });
   }
}