import { constants } from '../../../../model/constants.js';

// import dbSchema_1    from './dbSchema_1.js';
// import dbSchema_2    from './dbSchema_2.js';

/**
 * Defines the callback functions to execute for each schemaVersion level.
 *
 * @type {Object.<number, Function>}
 */
const migrateImpl = {
   0: () => {},   // Schema level 0 is a noop / assume all data is stored in JE content.
   // 1: dbSchema_1, // Migrate to schema 1 transferring any old data to JE flags.
   // 2: dbSchema_2  // Schema 2 - store quest giver data in Quest data instead of doing a UUID lookup in Enrich.
};

/**
 * Provides a utility module to manage DB migrations when new versions of FQL are installed / loaded for the first time.
 * These updates are organized as schema versions with callback functions defined above. Each schema migration function
 * stores the version number in module settings for {@link DBMigration.setting}. On startup {@link DBMigration.migrate}
 * is invoked in the `ready` Hook callback from `./src/init.js`. If the current schema version already equals
 * {@link DBMigration.version} no migration occurs. Also if there are no journal entries in the `_fql_quests` folder
 * no migration occurs which is often the case with a new world and the module setting is set to not run migration
 * again.
 *
 * In the case that a GM needs to manually run migration there is a hook defined in {@link FQLHooks.runDBMigration}.
 * This is `TyphonJSQuestLog.Run.DBMigration` which can be executed by a macro with
 * `Hooks.call('TyphonJSQuestLog.Run.DBMigration', <schemaVersion>);`. To run all migration manually substitute
 * `<schemaVersion>` with `0`.
 *
 * @see registerHooks
 */
export default class DBMigration
{
   /**
    * Defines the current max schema version.
    *
    * @returns {number} max schema version.
    */
   static get version() { return 2; }

   /**
    * Defines the module setting key to store current level DB migration level that already has run for schemaVersion.
    *
    * @returns {string} module setting for schemaVersion.
    */
   static get setting() { return 'dbSchema'; }

   /**
    * Runs DB migration. If no `schemaVersion` is set the module setting {@link DBMigration.setting} is used to get the
    * current schema value which is stored after any migration occurs. There is a hook available
    * `TyphonJSQuestLog.Run.DBMigration`.
    *
    * @param {number}   schemaVersion - A valid schema version from 0 to DBMigration.version - 1
    *
    * @returns {Promise<void>}
    */
   static async migrate(schemaVersion = void 0)
   {
      try
      {
         // Registers the DB Schema world setting. By default this is 0. The `0.7.0` release of FQL has a schema of `1`.
         game.settings.register(constants.moduleName, this.setting, {
            scope: 'world',
            config: false,
            default: 0,
            type: Number
         });

         // If no schemaVersion is defined then pull the value from module settings.
         if (schemaVersion === void 0)
         {
            schemaVersion = game.settings.get(constants.moduleName, this.setting);
         }
         else
         {
            // Otherwise make sure that the schemaVersion supplied to migrate is valid.
            if (!Number.isInteger(schemaVersion) || schemaVersion < 0 || schemaVersion > DBMigration.version - 1)
            {
               const err = `TyphonJSQuestLog - DBMigrate.migrate - schemaVersion must be an integer (0 - ${
                DBMigration.version - 1})`;

               ui.notifications.error(err);
               console.error(err);
            }
         }

         // The DB schema matches the current version
         if (schemaVersion === this.version) { return; }

         // Increment the schema version to run against the proper callback function.
         schemaVersion++;

         // Sanity check to make sure there is a schema migration function for the next schema update.
         if (typeof migrateImpl[schemaVersion] !== 'function') { return; }

         // const folder = await Utils.initializeQuestFolder();
        const folder = await this._eventbus.triggerAsync('tql:utils:quest:folder:initialize');

         // Early out if there are no journal entries / quests in the `_fql-quests` folder.
         if (folder?.content?.length === 0)
         {
            await game.settings.set(constants.moduleName, DBMigration.setting, DBMigration.version);
            return;
         }

         ui.notifications.info(game.i18n.localize('TyphonJSQuestLog.Migration.Start'));

         // Start at the schema version and stop when the version exceeds the max version.
         for (let version = schemaVersion; version <= this.version; version++)
         {
            if (version !== 0)
            {
               ui.notifications.info(game.i18n.format('TyphonJSQuestLog.Migration.Schema', { version }));
            }

            await migrateImpl[version](this._eventbus);
         }

         ui.notifications.info(game.i18n.localize('TyphonJSQuestLog.Migration.Complete'));

         // TODO: SVELTE - evaluate after Svelte integration.
         // Socket.refreshAll();
         this._eventbus.trigger('tql:socket:refresh:all');
      }
      catch (err)
      {
         console.error(err);
      }
   }

   static async onPluginLoad(ev)
   {
      this._eventbus = ev.eventbus;

      const opts = { guard: true };

      ev.eventbus.on('tql:dbmigration:version:get', () => this.version, this, opts);
      ev.eventbus.on('tql:dbmigration:setting:get', () => this.setting, this, opts);
      ev.eventbus.on('tql:dbmigration:migrate', this.migrate, this, opts);

      // Only attempt to run DB migration for GM.
      if (game.user.isGM) { await this.migrate(); }
   }
}