import { sessionConstants }   from '#constants';

/**
 * Generates the ApplicationHeaderButton data for the QuestTracker.
 *
 * @param {Eventbus} eventbus - Plugin manager eventbus.
 *
 * @returns {ApplicationHeaderButton[]} An array of header buttons.
 */
export default function createHeaderButtons(eventbus)
{
   const showBackground = eventbus.triggerSync('tql:storage:session:item:get',
    sessionConstants.trackerShowBackground);

   const primaryState = eventbus.triggerSync('tql:storage:session:item:get',
    sessionConstants.trackerShowPrimary);

   return [
      {
         class: 'show-background',
         icon: showBackground ? 'fas fa-fill on' : 'fas fa-fill off',
         title: showBackground ? 'TyphonJSQuestLog.QuestTracker.Tooltips.BackgroundUnshow' :
          'TyphonJSQuestLog.QuestTracker.Tooltips.BackgroundShow',

         onclick: function()
         {
            const newShowBackground = eventbus.triggerSync('tql:storage:session:item:boolean:swap',
             sessionConstants.trackerShowBackground);

            this.icon = newShowBackground ? 'fas fa-fill on' : 'fas fa-fill off';

            this.title = newShowBackground ? 'TyphonJSQuestLog.QuestTracker.Tooltips.BackgroundUnshow' :
             'TyphonJSQuestLog.QuestTracker.Tooltips.BackgroundShow';
         }
      },
      {
         class: 'show-primary',
         icon: primaryState ? 'fas fa-star' : 'far fa-star',
         title: primaryState ? 'TyphonJSQuestLog.QuestTracker.Tooltips.PrimaryQuestUnshow' :
          'TyphonJSQuestLog.QuestTracker.Tooltips.PrimaryQuestShow',

         onclick: function()
         {
            const newPrimary = eventbus.triggerSync('tql:storage:session:item:boolean:swap',
             sessionConstants.trackerShowPrimary);

            this.icon = newPrimary ? 'fas fa-star' : 'far fa-star';

            this.title = newPrimary ? 'TyphonJSQuestLog.QuestTracker.Tooltips.PrimaryQuestUnshow' :
             'TyphonJSQuestLog.QuestTracker.Tooltips.PrimaryQuestShow';
         }
      }
   ];
}