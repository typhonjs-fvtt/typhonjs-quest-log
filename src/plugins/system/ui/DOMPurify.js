import DOMPurify from '#DOMPurify';

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
      const opts = { guard: true };

      ev.eventbus.on('tql:dompurify:sanitize', this.sanitize, this, opts);
      ev.eventbus.on('tql:dompurify:sanitize:video', this.sanitizeWithVideo, this, opts);
   }
}