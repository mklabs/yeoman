/*globals describe, it, before, after, beforeEach, afterEach */

var path    = require('path');
var assert  = require('assert');
var helpers = require('./helpers');
var request = require('supertest');

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
      // coffee: {
      //   files: '<config:coffee.dist.src>',
      //   tasks: 'coffee reload'
      // },
      compass: {
        files: [
          // 'app/styles/**/*.{scss,sass}'
        ],
        tasks: 'compass reload'
      },
      reload: {
        files: [
          // 'app/*.html',
          // 'app/styles/**/*.css',
          // 'app/scripts/**/*.js',
          // 'app/images/**/*'
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

    after(function(done) {
      this.server.on('exit', function(err, code) {
        // kills, trigger code 1, thuse getting error here. Ignoring.
        done();
      });
      this.server.child.kill();
    });

    it('should serve "/"', function(done) {
      helpers.request()
        .get('/')
        .expect('Content-Type', 'text/html')
        .expect(200)
        .expect(/<title>Mocha Spec Runner<\/title>/)
        .end(done);
    });

    it('should serve "/livereload.js"', function(done) {
      helpers.request()
        .get('/livereload.js')
        .expect('Content-Type', 'application/javascript')
        .expect(200)
        .end(done);
    });

    it('should serve "lib/chai.js"', function(done) {
      helpers.request()
        .get('/lib/chai.js')
        .expect('Content-Type', 'application/javascript')
        .expect(200)
        .end(done);
    });

    it('should serve "lib/expect.js"', function(done) {
      helpers.request()
        .get('/lib/expect.js')
        .expect('Content-Type', 'application/javascript')
        .expect(200)
        .end(done);
    });

    it('should serve "lib/mocha/mocha.js"', function(done) {
      helpers.request()
        .get('/lib/mocha/mocha.js')
        .expect('Content-Type', 'application/javascript')
        .expect(200)
        .end(done);
    });

    it('should serve "lib/mocha/mocha.css"', function(done) {
      helpers.request()
        .get('/lib/mocha/mocha.css')
        .expect('Content-Type', /text\/css/)
        .expect(200)
        .end(done);
    });

    // Will be fixed with PR #451
    describe('serving app/ directory', function() {
      it('should serve "scripts/main.js', function(done) {
        helpers.request()
          .get('/scripts/main.js')
          .expect('Content-Type', 'application/javascript')
          .expect(200)
          .end(done);
      });
    });
  });


});
