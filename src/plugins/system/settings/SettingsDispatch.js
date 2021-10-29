import { constants, settings } from '../../../constants.js';

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

/**
 * Provides registration for all module settings.
 */
export default class SettingsDispatch
{
   static onPluginLoad(ev)
   {
      this._eventbus = ev.eventbus;
      this.register();
   }

   /**
    * Registers all module settings.
    *
    * @see {@link settings}
    */
   static register()
   {
      game.settings.register(constants.moduleName, settings.allowPlayersDrag, {
         name: 'TyphonJSQuestLog.Settings.allowPlayersDrag.Enable',
         hint: 'TyphonJSQuestLog.Settings.allowPlayersDrag.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean,
         onChange: (value) =>
         {
            this._eventbus.trigger(`tql:settings:change:any`, { setting: settings.allowPlayersDrag, value });
            this._eventbus.trigger(`tql:settings:change:${settings.allowPlayersDrag}`, value);
         }
      });

      game.settings.register(constants.moduleName, settings.allowPlayersCreate, {
         name: 'TyphonJSQuestLog.Settings.allowPlayersCreate.Enable',
         hint: 'TyphonJSQuestLog.Settings.allowPlayersCreate.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean,
         onChange: (value) =>
         {
            this._eventbus.trigger(`tql:settings:change:any`, { setting: settings.allowPlayersCreate, value });
            this._eventbus.trigger(`tql:settings:change:${settings.allowPlayersCreate}`, value);
         }
      });

      game.settings.register(constants.moduleName, settings.allowPlayersAccept, {
         name: 'TyphonJSQuestLog.Settings.allowPlayersAccept.Enable',
         hint: 'TyphonJSQuestLog.Settings.allowPlayersAccept.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean,
         onChange: (value) =>
         {
            this._eventbus.trigger(`tql:settings:change:any`, { setting: settings.allowPlayersAccept, value });
            this._eventbus.trigger(`tql:settings:change:${settings.allowPlayersAccept}`, value);
         }
      });

      game.settings.register(constants.moduleName, settings.trustedPlayerEdit, {
         name: 'TyphonJSQuestLog.Settings.trustedPlayerEdit.Enable',
         hint: 'TyphonJSQuestLog.Settings.trustedPlayerEdit.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean,
         onChange: (value) =>
         {
            this._eventbus.trigger(`tql:settings:change:any`, { setting: settings.trustedPlayerEdit, value });
            this._eventbus.trigger(`tql:settings:change:${settings.trustedPlayerEdit}`, value);
         }
      });

      game.settings.register(constants.moduleName, settings.countHidden, {
         name: 'TyphonJSQuestLog.Settings.countHidden.Enable',
         hint: 'TyphonJSQuestLog.Settings.countHidden.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean,
         onChange: (value) =>
         {
            this._eventbus.trigger(`tql:settings:change:any`, { setting: settings.countHidden, value });
            this._eventbus.trigger(`tql:settings:change:${settings.countHidden}`, value);
         }
      });

      game.settings.register(constants.moduleName, settings.dynamicBookmarkBackground, {
         name: 'TyphonJSQuestLog.Settings.dynamicBookmarkBackground.Enable',
         hint: 'TyphonJSQuestLog.Settings.dynamicBookmarkBackground.EnableHint',
         scope: scope.world,
         config: true,
         default: true,
         type: Boolean,
         onChange: (value) =>
         {
            this._eventbus.trigger(`tql:settings:change:any`, { setting: settings.dynamicBookmarkBackground, value });
            this._eventbus.trigger(`tql:settings:change:${settings.dynamicBookmarkBackground}`, value);
         }
      });

      game.settings.register(constants.moduleName, settings.navStyle, {
         name: 'TyphonJSQuestLog.Settings.navStyle.Enable',
         hint: 'TyphonJSQuestLog.Settings.navStyle.EnableHint',
         scope: scope.client,
         config: true,
         default: 'bookmarks',
         type: String,
         choices: {
            bookmarks: 'TyphonJSQuestLog.Settings.navStyle.bookmarks',
            classic: 'TyphonJSQuestLog.Settings.navStyle.classic'
         },
         onChange: (value) =>
         {
            this._eventbus.trigger(`tql:settings:change:any`, { setting: settings.navStyle, value });
            this._eventbus.trigger(`tql:settings:change:${settings.navStyle}`, value);
         }
      });

      game.settings.register(constants.moduleName, settings.showTasks, {
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
         },
         onChange: (value) =>
         {
            this._eventbus.trigger(`tql:settings:change:any`, { setting: settings.showTasks, value });
            this._eventbus.trigger(`tql:settings:change:${settings.showTasks}`, value);
         }
      });

      game.settings.register(constants.moduleName, settings.defaultPermission, {
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
         },
         onChange: (value) =>
         {
            this._eventbus.trigger(`tql:settings:change:any`, { setting: settings.defaultPermission, value });
            this._eventbus.trigger(`tql:settings:change:${settings.defaultPermission}`, value);
         }
      });

      game.settings.register(constants.moduleName, settings.hideTQLFromPlayers, {
         name: 'TyphonJSQuestLog.Settings.hideTQLFromPlayers.Enable',
         hint: 'TyphonJSQuestLog.Settings.hideTQLFromPlayers.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean,
         onChange: (value) =>
         {
            this._eventbus.trigger(`tql:settings:change:any`, { setting: settings.hideTQLFromPlayers, value });
            this._eventbus.trigger(`tql:settings:change:${settings.hideTQLFromPlayers}`, value);
         }
      });

      game.settings.register(constants.moduleName, settings.notifyRewardDrop, {
         name: 'TyphonJSQuestLog.Settings.notifyRewardDrop.Enable',
         hint: 'TyphonJSQuestLog.Settings.notifyRewardDrop.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean,
         onChange: (value) =>
         {
            this._eventbus.trigger(`tql:settings:change:any`, { setting: settings.notifyRewardDrop, value });
            this._eventbus.trigger(`tql:settings:change:${settings.notifyRewardDrop}`, value);
         }
      });

      game.settings.register(constants.moduleName, settings.showFolder, {
         name: 'TyphonJSQuestLog.Settings.showFolder.Enable',
         hint: 'TyphonJSQuestLog.Settings.showFolder.EnableHint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean,
         onChange: (value) =>
         {
            this._eventbus.trigger(`tql:settings:change:any`, { setting: settings.showFolder, value });
            this._eventbus.trigger(`tql:settings:change:${settings.showFolder}`, value);
         }
      });

// Settings not displayed in the module settings ---------------------------------------------------------------------

      // Currently provides a hidden setting to set the default abstract reward image.
      // It may never be displayed in the module settings menu, but if it is in the future this is where it would go.
      game.settings.register(constants.moduleName, settings.defaultAbstractRewardImage, {
         scope: scope.world,
         config: false,
         default: 'icons/svg/item-bag.svg',
         type: String,
         onChange: (value) =>
         {
            this._eventbus.trigger(`tql:settings:change:any`, { setting: settings.defaultAbstractRewardImage, value });
            this._eventbus.trigger(`tql:settings:change:${settings.defaultAbstractRewardImage}`, value);
         }
      });

      game.settings.register(constants.moduleName, settings.questTrackerEnable, {
         scope: scope.client,
         config: false,
         default: false,
         type: Boolean,
         onChange: (value) =>
         {
            this._eventbus.trigger(`tql:settings:change:any`, { setting: settings.questTrackerEnable, value });
            this._eventbus.trigger(`tql:settings:change:${settings.questTrackerEnable}`, value);
         }
      });

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
      game.settings.register(constants.moduleName, settings.primaryQuest, {
         scope: scope.world,
         config: false,
         default: '',
         type: String,
         onChange: (value) =>
         {
            this._eventbus.trigger(`tql:settings:change:any`, { setting: settings.primaryQuest, value });
            this._eventbus.trigger(`tql:settings:change:${settings.primaryQuest}`, value);
         }
      });

      game.settings.register(constants.moduleName, settings.questTrackerPinned, {
         scope: scope.client,
         config: false,
         type: Boolean,
         default: false,
         onChange: (value) =>
         {
            this._eventbus.trigger(`tql:settings:change:any`, { setting: settings.questTrackerPinned, value });
            this._eventbus.trigger(`tql:settings:change:${settings.questTrackerPinned}`, value);
         }
      });

      game.settings.register(constants.moduleName, settings.questTrackerPosition, {
         scope: scope.client,
         config: false,
         default: s_QUEST_TRACKER_DEFAULT,
         onChange: (value) =>
         {
            this._eventbus.trigger(`tql:settings:change:any`, { setting: settings.questTrackerPosition, value });
            this._eventbus.trigger(`tql:settings:change:${settings.questTrackerPosition}`, value);
         }
      });

      game.settings.register(constants.moduleName, settings.questTrackerResizable, {
         name: 'TyphonJSQuestLog.Settings.questTrackerResizable.Enable',
         hint: 'TyphonJSQuestLog.Settings.questTrackerResizable.EnableHint',
         scope: scope.client,
         config: true,
         default: false,
         type: Boolean,
         onChange: (value) =>
         {
            this._eventbus.trigger(`tql:settings:change:any`, { setting: settings.questTrackerResizable, value });
            this._eventbus.trigger(`tql:settings:change:${settings.questTrackerResizable}`, value);
         }
      });
   }
}
