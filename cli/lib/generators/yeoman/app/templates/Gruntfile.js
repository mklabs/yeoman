module.exports = function( grunt ) {
  'use strict';
  //
  // Grunt configuration:
  //
  // https://github.com/cowboy/grunt/blob/master/docs/getting_started.md
  //
  grunt.initConfig({

    // Project configuration
    // --------------------

    // specify an alternate install location for Bower,
    // this will copy resolved files to this specific directory
    bower: {
      dir: '<paths:bower>'
    },

    // Coffee to JS compilation
    coffee: {
      dist: {
        src: '<paths:app>/<paths:scripts>/**/*.coffee',
        dest: '<paths:app>/<paths:scripts>'
      }
    },

    // compile .scss/.sass to .css using Compass
    compass: {
      dist: {
        // http://compass-style.org/help/tutorials/configuration-reference/#configuration-properties
        options: {
          css_dir: '<paths:styles>',
          sass_dir: '<paths:styles>',
          images_dir: '<paths:images>',
          javascripts_dir: '<paths:scripts>',
          force: true
        }
      }
    },

    // generate application cache manifest
    manifest:{
      dest: ''
    },

    // headless testing through PhantomJS
    <%= test_framework %>: {
      all: ['<paths:test>/**/*.html']
    },

    // default watch configuration
    watch: {
      coffee: {
        files: '<config:coffee.dist.src>',
        tasks: 'coffee reload'
      },
      compass: {
        files: [
          '<paths:app>/<paths:styles>/**/*.{scss,sass}'
        ],
        tasks: 'compass reload'
      },
      reload: {
        files: [
          '<paths:app>/*.html',
          '<paths:app>/<paths:styles>/**/*.css',
          '<paths:app>/<paths:scripts>/**/*.js',
          '<paths:app>/<paths:images>/**/*'
        ],
        tasks: 'reload'
      }
    },

    // default lint configuration, change this to match your setup:
    // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md#lint-built-in-task
    lint: {
      files: [
        'Gruntfile.js',
        '<paths:app>/<paths:scripts>/**/*.js',
        '<paths:test>/**/*.js'
      ]
    },

    // specifying JSHint options and globals
    // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md#specifying-jshint-options-and-globals
    //
    // You may also choose to store them in a `.jshintrc` file next to this
    // gruntfile and change it to be:
    //
    //
    //    jshint: {
    //      options: '<json:.jshintrc>'
    //    }
    //
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        jQuery: true
      }
    },

    // Build configuration
    // -------------------

    // the staging directory used during the process
    staging: '<paths:staging>',
    // final build output
    output: '<paths:output>',

    mkdirs: {
      staging: '<paths:app>'
    },

    // Below, all paths are relative to the staging directory, which is a copy
    // of the app/ directory. Any .gitignore, .ignore and .buildignore file
    // that might appear in the app/ tree are used to ignore these values
    // during the copy process.

    // concat css/**/*.css files, inline @import, output a single minified css
    css: {
      main: {
        src: ['<paths:styles>/**/*.css'],
        dest: '<paths:styles>/main.css'
      }
    },

    // renames JS/CSS to prepend a hash of their contents for easier
    // versioning
    rev: {
      js: '<paths:scripts>/**/*.js',
      css: '<paths:styles>/**/*.css',
      img: '<paths:images>/**'
    },

    // usemin handler should point to the file containing
    // the usemin blocks to be parsed
    'usemin-handler': {
      html: 'index.html'
    },

    // update references in HTML/CSS to revved files
    usemin: {
      html: ['**/*.html'],
      css: ['**/*.css']
    },

    // HTML minification
    html: {
      files: ['**/*.html']
    },

    // Optimizes JPGs and PNGs (with jpegtran & optipng)
    img: {
      dist: '<config:rev.img>'
    },

    // rjs configuration. You don't necessarily need to specify the typical
    // `path` configuration, the rjs task will parse these values from your
    // main module, using http://requirejs.org/docs/optimization.html#mainConfigFile
    //
    // name / out / mainConfig file should be used. You can let it blank if
    // you're using usemin-handler to parse rjs config from markup (default
    // setup)
    rjs: {
      // no minification, is done by the min task
      optimize: 'none',
      baseUrl: './scripts',
      wrap: true
    }
  });

  // Alias the `test` task to run the `mocha` task instead
  grunt.registerTask('test', '<%= test_framework %>');


  // special paths resolving helper, should be put in another place once ok.

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
    // `scripts`, `styles` and `images` are resolved below the `app` value.
    return paths[value] || '';
  });

  var path = require('path');

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
      images: 'images'
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
  var config = grunt.config();
  var directiveRe = /<([^>]*)>/g;
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

  // make sure to re init (update) the config object of grunt (returns a
  // shallow clone of the actual config data)
  grunt.initConfig(config);

};
