import TQLHooks   from './TQLHooks.js';

// TODO: substitute the direct lib path with the Node module when available.
import { initializePlugins } from '/modules/typhonjs/tinymce/initializePlugins.js';
initializePlugins();

import '../styles/init.scss';             // Include the module styles to be picked up by PostCSS.

// Initialize all Foundry hooks.
TQLHooks.init();
