import { questTabIndex } from "#constants";

export default class PositionValidator
{
   /**
    * Updates the table height. This is a leftover hack that will be fixed.
    *
    * Some game systems and custom UI theming modules provide hard overrides on overflow-x / overflow-y styles. Alas we
    * need to set these for '.window-content' to 'visible' which will cause an issue for very long tables. Thus we must
    * manually set the table max-heights based on the position / height of the {@link Application}.
    *
    * @param {QuestLog} app - The quest log.
    *
    * @param {PositionData}   position - The complete position with top, left, width, height keys.
    *
    * @returns {PositionData} Adjusted position data.
    */
   static checkPosition(app, position)
   {
      // Retrieve all the table elements.
      const tableElements = $('#typhonjs-quest-log .table');

      // Retrieve the active table.
      const tabIndex = questTabIndex[app?._tabs[0]?.active];
      const table = tableElements[tabIndex];

      if (table)
      {
         const tqlPosition = $('#typhonjs-quest-log')[0].getBoundingClientRect();
         const tablePosition = table.getBoundingClientRect();

         // Manually calculate the max height for the table based on the position of the main window div and table.
         tableElements.css('max-height', `${position.height - (tablePosition.top - tqlPosition.top + 16)}px`);
      }

      return position;
   }
}