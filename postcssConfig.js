import autoprefixer     from 'autoprefixer';             // Adds vendor specific extensions to CSS
import postcssPresetEnv from 'postcss-preset-env';       // Popular postcss plugin for next gen CSS usage.
import cssnano          from 'cssnano';

// Provides a function to return a new PostCSS configuration setting the extract parameter.
export default function({ extract, compress = false, sourceMap = false } = {})
{
   const plugins = compress ? [autoprefixer, postcssPresetEnv, cssnano] : [autoprefixer, postcssPresetEnv];

   return {
      inject: false,                                        // Don't inject CSS into <HEAD>
      extract,
      sourceMap,
      extensions: ['.scss', '.sass', '.css'],               // File extensions
      plugins,                                              // Postcss plugins to use
      use: ['sass']                                         // Use sass / dart-sass
   }
};