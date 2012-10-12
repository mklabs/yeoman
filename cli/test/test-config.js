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

  // create a dummy gruntfile in .test, before the app generator, to
  // prevent it walking to our Gruntfile.
  before(helpers.gruntfile({

    stuff: 'yay',

    // specify an alternate install location for Bower
    bower: {
      dir: '<%= yeoman.paths.app %>/<%= yeoman.paths.components %>'
    },

    // Coffee to JS compilation
    coffee: {
      compile: {
        files: {
          'temp/scripts/*.js': 'app/scripts/**/*.coffee'
        },
        options: {
          basePath: 'app/scripts'
        }
      }
    }

    // etc. etc. todo
  }));

  describe('Grunt config should', function() {

    it('match our default values', function() {
      // Initialize task system so that grunt internally read / init the
      // config.
      grunt.task.init([]);

      // load our internal tasks, to specifically register helper we need to
      // trigger here
      grunt.task.loadTasks(path.join(__dirname, '../tasks'));

      // debug... to be removed
      console.log('The whole grunt config looks like this', grunt.config());

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
        'spec/**/*.js'
      ]);

      assert.equal(grunt.config('staging'), 'temp');

      assert.equal(grunt.config('output'), 'dist');

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
