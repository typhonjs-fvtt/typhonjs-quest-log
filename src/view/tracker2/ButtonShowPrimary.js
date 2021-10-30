import { sessionConstants }   from '#constants';

/**
 * Creates a Foundry {@link ApplicationHeaderButton} supported by `HeaderButton.svelte`.
 */
export default class ButtonShowPrimary
{
   constructor(eventbus)
   {
      this._eventbus = eventbus;

      const primaryState = this._eventbus.triggerSync('tql:storage:session:item:get',
       sessionConstants.trackerShowPrimary, false);

      this.class = 'show-primary';
      this.icon = primaryState ? 'fas fa-star' : 'far fa-star';
      this.title = primaryState ? 'TyphonJSQuestLog.QuestTracker.Tooltips.PrimaryQuestUnshow' :
       'TyphonJSQuestLog.QuestTracker.Tooltips.PrimaryQuestShow';
   }

   onclick()
   {
      const newPrimary = this._eventbus.triggerSync('tql:storage:session:item:boolean:swap',
       sessionConstants.trackerShowPrimary);

      this.icon = newPrimary ? 'fas fa-star' : 'far fa-star';

      this.title = newPrimary ? 'TyphonJSQuestLog.QuestTracker.Tooltips.PrimaryQuestUnshow' :
       'TyphonJSQuestLog.QuestTracker.Tooltips.PrimaryQuestShow';
   }
}