import { HandlebarsApplication } from '@typhonjs-fvtt/runtime/svelte/application/legacy';

import { constants }             from '#constants';
import { scale }                 from 'svelte/transition';
let count = 0;
export default class TestEmptyHB extends HandlebarsApplication
{
   /**
    * Default Application options
    *
    * @returns {object} options - Application options.
    * @see https://foundryvtt.com/api/Application.html#options
    */
   static get defaultOptions()
   {
      return foundry.utils.mergeObject(super.defaultOptions, {
         id: 'test-empty-hb',
         classes: ['test-empty-hb'],
         template: 'modules/typhonjs-quest-log/templates/demo.html',
         popOut: false,
         width: 700,
         height: 480,
         // minimizable: true,
         // resizable: true,
         // title: game.i18n.localize('TyphonJSQuestLog.QuestLog.Title'),
         svelte: {
            props: {
               transition: scale,
               transitionOptions: { duration: 2000 }
            }
         }
      });
   }

   setPosition(pos)
   {
console.trace();
      super.setPosition(pos);
   }

   /**
    * Retrieves the sorted quest collection from the {@link QuestDB.sortCollect} and sets several state parameters for
    * GM / player / trusted player edit along with several module settings: {@link TQLSettings.allowPlayersAccept},
    * {@link TQLSettings.allowPlayersCreate}, {@link TQLSettings.showTasks} and {@link TQLSettings.navStyle}.
    *
    * @override
    * @inheritDoc
    * @see https://foundryvtt.com/api/FormApplication.html#getData
    */
   async getData(options = {})
   {
      const title = `testing-${count++}`;

      return foundry.utils.mergeObject(super.getData(), {
         title
      });
   }
}