import path             from 'path';

// The following plugins are for the main source bundle.

import alias            from '@rollup/plugin-alias';
import postcss          from 'rollup-plugin-postcss';       // Process Sass / CSS w/ PostCSS
import resolve          from '@rollup/plugin-node-resolve'; // This resolves NPM modules from node_modules.
import svelte           from 'rollup-plugin-svelte';
import { terser }       from 'rollup-plugin-terser';        // Terser is used for minification / mangling

// This plugin is for importing existing sourcemaps from NPM modules. Include it for
// any external imported source code that has sourcemaps available.
// import sourcemaps       from 'rollup-plugin-sourcemaps';

// Import config files for Terser and Postcss; refer to respective documentation for more information.
// We are using `require` here in order to be compliant w/ `fvttdev` for testing purposes.
import terserConfig  from './terser.config.mjs';
import postcssConfig from './postcss.config.mjs';

const s_COMPRESS = false;
const s_SOURCEMAPS = true;

export default () =>
{
   // Defines potential output plugins to use conditionally if the .env file indicates the bundles should be
   // minified / mangled.
   const outputPlugins = [];
   if (s_COMPRESS)
   {
      outputPlugins.push(terser(terserConfig));
   }

   // Defines whether source maps are generated / loaded from the .env file.
   const sourcemap = s_SOURCEMAPS;

   // Shortcuts
   const PS = path.sep;

   return [{
      input: `src${PS}init.js`,
      external: [                                  // Suppresses the warning and excludes ansi-colors from the
         'foundry-gsap'
      ],
      output: {
         file: `dist${PS}typhonjs-quest-log.js`,
         format: 'es',
         paths: {
            'foundry-gsap': '/scripts/greensock/esm/all.js'
         },
         plugins: outputPlugins,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      },
      plugins: [
         alias({
            entries: [
               { find: '#constants', replacement: './src/constants.js' }
            ]
         }),
         svelte({
            compilerOptions: {
               // enable run-time checks when not in production
               // dev: !production
               dev: true
            },
            onwarn: (warning, handler) =>
            {
               // Suppress `a11y-missing-attribute` for missing href in <a> links.
               if (warning.message.includes(`<a> element should have an href attribute`)) { return; }

               // Let Rollup handle all other warnings normally.
               handler(warning);
            },
         }),
         postcss(postcssConfig),                            // Engages PostCSS for Sass / CSS processing
         resolve({
            browser: true,
            dedupe: ['svelte']
         }),
         // sourcemaps()
      ]
   }];
};
