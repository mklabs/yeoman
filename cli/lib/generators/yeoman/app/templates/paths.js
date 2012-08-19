
// Simple configuration for key directories in a yeoman application.
//
// These values are available through `grunt.config('paths')` and specifically
// used in various generators.
//
// Once implemented, paths configured here can be specified in a system-wide
// way through `~/.yeoman/config/`.
//
// The result of the path configuration should be a mixin between the two, this
// current file defining defaults and the user configuration.

module.exports = {
  // staging directory
  staging: 'temp',
  // final build output
  output : 'dist',
  // application directory, some like it called `src/main`
  app: 'app',
  // test directory, some like it called `specs/`
  test: 'test',
  // specify an alternate install location for Bower
  bower: 'app/scripts/vendor',

  // Application directory paths
  // ---------------------------
  //
  // Paths below are all relative to the `app` directory specified above.

  // JavaScript / CoffeeScript source files, some like it called `js`,
  // `javascript` or just `scripts`. Matter or taste! You may even go for
  // something like `app/assets/javascript`.
  scripts: 'js',

  // Same for your stylesheets. `css`, `stylesheets` or simply `styles`.
  styles: 'css',

  // Images directory, specificically used along the img task.
  images: 'images'
};
