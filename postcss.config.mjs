import autoprefixer     from 'autoprefixer';             // Adds vendor specific extensions to CSS
import postcssPresetEnv from 'postcss-preset-env';       // Popular postcss plugin for next gen CSS usage.

// Note that the output file is `typhonjs-quest-log.css.css` which matches the esmodule entry point. This is to mirror
// how `fvttdev` works.

export default {
   inject: false,                                        // Don't inject CSS into <HEAD>
   extract: `typhonjs-quest-log.css`,                    // Output to `typhonjs-quest-log.css` in directory of the bundle
   extensions: ['.scss', '.sass', '.css'],               // File extensions
   plugins: [autoprefixer, postcssPresetEnv],            // Postcss plugins to use
   use: ['sass']                                         // Use sass / dart-sass
};