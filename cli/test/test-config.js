/*global describe:true, before:true, it: true */
var fs      = require('fs');
var path    = require('path');
var grunt   = require('grunt');
var helpers = require('./helpers');
var assert  = require('assert');
var yeoman  = require('..');

var opts = grunt.cli.options;
opts.redirect = !opts.silent;

var cc = yeoman.config.snapshot;

function assertConfig(config, value) {
  value = grunt.util.recurse(value, function(val) {
    if(typeof val !== 'string') {
      return val;
    }

    return val
      .replace('app', cc.app)
      .replace('temp', cc.temp)
      .replace('dist', cc.dist)
      .replace('test', cc.test)
      .replace('components', cc.components)
      .replace('scripts', cc.scripts)
      .replace('styles', cc.styles)
      .replace('images', cc.images)
      .replace('vendor', cc.vendor);
  });

  assert.deepEqual(config, value);
}

describe('yeoman config', function() {

  before(helpers.directory('.test'));

  // Create the initial gruntfile. This is the new look of yeoman Gruntfile(s),
  // will probably need to update each generator (that is actually generating a
  // Gruntfile, eg. most of them).
  before(helpers.gruntfile({

    // specify an alternate install location for Bower
    bower: {
      dir: '<%= yeoman.app %>/<%= yeoman.components %>'
    },

    // Coffee to JS compilation
    coffee: {
      compile: {
        files: {
          '<%= yeoman.temp %>/<%= yeoman.scripts %>/*.js': '<%= yeoman.app %>/<%= yeoman.scripts %>/**/*.coffee'
        },
        options: {
          basePath: '<%= yeoman.app %>/<%= yeoman.scripts %>'
        }
      },
    },

    compass: {
      dist: {
        options: {
          css_dir: '<%= yeoman.temp %>/<%= yeoman.styles %>',
          sass_dir: '<%= yeoman.app %>/<%= yeoman.styles %>',
          images_dir: '<%= yeoman.app %>/<%= yeoman.images %>',
          javascripts_dir: '<%= yeoman.temp %>/<%= yeoman.scripts %>',
          force: true
        }
      }
    },

    mocha: {
      all: ['<%= yeoman.test %>/**/*.html']
    },

    watch: {
      coffee: {
        files: '<%= yeoman.app %>/<%= yeoman.scripts %>/**/*.coffee',
        tasks: 'coffee reload'
      },

      compass: {
        files: ['<%= yeoman.app %>/<%= yeoman.styles %>/**/*.{scss,sass}'],
        tasks: 'compass reload'
      },

      reload: {
        files: [
          '<%= yeoman.app %>/*.html',
          '<%= yeoman.app %>/<%= yeoman.styles %>/**/*.css',
          '<%= yeoman.app %>/<%= yeoman.scripts %>/**/*.js',
          '<%= yeoman.app %>/<%= yeoman.images %>/**/*'
        ],
        tasks: 'reload'
      },

    },

    lint: {
      files: [
        'Gruntfile.js',
        '<%= yeoman.app %>/<%= yeoman.scripts %>/**/*.js',
        '<%= yeoman.test %>/**/*.js'
      ]
    },

    staging: '<%= yeoman.temp %>',
    output: '<%= yeoman.dist %>',

    css: {
      '<%= yeoman.styles %>/main.css': ['<%= yeoman.styles %>/**/*.css']
    }

  }));

  describe('Grunt config should', function() {

    before(function(done) {
      grunt.task.init([]);
      grunt.task.loadTasks(path.join(__dirname, '../tasks'));
      grunt.tasks(['config:paths'], {}, done);
    });

    it('match our default values', function() {

      assertConfig(grunt.config('bower'), {
        dir: 'app/components'
      });

      var coffee = { files: {} };
      coffee.options = {
        basePath: 'app/scripts'
      };

      coffee.files[path.join(cc.temp, cc.scripts, '*.js')] = 'app/scripts/**/*.coffee';

      assertConfig(grunt.config('coffee.compile'), coffee);

      assertConfig(grunt.config('compass.dist.options'), {
        css_dir: 'temp/styles',
        sass_dir: 'app/styles',
        images_dir: 'app/images',
        javascripts_dir: 'temp/scripts',
        force: true
      });

      assertConfig(grunt.config('mocha'), {
        all: ['test/**/*.html']
      });

      assertConfig(grunt.config('watch.coffee'), {
        files: 'app/scripts/**/*.coffee',
        tasks: 'coffee reload'
      });

      assertConfig(grunt.config('watch.compass'), {
        files: ['app/styles/**/*.{scss,sass}'],
        tasks: 'compass reload'
      });

      assertConfig(grunt.config('watch.reload'), {
        files: [
          'app/*.html',
          'app/styles/**/*.css',
          'app/scripts/**/*.js',
          'app/images/**/*'
        ],
        tasks: 'reload'
      });

      assertConfig(grunt.config('lint.files'), [
        'Gruntfile.js',
        'app/scripts/**/*.js',
        'test/**/*.js'
      ]);

      assertConfig(grunt.config('staging'), 'temp');

      assertConfig(grunt.config('output'), 'dist');

      assertConfig(grunt.config('mocha'), {
        all: ['test/**/*.html']
      });

      var css = {};
      css[path.join(cc.styles, 'main.css')] = ['styles/**/*.css'];
      assertConfig(grunt.config('css'), css);

    });

  });


});
