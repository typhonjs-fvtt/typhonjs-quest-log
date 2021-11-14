import TQLHooks   from './TQLHooks.js';

// TODO REMOVE: now loading this from typhonjs common runtime.
// import '@typhonjs-tinymce/oembed';        // Loads the TyphonJS oEmbed TinyMCE plugin.

import '../styles/init.scss';             // Include the module styles to be picked up by PostCSS.

// Initialize all Foundry hooks.
TQLHooks.init();
