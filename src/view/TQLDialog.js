/**
 * Stores any open TQLDialogImpl.
 *
 * @type {TQLDialogImpl}
 */
let s_DELETE_DIALOG = void 0;

/**
 * Provides a single dialog for confirming quest, task, & reward deletion.
 *
 * Note: You have been warned. This is tricky code. Please understand it before modifying. Feel free to ask questions:

 * Discord: MLeahy#4299 / Michael Leahy <support@typhonjs.io> (https://github.com/typhonrt)
 *
 * There presently is no modal dialog in Foundry and this dialog implementation repurposes a single dialog instance
 * through potentially multiple cycles of obtaining and resolving Promises storing the resolve function in the dialog
 * itself. There are four locations in the codebase where a delete confirmation dialog is invoked and awaited upon. Each
 * time one of the static methods below is invoked the previous the current promise resolves with undefined / void 0
 * and then the same dialog instance is reconfigured with new information about a successive delete confirmation
 * operation and brings the dialog to front and renders again. This provides reasonable semi-modal behavior from just a
 * single dialog instance shared across confirmation to delete quests, tasks, and rewards.
 */
export default class TQLDialog
{
   /**
    * Closes any open TQLDialogImpl that is associated with the questId or quest log. TQLDialogImpl gets associated
    * with the last app that invoked the dialog.
    *
    * @param {object}   [options] - Optional parameters.
    *
    * @param {string}   [options.questId] - The quest ID associated with a QuestPreview app.
    *
    * @param {boolean}  [options.isQuestLog] - Is the quest log closing.
    */
   static closeDialogs({ questId, isQuestLog = false } = {})
   {
      if (s_DELETE_DIALOG && (s_DELETE_DIALOG.tqlQuestId === questId || s_DELETE_DIALOG.tqlIsQuestLog === isQuestLog))
      {
         s_DELETE_DIALOG.close();
         s_DELETE_DIALOG = void 0;
      }
   }

   /**
    * Show a dialog to confirm quest deletion.
    *
    * @param {options} options - Optional parameters.
    *
    * @param {string} options.name - The name for the reward to delete.
    *
    * @param {string} options.result - The UUID of the reward to delete.
    *
    * @param {string|void} options.questId - The questId to track to auto-close the dialog when the QuestPreview closes.
    *
    * @returns {Promise<string|void>} Result of the delete confirmation dialog.
    */
   static async confirmDeleteQuest({ name, result, questId, isQuestLog = false })
   {
      if (s_DELETE_DIALOG && s_DELETE_DIALOG.rendered)
      {
         return s_DELETE_DIALOG.updateTQLData({
            name,
            result,
            questId,
            isQuestLog,
            title: game.i18n.localize('TyphonJSQuestLog.Quest'),
            body: 'TyphonJSQuestLog.DeleteDialog.BodyQuest'
         });
      }

      s_DELETE_DIALOG = void 0;

      return new Promise((resolve) =>
      {
         s_DELETE_DIALOG = new TQLDialogImpl({
            resolve,
            name,
            result,
            questId,
            isQuestLog,
            title: game.i18n.localize('TyphonJSQuestLog.Quest'),
            body: 'TyphonJSQuestLog.DeleteDialog.BodyQuest'
         });

         s_DELETE_DIALOG.render(true);
      });
   }

   /**
    * Show a dialog to confirm reward deletion.
    *
    * @param {options} options - Optional parameters.
    *
    * @param {string} options.name - The name for the reward to delete.
    *
    * @param {string} options.result - The UUID of the reward to delete.
    *
    * @param {string|void} options.questId - The questId to track to auto-close the dialog when the QuestPreview closes.
    *
    * @returns {Promise<string|void>} Result of the delete confirmation dialog.
    */
   static async confirmDeleteReward({ name, result, questId, isQuestLog = false })
   {
      if (s_DELETE_DIALOG && s_DELETE_DIALOG.rendered)
      {
         return s_DELETE_DIALOG.updateTQLData({
            name,
            result,
            questId,
            isQuestLog,
            title: game.i18n.localize('TyphonJSQuestLog.QuestPreview.Reward'),
            body: 'TyphonJSQuestLog.DeleteDialog.BodyReward'
         });
      }

      s_DELETE_DIALOG = void 0;

      return new Promise((resolve) =>
      {
         s_DELETE_DIALOG = new TQLDialogImpl({
            resolve,
            name,
            result,
            questId,
            isQuestLog,
            title: game.i18n.localize('TyphonJSQuestLog.QuestPreview.Reward'),
            body: 'TyphonJSQuestLog.DeleteDialog.BodyReward'
         });

         s_DELETE_DIALOG.render(true);
      });
   }

   /**
    * Show a dialog to confirm task deletion.
    *
    * @param {options} options - Optional parameters.
    *
    * @param {string} options.name - The name for the task to delete.
    *
    * @param {string} options.result - The UUIDv4 of the task to delete.
    *
    * @param {string|void} options.questId - The questId to track to auto-close the dialog when the QuestPreview closes.
    *
    * @returns {Promise<string|void>} Result of the delete confirmation dialog.
    */
   static async confirmDeleteTask({ name, result, questId, isQuestLog = false })
   {
      if (s_DELETE_DIALOG && s_DELETE_DIALOG.rendered)
      {
         return s_DELETE_DIALOG.updateTQLData({
            name,
            result,
            questId,
            isQuestLog,
            title: game.i18n.localize('TyphonJSQuestLog.QuestPreview.Objective'),
            body: 'TyphonJSQuestLog.DeleteDialog.BodyObjective'
         });
      }

      s_DELETE_DIALOG = void 0;

      return new Promise((resolve) =>
      {
         s_DELETE_DIALOG = new TQLDialogImpl({
            resolve,
            name,
            result,
            questId,
            isQuestLog,
            title: game.i18n.localize('TyphonJSQuestLog.QuestPreview.Objective'),
            body: 'TyphonJSQuestLog.DeleteDialog.BodyObjective'
         });

         s_DELETE_DIALOG.render(true);
      });
   }
}

/**
 * Provides the TQL dialog implementation.
 */
class TQLDialogImpl extends Dialog
{
   /**
    * @param {TQLDialogOptions} options TQLDialogImpl Options
    */
   constructor(options)
   {
      super(void 0, { minimizable: false });

      /**
       * Stores the options specific to the dialog
       *
       * @type {TQLDialogOptions}
       * @private
       */
      this._tqlOptions = options;

      /**
       * The Dialog options to set.
       *
       * @type {object}
       * @see https://foundryvtt.com/api/Dialog.html
       */
      this.data = {
         title: game.i18n.format('TyphonJSQuestLog.DeleteDialog.TitleDel', this._tqlOptions),
         content: `<h3>${game.i18n.format('TyphonJSQuestLog.DeleteDialog.HeaderDel', this._tqlOptions)}</h3>` +
          `<p>${game.i18n.localize(this._tqlOptions.body)}</p>`,
         buttons: {
            yes: {
               icon: '<i class="fas fa-trash"></i>',
               label: game.i18n.localize('TyphonJSQuestLog.DeleteDialog.Delete'),
               callback: () => this._tqlOptions.resolve(this._tqlOptions.result)
            },
            no: {
               icon: '<i class="fas fa-times"></i>',
               label: game.i18n.localize('TyphonJSQuestLog.DeleteDialog.Cancel'),
               callback: () => this._tqlOptions.resolve(void 0)
            }
         }
      };
   }

   /**
    * Overrides the close action to resolve the cached Promise with undefined.
    *
    * @returns {Promise<void>}
    */
   async close()
   {
      this._tqlOptions.resolve(void 0);
      return super.close();
   }

   /**
    * @returns {boolean} Returns {@link TQLDialogOptions.isQuestLog} from options.
    */
   get tqlIsQuestLog() { return this._tqlOptions.isQuestLog; }

   /**
    * @returns {string} Returns {@link TQLDialogOptions.questId} from options.
    */
   get tqlQuestId() { return this._tqlOptions.questId; }

   /**
    * Updates the TQLDialogOptions when a dialog is already showing and a successive delete operation is initiated.
    *
    * Resolves the currently cached Promise with undefined and cache a new Promise which is returned.
    *
    * @param {TQLDialogOptions} options - The new options to set for Dialog rendering and success return value.
    *
    * @returns {Promise<unknown>} The new Promise to await upon.
    */
   updateTQLData(options)
   {
      // Resolve old promise with undefined
      this._tqlOptions.resolve(void 0);

      // Set new options
      this._tqlOptions = options;

      // Create a new Promise that will store the resolve function in this TQLDialogImpl.
      const promise = new Promise((resolve) => { this._tqlOptions.resolve = resolve; });

      // Update title and content with new data.
      this.data.title = game.i18n.format('TyphonJSQuestLog.DeleteDialog.TitleDel', this._tqlOptions);
      this.data.content = `<h3>${game.i18n.format('TyphonJSQuestLog.DeleteDialog.HeaderDel', this._tqlOptions)}</h3>` +
       `<p>${game.i18n.localize(this._tqlOptions.body)}</p>`;

      // Bring the dialog to top and render again.
      this.bringToTop();
      this.render(true);

      // Return the new promise which is resolved from another update with undefined or the dialog confirmation action,
      // or the dialog being closed.
      return promise;
   }
}

/**
 * @typedef TQLDialogOptions
 *
 * @property {Function} [resolve] - The cached resolve function of the Dialog promise.
 *
 * @property {string}   name - The name of the data being deleted.
 *
 * @property {result}   result - The result to resolve when `OK` is pressed.
 *
 * @property {string}   questId - The associated QuestPreview by quest ID.
 *
 * @property {boolean}  isQuestLog - boolean indicating that the QuestLog owns the dialog.
 *
 * @property {string}   title - The title of the dialog.
 *
 * @property {string}   body - The body language file ID to use for dialog rendering.
 */
