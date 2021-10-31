import TQLHooks   from './TQLHooks.js';

import '../external/typhonjs-oembed.js';  // Loads the TyphonJS oEmbed TinyMCE plugin.

import '../styles/init.scss';             // Include the module styles to be picked up by PostCSS.

// import '@typhonjs-fvtt/svelte/styles/application-shell.css'; // Include the ApplicationShell CSS.

// Initialize all Foundry hooks.
TQLHooks.init();
