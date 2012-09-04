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
  // preven it walking to our Gruntfile.
  before(helpers.gruntfile({
    foo: {
      bar: '<config.baz>'
    }
  }));

  describe('When I run init app with default prompts', function() {

    before(function(done) {
      helpers.run('init --force', opts)
        .prompt(/would you like/i)
        .prompt(/Do you need to make any changes to the above before continuing?/)
        .end(done);
    });

    it('should generate a Gruntfile', function(done) {
      fs.stat('Gruntfile.js', done);
    });

    it('should match our expected values and <%= %> template markers directive should be properly expanded', function() {
      // Initialize task system so that grunt internally read / init the
      // config.
      grunt.task.init([]);

      // load our internal tasks, to specifically register helper we need to
      // trigger here
      grunt.task.loadTasks(path.join(__dirname, '../tasks'));

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
        'spec/**/*.js'
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
