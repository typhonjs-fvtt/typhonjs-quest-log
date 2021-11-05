import DOMPurify from '../../node_modules/dompurify/dist/purify.es.js';

// Only allow YouTube and Vimeo embeds through.
const s_REGEX = new RegExp('^(https://www.youtube.com/embed/|https://player.vimeo.com/)');

// When 'iframes' are allowed only accept ones where 'src' starts with a YouTube embed link; reject all others.
DOMPurify.addHook('uponSanitizeElement', (node, data) =>
{
   if (data.tagName === 'iframe')
   {
      const src = node.getAttribute('src') || '';
      if (!s_REGEX.test(src))
      {
         return node.parentNode.removeChild(node);
      }
   }
});

// Provide a new method that allows 'iframe' but with the 'src' requirement defined above.
// FORCE_BODY allows 'style' tags to be entered into TinyMCE code editor.
DOMPurify.sanitizeWithVideo = (dirty) =>
{
   return DOMPurify.sanitize(dirty, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
      FORCE_BODY: true
   });
};

export default DOMPurify;