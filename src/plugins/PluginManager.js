import * as SystemPlugins  from './system/index.js';

import PluginManager       from '../../external/PluginManager.js';

const pluginManager = new PluginManager();

export const eventbus = pluginManager.getEventbus();

export default pluginManager;

export class PluginLoader
{
   static foundryInit()
   {
      pluginManager.add({
         name: 'tql-system-tinymce',
         instance: SystemPlugins.TinyMCE
      });

      pluginManager.add({
         name: 'tql-system-utils',
         instance: SystemPlugins.Utils
      });

      pluginManager.add({
         name: 'tql-system-dompurify',
         instance: SystemPlugins.DOMPurify
      });

      pluginManager.add({
         name: 'tql-system-enrich',
         instance: SystemPlugins.Enrich
      });
   }

   static async foundryReady()
   {
      await pluginManager.add({
         name: 'tql-system-questdb',
         instance: SystemPlugins.QuestDB
      });

      await pluginManager.add({
         name: 'tql-system-viewmanager',
         instance: SystemPlugins.ViewManager
      });

      await pluginManager.add({
         name: 'tql-system-socket',
         instance: SystemPlugins.Socket
      });

      await pluginManager.add({
         name: 'tql-system-foundryuimanager',
         instance: SystemPlugins.FoundryUIManager
      });
   }
}