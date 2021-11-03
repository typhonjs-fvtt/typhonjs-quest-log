import { sessionConstants }   from '#constants';

/**
 * Creates a Foundry {@link ApplicationHeaderButton} supported by `HeaderButton.svelte`.
 */
export class ShowBackground
{
   constructor(eventbus)
   {
      this._eventbus = eventbus;

      const showBackground = this._eventbus.triggerSync('tql:storage:session:item:get',
       sessionConstants.trackerShowBackground);

      this.class = 'show-background';
      this.icon = showBackground ? 'fas fa-fill on' : 'fas fa-fill off';
      this.title = showBackground ? 'TyphonJSQuestLog.QuestTracker.Tooltips.BackgroundUnshow' :
       'TyphonJSQuestLog.QuestTracker.Tooltips.BackgroundShow';
   }

   onclick()
   {
      const newShowBackground = this._eventbus.triggerSync('tql:storage:session:item:boolean:swap',
       sessionConstants.trackerShowBackground);

      this.icon = newShowBackground ? 'fas fa-fill on' : 'fas fa-fill off';

      this.title = newShowBackground ? 'TyphonJSQuestLog.QuestTracker.Tooltips.BackgroundUnshow' :
       'TyphonJSQuestLog.QuestTracker.Tooltips.BackgroundShow';
   }
}

/**
 * Creates a Foundry {@link ApplicationHeaderButton} supported by `HeaderButton.svelte`.
 */
export class ShowPrimary
{
   constructor(eventbus)
   {
      this._eventbus = eventbus;

      const primaryState = this._eventbus.triggerSync('tql:storage:session:item:get',
       sessionConstants.trackerShowPrimary);

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