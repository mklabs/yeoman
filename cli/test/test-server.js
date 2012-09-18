/*globals describe, it, before, after, beforeEach, afterEach */
var fs = require('fs'),
  path = require('path'),
  grunt = require('grunt'),
  assert = require('assert'),
  helpers = require('./helpers'),
  bower = require('bower').commands;

describe('Yeoman server', function() {

  before(helpers.before);

  before(helpers.gruntfile({
    // Coffee to JS compilation
    coffee: {
      dist: {
        src: 'app/scripts/**/*.coffee',
        dest: 'app/scripts'
      }
    },
    watch: {
      coffee: {
        files: '<config:coffee.dist.src>',
        tasks: 'coffee reload'
      },
      compass: {
        files: [
          'app/styles/**/*.{scss,sass}'
        ],
        tasks: 'compass reload'
      },
      reload: {
        files: [
          'app/*.html',
          'app/styles/**/*.css',
          'app/scripts/**/*.js',
          'app/images/**/*'
        ],
        tasks: 'reload'
      }
    }
  }));

  describe('yeoman server:test', function() {
    before(function(done) {
      this.server = helpers.run('server:test', { redirect: true });
      // this.server.on('started', done);
      // only go through next step when we detect waiting output
      // Callbacks won't fire since the underlying process doesn't exit
      this.server.on('started', function() {
        this.child.stdout.on('data', function(out) {
          if(out.indexOf('Running "watch" task') !== -1) {
            done();
          }
        });
      });

      // run and run
      this.server.end();
    });

    it('should be able to be killed', function(done) {
      this.server.on('exit', function(err, code) {
        // kills, trigger code 1, thuse getting error here. Ignoring.
        done();
      });
      this.server.child.kill();
    });
  });


});
