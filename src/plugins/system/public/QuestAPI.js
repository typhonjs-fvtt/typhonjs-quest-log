import { constants, questDBHooks, settings } from '../../../model/constants.js';

/**
 * Quest public API. QuestAPI exposes control capabilities publicly. This functionality is gated as necessary depending
 * on user level, quest observability and module settings.
 *
 * A shim to the {@link QuestDB} is available via {@link QuestAPI.DB} which exposes certain QuestDB methods that are
 * available for any player as only currently observable quests are loaded into QuestDB.
 */
class QuestAPI
{
   /**
    * @returns {QuestDBShim} Public QuestDB access.
    */
   static get DB() { return QuestDBShim; }

   /**
    * Opens the Quest sheet / QuestPreview for the given questID. A check for the module setting
    * {@link TQLSettings.hideTQLFromPlayers} provides an early out if TQL is hidden from players causing the sheet to
    * not render. {@link ViewManager.questPreview} provides an object.
    *
    * @param {object}   options - Optional parameters.
    *
    * @param {string}   options.questId - Quest ID string to open.
    *
    * @param {boolean}  [options.notify=true] - Post UI notification on any error.
    */
   static open({ questId, notify = true })
   {
      if (!game.user.isGM && game.settings.get(constants.moduleName, settings.hideTQLFromPlayers)) { return; }

      try
      {
         const questPreview = s_EVENTBUS.triggerSync('tql:viewmanager:quest:preview:get', questId);

         // Optimization to render an existing open QuestPreview with the given quest ID instead of opening a new
         // app / view.
         if (questPreview !== void 0)
         {
            questPreview.render(true, { focus: true });
            return;
         }

         const quest = QuestDBShim.getQuest(questId);

         if (quest === void 0)
         {
            if (notify)
            {
               s_EVENTBUS.trigger('tql:viewmanager:notifications:warn',
                game.i18n.localize('TyphonJSQuestLog.Notifications.CannotOpen'));
            }
            else
            {
               s_EVENTBUS.trigger('tql:socket:user:cant:open:quest');
            }
            return;
         }

         if (quest.isObservable)
         {
            quest.sheet.render(true, { focus: true });
         }
      }
      catch (error)
      {
         if (notify)
         {
            s_EVENTBUS.trigger('tql:viewmanager:notifications:error',
             game.i18n.localize('TyphonJSQuestLog.Notifications.CannotOpen'));
         }
         else
         {
            s_EVENTBUS.trigger('tql:socket:user:cant:open:quest');
         }
      }
   }
}

/**
 * Stores the plugin manager eventbus.
 *
 * @param {object} ev -
 */
export function onPluginLoad(ev)
{
   s_EVENTBUS = ev.eventbus;

   const opts = { guard: true };

   ev.eventbus.on('tql:questapi:db', () => this.DB, this, opts);
   ev.eventbus.on('tql:questapi:open', this.open, this, opts);
}

export function onPluginUnload()
{
   s_EVENTBUS = void 0;
}

let s_EVENTBUS = void 0;

Object.freeze(QuestAPI);

export default QuestAPI;

/**
 * Provides a shim to the publicly exposed methods of QuestDB. Except for {@link QuestDBShim.createQuest} all other
 * methods can be exposed without gating as the QuestDB only loads in-memory quests that are observable to the current
 * user.
 */
class QuestDBShim
{
   /**
    * @returns {QuestDBHooks} The QuestDB hooks.
    */
   static get hooks() { return questDBHooks; }

   /**
    * Creates a new quest and waits for the journal entry to update and QuestDB to pick up the new Quest which
    * is returned.
    *
    * @param {object}   options - Optional parameters.
    *
    * @param {object}   [options.data] - Quest data to assign to new quest.
    *
    * @param {string}   [options.parentId] - Any associated parent ID; if set then this is a subquest.
    *
    * @returns {Promise<Quest>} The newly created quest.
    */
   static async createQuest(options)
   {
      if (game.user.isGM) { return s_EVENTBUS.triggerAsync('tql:questdb:quest:create', options); }

      return game.settings.get(constants.moduleName, settings.allowPlayersCreate) &&
       !game.settings.get(constants.moduleName, settings.hideTQLFromPlayers) ?
        s_EVENTBUS.triggerAsync('tql:questdb:quest:create', options) : null;
   }

   /**
    * Filter the entire QuestDB, returning an Array of entries which match a functional predicate.
    *
    * @param {Function} predicate  The functional predicate to test.
    *
    * @param {object}   [options] - Optional parameters. If no options are provided the iteration occurs across all
    *                               quests.
    *
    * @param {string}   [options.type] - The quest type / status to iterate.
    *
    * @returns {QuestEntry[]}  An Array of matched values
    * @see {@link Array#filter}
    */
   static filter(predicate, options)
   {
      return s_EVENTBUS.triggerSync('tql:questdb:filter', predicate, options);
   }

   /**
    * Filters the CollectJS collections and returns a single collection if status is specified otherwise filters all
    * quest collections and returns a QuestCollect object with all status categories. At minimum you must provide a
    * filter function `options.filter` which will be applied across all collections otherwise you may also provide
    * separate filters for each status category.
    *
    * @param {object}   options - Optional parameters.
    *
    * @param {string}   [options.type] - Specific quest status to return filtered.
    *
    * @param {Function} [options.filter] - The filter function for any quest status that doesn't have a filter
    *                                      defined.
    *
    * @param {Function} [options.filterActive] - The filter function for active quests.
    *
    * @param {Function} [options.filterAvailable] - The filter function for available quests.
    *
    * @param {Function} [options.filterCompleted] - The filter function for completed quests.
    *
    * @param {Function} [options.filterFailed] - The filter function for failed quests.
    *
    * @param {Function} [options.filterInactive] - The filter function for inactive quests.
    *
    * @returns {QuestsCollect|collect<QuestEntry>|void} An object of all QuestEntries filtered by status or individual
    *                                                   status or undefined.
    */
   static filterCollect(options)
   {
      return s_EVENTBUS.triggerSync('tql:questdb:collect:filter', options);
   }

   /**
    * Find an entry in the QuestDB using a functional predicate.
    *
    * @param {Function} predicate - The functional predicate to test.
    *
    * @param {object}   [options] - Optional parameters. If no options are provided the iteration occurs across all
    *                               quests.
    *
    * @param {string}   [options.type] - The quest type / status to iterate.
    *
    * @returns {QuestEntry} The QuestEntry, if found, otherwise undefined.
    * @see {@link Array#find}
    */
   static find(predicate, options)
   {
      return s_EVENTBUS.triggerSync('tql:questdb:find', predicate, options);
   }

   /**
    * Returns all QuestEntry instances.
    *
    * @returns {QuestEntry[]} All QuestEntry instances.
    */
   static getAllQuestEntries()
   {
      return s_EVENTBUS.triggerSync('tql:questdb:all:quest:entries:get');
   }

   /**
    * Returns all Quest instances.
    *
    * @returns {Quest[]} All quest instances.
    */
   static getAllQuests()
   {
      return s_EVENTBUS.triggerSync('tql:questdb:all:quests:get');
   }

   /**
    * Provides a quicker method to get the count of quests by quest type / status or all quests.
    *
    * @param {object}   [options] - Optional parameters. If no options are provided the count of all quests is returned.
    *
    * @param {string}   [options.status] - The quest status category to count.
    *
    * @returns {number} Quest count for the specified type or the count for all quests.
    */
   static getCount(options)
   {
      return s_EVENTBUS.triggerSync('tql:questdb:count:get', options);
   }

   /**
    * Gets the Quest by quest ID.
    *
    * @param {string}   questId - A Foundry ID
    *
    * @returns {Quest|void} The Quest or null.
    */
   static getQuest(questId)
   {
      return s_EVENTBUS.triggerSync('tql:questdb:quest:get', questId);
   }

   /**
    * Retrieves a QuestEntry by quest ID.
    *
    * @param {string}   questId - A Foundry ID
    *
    * @returns {QuestEntry|null} The QuestEntry or null.
    */
   static getQuestEntry(questId)
   {
      return s_EVENTBUS.triggerSync('tql:questdb:quest:entry:get', questId);
   }

   /**
    * Provides an iterator across the QuestEntry map of maps.
    *
    * @param {object}   [options] - Optional parameters. If no options are provided the iteration occurs across all
    *                               quests.
    *
    * @param {string}   [options.status] - The quest status category to iterate.
    *
    * @returns {Generator<QuestEntry, void, *>}  A QuestEntry iterator.
    */
   static iteratorEntries(options)
   {
      return s_EVENTBUS.triggerSync('tql:questdb:iterator:entries', options);
   }

   /**
    * Provides an iterator across the QuestEntry map of maps.
    *
    * @param {object}   [options] - Optional parameters. If no options are provided the iteration occurs across all
    *                               quests.
    *
    * @param {string}   [options.status] - The quest status category to iterate.
    *
    * @returns {Generator<Quest, void, *>}  A QuestEntry iterator.
    */
   static iteratorQuests(options)
   {
      return s_EVENTBUS.triggerSync('tql:questdb:iterator:quests', options);
   }

   /**
    * @param {object}   options - Optional parameters.
    *
    * @param {string}   [options.status] - Quest status to return sorted.
    *
    * @param {Function} [options.sortActive] - The sort function for active quests.
    *
    * @param {Function} [options.sortAvailable] - The sort function for available quests.
    *
    * @param {Function} [options.sortCompleted] - The sort function for completed quests.
    *
    * @param {Function} [options.sortFailed] - The sort function for failed quests.
    *
    * @param {Function} [options.sortInactive] - The sort function for inactive quests.
    *
    * @returns {QuestsCollect|collect<QuestEntry>|void} The complete sorted quests or just a particular quest status.
    */
   static sortCollect(options)
   {
      return s_EVENTBUS.triggerSync('tql:questdb:collect:sort', options);
   }
}

Object.freeze(QuestDBShim);