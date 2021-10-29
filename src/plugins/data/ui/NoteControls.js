import { constants, settings } from '../../../constants.js';

/**
 * Defines the note controls which are added to the left-hand Foundry menu / UI. `onClick` callbacks are
 * added as necessary.
 */
export default class NoteControls
{
   static get()
   {
      return noteControls;
   }

   static onPluginLoad(ev)
   {
      this._eventbus = ev.eventbus;

      // Define an onClick callback using the plugin eventbus.
      if (noteControls[0].onClick === void 0)
      {
         noteControls[0].onClick = () =>
         {
            this?._eventbus.trigger('tql:viewmanager:quest:log:render', true, { focus: true });
         };
      }

      ev.eventbus.on('tql:data:notecontrol:get', this.get, this, { guard: true });
   }
}

/**
 * Defines the left-hand UI control note buttons.
 *
 * @type {object[]}
 */
const noteControls = [
   {
      name: constants.moduleName,
      title: 'TyphonJSQuestLog.QuestLogButton',
      icon: 'fas fa-scroll',
      visible: true,
      button: true
   },
   {
      name: 'typhonjs-quest-log-floating-window',
      title: 'TyphonJSQuestLog.QuestTracker.Title',
      icon: 'fas fa-tasks',
      visible: true,
      onClick: async () => { await game.settings.set(constants.moduleName, settings.questTrackerEnable, true); },
      button: true
   }
];