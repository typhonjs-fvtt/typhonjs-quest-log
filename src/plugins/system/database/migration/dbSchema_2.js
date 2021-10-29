import DBMigration   from './DBMigration.js';

import Quest         from '../../../../model/Quest.js';

import { constants, questStatus } from '../../../../constants.js';

/**
 * Performs DB migration from schema 1 to 2.
 *
 * New data field:
 * {string} giverData - Stores the quest giver data from {@link Enrich.giverFromQuest}.
 *
 * Convert data:
 * {string} status - convert 'hidden' to 'inactive' for code clarity.
 *
 * The purpose of this update is to store the quest giver data in the new `giverData` field.
 * Presently the quest giver if non abstract and a Foundry UUID is looked up in the enrich process via `fromUUID` to
 * retrieve this data. This is the only asynchronous action during the enrichment process and to provide QuestDB /
 * in-memory caching of Quest and enriched data the process needs to be synchronous to make sure that order of
 * operations succeeds atomically and as quick as possible. This update will process all quest data and perform that
 * lookup and store the quest giver data in `giverData`. In FQL 0.7.4 and above to update the quest giver data the
 * user needs to open QuestPreview and simply save the quest. A macro will also be provided to update all quest giver
 * data in bulk.
 *
 * @param {Eventbus} eventbus - The associated eventbus with DBMigration.
 *
 * @returns {Promise<void>}
 */
export default async function(eventbus)
{
   const folder = await eventbus.triggerAsync('tql:utils:quest:folder:initialize');
   if (!folder) { return; }

   for (const entry of folder.content)
   {
      try
      {
         const content = entry.getFlag(constants.moduleName, constants.flagDB);

         if (content)
         {
            const quest = new Quest(content, entry);

            // Load quest giver assets and store as 'giverData'.
            if (typeof quest.giver === 'string')
            {
               const data = await eventbus.triggerAsync('tql:enrich:giver:from:quest', quest);
               if (data && typeof data.img === 'string' && data.img.length) { quest.giverData = data; }
            }

            // Change any status of 'hidden' to 'inactive'.
            if (quest.status === 'hidden') { quest.status = questStatus.inactive; }

            await quest.save();
         }
         else
         {
            console.log(game.i18n.format('TyphonJSQuestLog.Migration.CouldNotMigrate', { name: entry.data.name }));
         }
      }
      catch (err)
      {
         console.log(game.i18n.format('TyphonJSQuestLog.Migration.CouldNotMigrate', { name: entry.data.name }));
      }
   }

   // Set the DBMigration.setting to `2` indicating that migration to schema version `2` is complete.
   await game.settings.set(constants.moduleName, DBMigration.setting, 2);
}
