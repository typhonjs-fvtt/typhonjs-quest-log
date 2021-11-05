/**
 * Defines the main TQL constants for module name and the DB flag.
 *
 * @type {{flagDB: string, moduleName: string, moduleLabel: string}}
 */
const constants = {
   flagDB: 'json',
   moduleLabel: `TyphonJS Quest Log`,
   moduleName: 'typhonjs-quest-log',
   questDocumentName: 'Quest'
};

/**
 * Defines the {@link JQuery} events that are used in TQL.
 *
 * @type {{click: string, dblclick: string, dragstart: string, drop: string, focus: string, focusout: string, mousedown: string}}
 */
const jquery = {
   click: 'click',
   contextmenu: 'contextmenu',
   dblclick: 'dblclick',
   dragenter: 'dragenter',
   dragstart: 'dragstart',
   drop: 'drop',
   focus: 'focus',
   focusout: 'focusout',
   keydown: 'keydown',
   mousedown: 'mousedown'
};

/**
 * Defines all of the DB Hook callbacks. Please see {@link QuestDB} for more documentation.
 *
 * @type {QuestDBHooks}
 */
const questDBHooks = {
   addedAllQuestEntries: 'addedAllQuestEntries',
   addQuestEntry: 'addQuestEntry',
   createQuestEntry: 'createQuestEntry',
   deleteQuestEntry: 'deleteQuestEntry',
   removedAllQuestEntries: 'removedAllQuestEntries',
   removeQuestEntry: 'removeQuestEntry',
   updateQuestEntry: 'updateQuestEntry',
};

/**
 * Stores strings for quest types (statuses)
 *
 * @returns {{active: string, available: string, completed: string, failed: string, inactive: string}}
 */
const questStatus = {
   active: 'active',
   available: 'available',
   completed: 'completed',
   failed: 'failed',
   inactive: 'inactive'
};

/**
 * Stores localization strings for quest types (statuses)
 *
 * @type {{active: string, available: string, completed: string, failed: string, inactive: string}}
 */
const questStatusI18n = {
   active: 'TyphonJSQuestLog.QuestTypes.Active',
   available: 'TyphonJSQuestLog.QuestTypes.Available',
   completed: 'TyphonJSQuestLog.QuestTypes.Completed',
   failed: 'TyphonJSQuestLog.QuestTypes.Failed',
   inactive: 'TyphonJSQuestLog.QuestTypes.InActive'
};

/**
 * Stores the QuestLog tab indexes. This is used by QuestLog.setPosition to select the current table based on status
 * name.
 *
 * @type {{inactive: number, available: number, active: number, completed: number, failed: number}}
 */
const questTabIndex = {
   active: 1,
   available: 0,
   completed: 2,
   failed: 3,
   inactive: 4
};

/**
 * Stores the keys used with session storage.
 *
 * @type {TQLSessionConstants}
 */
const sessionConstants = {
   currentPrimaryQuest: 'typhonjs.questlog.currentPrimaryQuest',
   trackerFolderState: 'typhonjs.questtracker.folderState-',
   trackerShowBackground: 'typhonjs.questtracker.showBackground',
   trackerShowPrimary: 'typhonjs.questtracker.showPrimary'
};

/**
 * @type {TQLSettings} Defines all the module settings for world and client.
 */
const settings = {
   allowPlayersAccept: 'allowPlayersAccept',
   allowPlayersCreate: 'allowPlayersCreate',
   allowPlayersDrag: 'allowPlayersDrag',
   countHidden: 'countHidden',
   defaultAbstractRewardImage: 'defaultAbstractRewardImage',
   defaultPermission: 'defaultPermission',
   dynamicBookmarkBackground: 'dynamicBookmarkBackground',
   hideTQLFromPlayers: 'hideTQLFromPlayers',
   navStyle: 'navStyle',
   notifyRewardDrop: 'notifyRewardDrop',
   primaryQuest: 'primaryQuest',
   questTrackerEnable: 'questTrackerEnable',
   questTrackerPinned: 'questTrackerPinned',
   questTrackerPosition: 'questTrackerPosition',
   questTrackerResizable: 'questTrackerResizable',
   showFolder: 'showFolder',
   showTasks: 'showTasks',
   trustedPlayerEdit: 'trustedPlayerEdit'
};

export {
   constants,
   jquery,
   questDBHooks,
   questStatus,
   questStatusI18n,
   questTabIndex,
   sessionConstants,
   settings
};

/**
 * @typedef {object} TQLSessionConstants
 *
 * @property {string}   currentPrimaryQuest - Stores current primary quest set from {@link TQLSettings.primaryQuest}.
 *
 * @property {string}   trackerFolderState - Stores a boolean with tacked on quest ID for whether objectives are shown.
 *
 * @property {string}   trackerShowPrimary - Stores a boolean if the tracker is showing the primary quest or all quests.
 */

/**
 * @typedef {object} TQLSettings
 *
 * @property {string}   allowPlayersAccept - Allow players to accept quests.
 *
 * @property {string}   allowPlayersCreate - Allow players to create quests.
 *
 * @property {string}   allowPlayersDrag - Allow players to drag reward items to actor sheet.
 *
 * @property {string}   countHidden - Count hidden objectives / subquests.
 *
 * @property {string}   defaultAbstractRewardImage - Sets the default abstract reward image path.
 *
 * @property {string}   defaultPermission - Sets the default permission level for new quests.
 *
 * @property {string}   dynamicBookmarkBackground - Uses jQuery to dynamically set the tab background image.
 *
 * @property {string}   hideTQLFromPlayers - Completely hides TQL from players.
 *
 * @property {string}   navStyle - Navigation style / classic / or bookmark tabs.
 *
 * @property {string}   notifyRewardDrop - Post a notification UI message when rewards are dropped in actor sheets.
 *
 * @property {string}   primaryQuest - Stores the quest ID of a quest that is the current primary quest.
 *
 * @property {string}   questTrackerEnable - Enables the quest tracker.
 *
 * @property {string}   questTrackerPinned - Is the QuestTracker pinned to the side bar.
 *
 * @property {string}   questTrackerPosition - Hidden setting to store current quest tracker position.
 *
 * @property {string}   questTrackerResizable - Stores the current window handling mode ('auto' or 'resize').
 *
 * @property {string}   showFolder - Shows the `_tql_quests` directory in the journal entries sidebar.
 *
 * @property {string}   showTasks - Determines if objective counts are rendered.
 *
 * @property {string}   trustedPlayerEdit - Allows trusted players to have full quest editing capabilities.
 */

/**
 * @typedef {object} QuestDBHooks
 *
 * @property {string}   addedAllQuestEntries - Invoked in {@link QuestDB.init} when all quests have been loaded.
 *
 * @property {string}   addQuestEntry - Invoked in {@link QuestDB.consistencyCheck} and s_JOURNAL_ENTRY_UPDATE when a
 *                                      quest is added to the {@link QuestDB}.
 *
 * @property {string}   createQuestEntry - Invoked in s_JOURNAL_ENTRY_CREATE in {@link QuestDB} when a quest is created.
 *
 * @property {string}   deleteQuestEntry - Invoked in s_JOURNAL_ENTRY_DELETE in {@link QuestDB} when a quest is deleted.
 *
 * @property {string}   removedAllQuestEntries - Invoked in {@link QuestDB.removeAll} when all quests are removed.
 *
 * @property {string}   removeQuestEntry - Invoked in {@link QuestDB.consistencyCheck} and s_JOURNAL_ENTRY_UPDATE when a
 *                                         quest is removed from the {@link QuestDB}.
 *
 * @property {string}   updateQuestEntry - Invoked in s_JOURNAL_ENTRY_UPDATE when a quest is updated in {@link QuestDB}.
 */
