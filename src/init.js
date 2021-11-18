import TQLHooks               from './TQLHooks.js';

// Initializes the TyphonJS TinyMCE plugin for Oembed media.
import { initializePlugins }  from '@typhonjs-fvtt/runtime/tinymce';
initializePlugins();

import '../styles/init.scss';             // Include the module styles to be picked up by PostCSS.

// Initialize all Foundry hooks.
TQLHooks.init();
