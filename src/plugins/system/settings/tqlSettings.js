import { constants, settings } from '#constants';

const moduleId = constants.moduleName;

/**
 * The default location for the QuestTracker
 *
 * @type {{top: number}}
 */
const s_QUEST_TRACKER_DEFAULT = { top: 80, width: 296 };

/**
 * Constants for setting scope type.
 *
 * @type {{world: string, client: string}}
 */
const scope = {
   client: 'client',
   world: 'world'
};

export const tqlSettings = [
   {
      moduleId,
      key: settings.allowPlayersDrag,
      options: {
         name: 'TyphonJSQuestLog.Settings.allowPlayersDrag.Enable',
         hint: 'TyphonJSQuestLog.Settings.allowPlayersDrag.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean
      }
   },

   {
      moduleId,
      key: settings.allowPlayersCreate,
      options: {
         name: 'TyphonJSQuestLog.Settings.allowPlayersCreate.Enable',
         hint: 'TyphonJSQuestLog.Settings.allowPlayersCreate.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean
      }
   },

   {
      moduleId,
      key: settings.allowPlayersAccept,
      options: {
         name: 'TyphonJSQuestLog.Settings.allowPlayersAccept.Enable',
         hint: 'TyphonJSQuestLog.Settings.allowPlayersAccept.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean
      }
   },

   {
      moduleId,
      key: settings.trustedPlayerEdit,
      options: {
         name: 'TyphonJSQuestLog.Settings.trustedPlayerEdit.Enable',
         hint: 'TyphonJSQuestLog.Settings.trustedPlayerEdit.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean
      }
   },

   {
      moduleId,
      key: settings.countHidden,
      options: {
         name: 'TyphonJSQuestLog.Settings.countHidden.Enable',
         hint: 'TyphonJSQuestLog.Settings.countHidden.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean
      }
   },

   {
      moduleId,
      key: settings.dynamicBookmarkBackground,
      options: {
         name: 'TyphonJSQuestLog.Settings.dynamicBookmarkBackground.Enable',
         hint: 'TyphonJSQuestLog.Settings.dynamicBookmarkBackground.EnableHint',
         scope: scope.world,
         config: true,
         default: true,
         type: Boolean
      }
   },

   {
      moduleId,
      key: settings.navStyle,
      options: {
         name: 'TyphonJSQuestLog.Settings.navStyle.Enable',
         hint: 'TyphonJSQuestLog.Settings.navStyle.EnableHint',
         scope: scope.client,
         config: true,
         default: 'bookmarks',
         type: String,
         choices: {
            bookmarks: 'TyphonJSQuestLog.Settings.navStyle.bookmarks',
            classic: 'TyphonJSQuestLog.Settings.navStyle.classic'
         }
      }
   },

   {
      moduleId,
      key: settings.showTasks,
      options: {
         name: 'TyphonJSQuestLog.Settings.showTasks.Enable',
         hint: 'TyphonJSQuestLog.Settings.showTasks.EnableHint',
         scope: scope.world,
         config: true,
         default: 'default',
         type: String,
         choices: {
            default: 'TyphonJSQuestLog.Settings.showTasks.default',
            onlyCurrent: 'TyphonJSQuestLog.Settings.showTasks.onlyCurrent',
            no: 'TyphonJSQuestLog.Settings.showTasks.no'
         }
      }
   },

   {
      moduleId,
      key: settings.defaultPermission,
      options: {
         name: 'TyphonJSQuestLog.Settings.defaultPermissionLevel.Enable',
         hint: 'TyphonJSQuestLog.Settings.defaultPermissionLevel.EnableHint',
         scope: scope.world,
         config: true,
         default: 'Observer',
         type: String,
         choices: {
            OBSERVER: 'TyphonJSQuestLog.Settings.defaultPermissionLevel.OBSERVER',
            NONE: 'TyphonJSQuestLog.Settings.defaultPermissionLevel.NONE',
            OWNER: 'TyphonJSQuestLog.Settings.defaultPermissionLevel.OWNER'
         }
      }
   },

   {
      moduleId,
      key: settings.hideTQLFromPlayers,
      options: {
         name: 'TyphonJSQuestLog.Settings.hideTQLFromPlayers.Enable',
         hint: 'TyphonJSQuestLog.Settings.hideTQLFromPlayers.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean
      }
   },

   {
      moduleId,
      key: settings.notifyRewardDrop,
      options: {
         name: 'TyphonJSQuestLog.Settings.notifyRewardDrop.Enable',
         hint: 'TyphonJSQuestLog.Settings.notifyRewardDrop.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean
      }
   },

   {
      moduleId,
      key: settings.showFolder,
      options: {
         name: 'TyphonJSQuestLog.Settings.showFolder.Enable',
         hint: 'TyphonJSQuestLog.Settings.showFolder.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean
      }
   },

   // Settings not displayed in the module settings ---------------------------------------------------------------

   // Currently provides a hidden setting to set the default abstract reward image.
   // It may never be displayed in the module settings menu, but if it is in the future this is where it would go.
   {
      moduleId,
      key: settings.defaultAbstractRewardImage,
      options: {
         scope: scope.world,
         config: false,
         default: 'icons/svg/item-bag.svg',
         type: String
      }
   },

   /**
    * This is the most complex module setting handling as quite a bit of logic is contained below to handle
    * setting the primary quest. Since the onChange event does not pass the old and new value the old value for
    * {@link TQLSettings.primaryQuest} is stored in {@link TQLSessionConstants.currentPrimaryQuest} which is
    * initially set in {@link TQLHooks.foundryReady}.
    *
    * This setting is set from {@link Socket.setQuestPrimary} or the handler in Socket.
    *
    * `value` may be a quest ID or an empty string.
    */
   {
      moduleId,
      key: settings.primaryQuest,
      options: {
         scope: scope.world,
         config: false,
         default: '',
         type: String
      }
   },

   {
      moduleId,
      key: settings.questTrackerEnabled,
      options: {
         scope: scope.client,
         config: false,
         default: false,
         type: Boolean
      }
   },

   {
      moduleId,
      key: settings.questTrackerPinned,
      options: {
         scope: scope.client,
         config: false,
         type: Boolean,
         default: false
      }
   },

   {
      moduleId,
      key: settings.questTrackerPosition,
      options: {
         scope: scope.client,
         config: false,
         default: s_QUEST_TRACKER_DEFAULT
      }
   },

   {
      moduleId,
      key: settings.questTrackerResizable,
      options: {
         name: 'TyphonJSQuestLog.Settings.questTrackerResizable.Enable',
         hint: 'TyphonJSQuestLog.Settings.questTrackerResizable.EnableHint',
         scope: scope.client,
         config: true,
         default: false,
         type: Boolean
      }
   },
];
