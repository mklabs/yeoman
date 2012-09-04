/*global describe:true, before:true, it: true */
var fs      = require('fs');
var path    = require('path');
var grunt   = require('grunt');
var helpers = require('./helpers');
var assert  = require('assert');

var opts = grunt.cli.options;
opts.redirect = !opts.silent;

describe('yeoman config', function() {

  before(helpers.directory('.test'));

  // create a specific gruntfile with all relevant config of a yeoman app, with
  // paths config and <%= %> markers using these values. Basically, the
  // generated gruntfile with just the values with paths in them.
  before(helpers.gruntfile({
    paths: {
      app: 'app',

      // below js / css folders are usually within the app value
      js: 'scripts',
      css: 'styles',
      img: 'images',

      // vendor is specifically used within <%= paths.app %>/<%= paths.scripts %>
      vendor: 'vendor',

      test: 'test',

      temp: 'temp',
      dist: 'dist'
    },

    bower: {
      dir: '<%= paths.app %>/<%= paths.js %>/<%= paths.vendor %>'
    },

    coffee: {
      dist: {
        src: '<%= paths.app %>/<%= paths.js %>/**/*.coffee',
        dest: '<%= paths.app %>/<%= paths.js %>'
      }
    },

    compass: {
      dist: {
        options: {
          css_dir: '<%= paths.temp %>/<%= paths.css %>',
          sass_dir: '<%= paths.app %>/<%= paths.css %>',
          images_dir: '<%= paths.app %>/<%= paths.img %>',
          javascripts_dir: '<%= paths.temp %>/<%= paths.js %>',
          force: true
        }
      }
    },

    mocha: {
      all: ['<%= paths.test %>/**/*.html']
    },

    // default watch configuration
    watch: {
      coffee: {
        files: '<config:coffee.dist.src>',
        tasks: 'coffee reload'
      },
      compass: {
        files: [
          '<%= paths.app %>/<%= paths.css %>/**/*.{scss,sass}'
        ],
        tasks: 'compass reload'
      },
      reload: {
        files: [
          '<%= paths.app %>/*.html',
          '<%= paths.app %>/<%= paths.css %>/**/*.css',
          '<%= paths.app %>/<%= paths.js %>/**/*.js',
          '<%= paths.app %>/<%= paths.img %>/**/*'
        ],
        tasks: 'reload'
      }
    },

    lint: {
      files: [
        'Gruntfile.js',
        '<%= paths.app %>/<%= paths.js %>/**/*.js',
        '<%= paths.test %>/**/*.js'
      ]
    },

    // Build configuration
    // -------------------
    staging: '<%= paths.temp %>',
    // final build output
    output: '<%= paths.dist %>',

    mkdirs: {
      staging: '<%= paths.app %>'
    },

    css: {
      '<%= paths.css %>/main.css': ['<%= paths.css %>/**/*.css']
    },

    rev: {
      js: '<%= paths.js %>/**/*.js',
      css: '<%= paths.css %>/**/*.css',
      img: '<%= paths.img %>/**'
    },

    'usemin-handler': {
      html: 'index.html'
    },

    usemin: {
      html: ['**/*.html'],
      css: ['**/*.css']
    },

    html: {
      files: ['**/*.html']
    },

    img: {
      dist: '<config:rev.img>'
    },

    rjs: {
      optimize: 'none',
      baseUrl: './<% paths.js %>',
      wrap: true,
      name: 'main'
    }
  }));

  describe('When I work on a Gruntfile, using <%= paths.kind %> of template delimiters', function() {

    it('should match our expected values and <%= %> template markers directive should be properly expanded', function() {
      // Initialize task system so that grunt internally read / init the
      // config.
      grunt.task.init([]);

      // load our internal tasks, to specifically register helper we need to
      // trigger here
      grunt.task.loadTasks(path.join(__dirname, '../tasks'));

      // trigger our specific config:process helper, will somewhat be replaced
      // by the new config API that is coming with grunt 0.4.x
      // (https://github.com/cowboy/grunt/issues/396)
      grunt.helper('config:process');

      assert.deepEqual(grunt.config('bower'), {
        dir: 'app/scripts/vendor'
      });

      assert.deepEqual(grunt.config('coffee.dist'), {
        src: 'app/scripts/**/*.coffee',
        dest: 'app/scripts'
      });

      assert.deepEqual(grunt.config('compass.dist.options'), {
        css_dir: 'temp/styles',
        sass_dir: 'app/styles',
        images_dir: 'app/images',
        javascripts_dir: 'temp/scripts',
        force: true
      });

      assert.deepEqual(grunt.config('mocha'), {
        all: ['test/**/*.html']
      });

      assert.deepEqual(grunt.config('watch.coffee'), {
        files: 'app/scripts/**/*.coffee',
        tasks: 'coffee reload'
      });

      assert.deepEqual(grunt.config('watch.compass'), {
        files: ['app/styles/**/*.{scss,sass}'],
        tasks: 'compass reload'
      });

      assert.deepEqual(grunt.config('watch.reload'), {
        files: [
          'app/*.html',
          'app/styles/**/*.css',
          'app/scripts/**/*.js',
          'app/images/**/*'
        ],
        tasks: 'reload'
      });

      assert.deepEqual(grunt.config('lint.files'), [
        'Gruntfile.js',
        'app/scripts/**/*.js',
        'test/**/*.js'
      ]);

      assert.equal(grunt.config('staging'), 'temp');

      assert.equal(grunt.config('output'), 'dist');

      // assert.deepEqual(grunt.config('mkdirs'), {
      //   staging: 'app'
      // });

      assert.deepEqual(grunt.config('mocha'), {
        all: ['test/**/*.html']
      });
      assert.deepEqual(grunt.config('css'), {
        'styles/main.css': ['styles/**/*.css']
      });
      assert.deepEqual(grunt.config('mocha'), {
        all: ['test/**/*.html']
      });
      assert.deepEqual(grunt.config('mocha'), {
        all: ['test/**/*.html']
      });
    });
  });


});
