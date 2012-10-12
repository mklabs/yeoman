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

  // Create the initial gruntfile. This is the new look of yeoman Gruntfile(s),
  // will probably need to update each generator (that is actually generating a
  // Gruntfile, eg. most of them).
  before(helpers.gruntfile({

    // specify an alternate install location for Bower
    bower: {
      dir: '<%= yeoman.paths.app %>/<%= yeoman.paths.components %>'
    },

    // Coffee to JS compilation
    coffee: {
      compile: {
        files: {
          '<%= yeoman.paths.temp %>/<%= yeoman.paths.scripts %>/*.js': '<%= yeoman.paths.app %>/<%= yeoman.paths.scripts %>/**/*.coffee'
        },
        options: {
          basePath: '<%= yeoman.paths.app %>/<%= yeoman.paths.scripts %>'
        }
      },
    },

    compass: {
      dist: {
        options: {
          css_dir: '<%= yeoman.paths.temp %>/<%= yeoman.paths.styles %>',
          sass_dir: '<%= yeoman.paths.app %>/<%= yeoman.paths.styles %>',
          images_dir: '<%= yeoman.paths.app %>/<%= yeoman.paths.images %>',
          javascripts_dir: '<%= yeoman.paths.temp %>/<%= yeoman.paths.scripts %>',
          force: true
        }
      }
    },

    mocha: {
      all: ['<%= yeoman.paths.test %>/**/*.html']
    },

    watch: {
      coffee: {
        files: '<%= yeoman.paths.app %>/<%= yeoman.paths.scripts %>/**/*.coffee',
        tasks: 'coffee reload'
      },

      compass: {
        files: ['<%= yeoman.paths.app %>/<%= yeoman.paths.styles %>/**/*.{scss,sass}'],
        tasks: 'compass reload'
      },

      reload: {
        files: [
          '<%= yeoman.paths.app %>/*.html',
          '<%= yeoman.paths.app %>/<%= yeoman.paths.styles %>/**/*.css',
          '<%= yeoman.paths.app %>/<%= yeoman.paths.scripts %>/**/*.js',
          '<%= yeoman.paths.app %>/<%= yeoman.paths.images %>/**/*'
        ],
        tasks: 'reload'
      },

    },

    lint: {
      files: [
        'Gruntfile.js',
        '<%= yeoman.paths.app %>/<%= yeoman.paths.scripts %>/**/*.js',
        '<%= yeoman.paths.test %>/**/*.js'
      ]
    },

    staging: '<%= yeoman.paths.temp %>',
    output: '<%= yeoman.paths.dist %>',

    css: {
      '<%= yeoman.paths.styles %>/main.css': ['<%= yeoman.paths.styles %>/**/*.css']
    }

  }));

  describe('Grunt config should', function() {

    it('match our default values', function() {
      // Initialize task system so that grunt internally read / init the
      // config.
      grunt.task.init([]);

      // load our internal tasks, to specifically register helper we need to
      // trigger here
      grunt.task.loadTasks(path.join(__dirname, '../tasks'));

      assert.deepEqual(grunt.config('bower'), {
        dir: 'app/components'
      });

      assert.deepEqual(grunt.config('coffee.compile'), {
        files: {
          'temp/scripts/*.js': 'app/scripts/**/*.coffee'
        },
        options: {
          basePath: 'app/scripts'
        }
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

      assert.deepEqual(grunt.config('css'), {
        'styles/main.css': ['styles/**/*.css']
      });
      assert.deepEqual(grunt.config('mocha'), {
        all: ['test/**/*.html']
      });
    });

  });


});
