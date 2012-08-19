var path = require('path');

module.exports = function(grunt) {

  // Its role is to handle the resolving of path configuration value accross
  // several possible places, with the following order or precendence:
  //
  // - ./config/paths.js          - next to application gruntfile
  // - ~/.yeoman/config/paths.js  - in user's home directory, for system-wide
  //                                paths accross multiple projects
  //
  // And default values in this path grunt helper.
  //
  // We need to handle some sort of caching for these paths, read only once
  // and then reused from memory. We use the grunt config object for that.
  grunt.registerHelper( 'paths', function(value) {
    var paths = grunt.helper('paths:init');
    return paths[value] || '';
  });


  // Takes care of initing the grunt configuration and cache the path values
  // from various source, including:
  //
  // - ./config/paths.js          - next to application gruntfile
  // - ~/.yeoman/config/paths.js  - in user's home directory, for system-wide
  //                                paths accross multiple projects
  grunt.registerHelper( 'paths:init', function() {
    var paths = grunt.config( 'paths.config' );
    if(paths) {
      return paths;
    }

    // appconfig refers to the application paths config (in ./config/paths.{js|coffee})
    var appconfig = grunt.config('paths.appconfig') || grunt.helper( 'paths:require', './config/paths' );

    // userconfig is matching the system-wide path configuration for the
    // current user (in ~/.yeoman/config/paths.{js|coffee})
    var userconfig = grunt.config('paths.userconfig') || grunt.helper( 'paths:require', '~/.yeoman/config/paths' );

    // merge the two (not a deep extend, paths here should be a flat list of
    // possible paths)
    paths = grunt.util._.defaults(appconfig, userconfig, {
      app: 'app',
      test: 'test',
      output: 'dist',
      staging: 'temp',
      scripts: 'scripts',
      styles: 'styles',
      images: 'images',
      bower: 'app/scripts/vendor'
    });

    // update the cache
    grunt.config( 'paths.appconfig', appconfig );
    grunt.config( 'paths.userconfig', userconfig );
    grunt.config( 'paths.config', paths );

    return paths;
  });

  // A special purpose `require` wrapper. When the `pathname` begins with `~/`,
  // then its value is prefixed by the user $HOME dir in a cross-system
  // friendly way.
  //
  // - pathname - A string value that is simply pass through node's `require`.
  //
  // Returns the given module or `{}`.
  grunt.registerHelper( 'paths:require', function(pathname) {
    var home = /^~\//;
    // sweet home
    var homepath = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
    if(home.test( pathname )) {
      pathname = pathname.replace( home, path.join(homepath, '/') );
    }

    try {
      return require( pathname );
    } catch(e) {
      return {};
    }
  });


  // Recursively expand yeoman specific config directives. By default, grunt
  // only expands config and json directives.
  var directiveRe = /<([^>]*)>/g;
  grunt.registerHelper( 'paths:process', function(config) {
    grunt.helper('paths:init');

    config = config || grunt.config();
    config = grunt.util.recurse( config, function(value) {
      if (typeof value !== 'string') { return value; }
      // grunt internally only handle values as String or Array with a pattern
      // like `^<(.*)>$`, here we want to be able to parse multiple directives
      //
      //    var parts = grunt.task.getDirectiveParts( value ) || [];
      //
      var directives = value.match(directiveRe) || [];
      directives.forEach(function(directive) {
        // Split the name into parts.
        var parts = directive.replace(/^<|>$/g, '').split(':');
        // If a matching helper was found, process the directive.
        if(grunt.task._helpers[parts[0]]) {
          value = value.replace(directive, grunt.task.directive(directive));
        }
      });
      return value;
    });

    var paths = grunt.config('paths.config');

    // make sure to re init (update) the config object of grunt (returns a
    // shallow clone of the actual config data on grunt.config())
    grunt.initConfig( config );

    // and setup the `paths` key with what was resolved in `path.config`
    grunt.config( 'paths', paths );
  });
};
