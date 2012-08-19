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

    it('should match our expected values and <paths:...> directive should be properly expanded', function() {
      // Initialize task system so that grunt internally read / init the config.
      grunt.task.loadTasks(path.join(__dirname, '../tasks'));
      grunt.task.init([]);

      assert.deepEqual(grunt.config('bower'), {
        dir: 'app/scripts/vendor'
      });

      assert.deepEqual(grunt.config('coffee.dist'), {
        src: 'app/scripts/**/*.coffee',
        dest: 'app/scripts'
      });

      assert.deepEqual(grunt.config('compass.dist.options'), {
        css_dir: 'styles',
        sass_dir: 'styles',
        images_dir: 'images',
        javascripts_dir: 'scripts',
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

      assert.deepEqual(grunt.config('mkdirs'), {
        staging: 'app'
      });

      assert.deepEqual(grunt.config('mocha'), {
        all: ['test/**/*.html']
      });
      assert.deepEqual(grunt.config('css'), {
        main: {
          src: ['styles/**/*.css'],
          dest: 'styles/main.css'
        }
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
