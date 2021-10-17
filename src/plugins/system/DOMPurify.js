import DOMPurify from '../../../external/DOMPurify.js';

export default class DOMPurifyPlugin
{
   static sanitize(dirty)
   {
      return DOMPurify.sanitize(dirty);
   }

   static sanitizeWithVideo(dirty)
   {
      return DOMPurify.sanitizeWithVideo(dirty);
   }

   static onPluginLoad(ev)
   {
      ev.eventbus.on('tql:dompurify:sanitize', DOMPurifyPlugin.sanitize, DOMPurifyPlugin);
      ev.eventbus.on('tql:dompurify:sanitize:video', DOMPurifyPlugin.sanitizeWithVideo, DOMPurifyPlugin);
   }
}