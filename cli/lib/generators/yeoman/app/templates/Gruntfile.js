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
      baseUrl: './<paths:scripts>',
      wrap: true
    }
  });

  // process the <paths:..> directives
  grunt.helper('paths:process');

  // Alias the `test` task to run the `mocha` task instead
  grunt.registerTask('test', '<%= test_framework %>');

};
