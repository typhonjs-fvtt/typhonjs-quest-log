import alias         from '@rollup/plugin-alias';
import commonjs      from '@rollup/plugin-commonjs';
import postcss       from 'rollup-plugin-postcss';       // Process Sass / CSS w/ PostCSS
import resolve       from '@rollup/plugin-node-resolve'; // This resolves NPM modules from node_modules.
import svelte        from 'rollup-plugin-svelte';
// import preprocess    from 'svelte-preprocess';
import { terser }    from 'rollup-plugin-terser';        // Terser is used for minification / mangling
import virtual       from '@rollup/plugin-virtual';

// `typhonjs-quest-log.css`
// This plugin is for importing existing sourcemaps from NPM modules. Include it for
// any external imported source code that has sourcemaps available.
// import sourcemaps       from 'rollup-plugin-sourcemaps';

// Import config files for Terser and Postcss; refer to respective documentation for more information.
// We are using `require` here in order to be compliant w/ `fvttdev` for testing purposes.
import terserConfig  from './terser.config.mjs';
import postcssConfig from './postcss.config.mjs';

const s_COMPRESS = false;
const s_SOURCEMAPS = false;
const s_PRODUCTION = false;

const postcssMain = postcssConfig({
   extract: 'typhonjs-quest-log.css',
   compress: s_COMPRESS,
   sourceMap: s_SOURCEMAPS
});

const postcssTinyMCE = postcssConfig({
   extract: 'dist/init-tinymce.css',
   compress: s_COMPRESS,
   sourceMap: s_SOURCEMAPS
});

// Defines @typhonjs-fvtt/svelte imports to exclude and foundry-gsap.
const s_LOCAL_EXTERNAL = [
   '@typhonjs-fvtt/svelte', '@typhonjs-fvtt/svelte/action', '@typhonjs-fvtt/svelte/component',
   '@typhonjs-fvtt/svelte/gsap', '@typhonjs-fvtt/svelte/handler', '@typhonjs-fvtt/svelte/helper',
   '@typhonjs-fvtt/svelte/legacy', '@typhonjs-fvtt/svelte/store', '@typhonjs-fvtt/svelte/transition',
   '@typhonjs-fvtt/svelte/util',
   '@typhonjs-fvtt/svelte/plugin/data', '@typhonjs-fvtt/svelte/plugin/system',

   'svelte/easing',
   'svelte/internal',
   'svelte/transition',

   `foundry-gsap`,  // Replaced by consumer for Foundry GSAP path.

   `@typhonjs-plugin/manager`,

   // `#collect`,
   `#DOMPurify`,

   '/modules/typhonjs/tinymce/initializePlugins.js'
];

// Defines @typhonjs-fvtt/svelte browser imports to and foundry-gsap.
const s_LIBRARY_PATHS = {
   '@typhonjs-fvtt/svelte': '/modules/typhonjs/svelte/index.js',
   '@typhonjs-fvtt/svelte/action': '/modules/typhonjs/svelte/action.js',
   '@typhonjs-fvtt/svelte/component': '/modules/typhonjs/svelte/component.js',
   '@typhonjs-fvtt/svelte/gsap': '/modules/typhonjs/svelte/gsap.js',
   '@typhonjs-fvtt/svelte/handler': '/modules/typhonjs/svelte/handler.js',
   '@typhonjs-fvtt/svelte/helper': '/modules/typhonjs/svelte/helper.js',
   '@typhonjs-fvtt/svelte/legacy': '/modules/typhonjs/svelte/legacy.js',
   '@typhonjs-fvtt/svelte/store': '/modules/typhonjs/svelte/store.js',
   '@typhonjs-fvtt/svelte/transition': '/modules/typhonjs/svelte/transition.js',
   '@typhonjs-fvtt/svelte/util': '/modules/typhonjs/svelte/util.js',
   '@typhonjs-fvtt/svelte/plugin/data': '/modules/typhonjs/svelte/plugin/data.js',
   '@typhonjs-fvtt/svelte/plugin/system': '/modules/typhonjs/svelte/plugin/system.js',

   'svelte/easing': '/modules/typhonjs/svelte/easing.js',
   'svelte/internal': '/modules/typhonjs/svelte/internal.js',
   'svelte/transition': '/modules/typhonjs/svelte/transition.js',

   'foundry-gsap': '/scripts/greensock/esm/all.js',

   '@typhonjs-plugin/manager': '/modules/typhonjs/plugin/manager.js',

   // '#collect': '/modules/typhonjs/collectjs/collect.js',
   '#DOMPurify': '/modules/typhonjs/dompurify/DOMPurify.js',
};

const svelteBuild = () =>
{
   return {
      name: 'svelte-shared-build',
      options(opts)
      {
         const externalOpts = Object.keys(s_LIBRARY_PATHS);
         opts.external = Array.isArray(opts.external) ? [...externalOpts, ...opts.external] : externalOpts;

         if (Array.isArray(opts.output))
         {
            for (const outputOpts of opts.output)
            {
               outputOpts.paths = typeof outputOpts.paths === 'object' ? { ...outputOpts.paths, ...s_LIBRARY_PATHS } :
                s_LIBRARY_PATHS;
            }
         }
      }
   };
};

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

   return [
      {  // The main module bundle
         input: `src/init.js`,
         external: s_LOCAL_EXTERNAL,
         output: {
            file: `dist/typhonjs-quest-log.js`,
            format: 'es',
            paths: s_LIBRARY_PATHS,
            plugins: outputPlugins,
            sourcemap,
            // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
         },
         plugins: [
            svelteBuild(),
            alias({
               entries: [
                  { find: '#collect', replacement: './src/npm/collect.js' },
                  { find: '#constants', replacement: './src/constants.js' }
               ]
            }),
            svelte({
               compilerOptions: {
                  // enable run-time checks when not in production
                  dev: !s_PRODUCTION
               },
               // preprocess: preprocess(),
               onwarn: (warning, handler) =>
               {
                  // Suppress `a11y-missing-attribute` for missing href in <a> links.
                  if (warning.message.includes(`<a> element should have an href attribute`)) { return; }

                  // Let Rollup handle all other warnings normally.
                  handler(warning);
               },
            }),
            postcss(postcssMain),
            resolve({
               browser: true,
               dedupe: ['svelte']
            }),
            commonjs()
            // sourcemaps()
         ]
      },
      {  // A 2nd virtual bundle to process TinyMCE CSS separately.
         input: 'pack',
         output: {
            format: 'es',
            file: 'empty.js',
            plugins: outputPlugins
         },
         plugins: [
            virtual({
               pack: `import './styles/init-tinymce.scss';`
            }),
            postcss(postcssTinyMCE),
         ]
      }
   ];
};
