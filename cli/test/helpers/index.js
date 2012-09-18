
var fs        = require('fs');
var path      = require('path');
var spawn     = require('child_process').spawn;
var rimraf    = require('rimraf');
var mkdirp    = require('mkdirp');
var which     = require('which');
var grunt     = require('grunt');
var async     = grunt.util.async;
var Runnable  = require('./runnable');
var SuperTest = require('supertest/lib/test');

// top level exports
var helpers = module.exports;

// path to the yeoman bin entry point
var yeomanpath = path.join(__dirname, '../../bin/yeoman');

// specific flag to ensure we bypass insight prompt, even when these
// tests are not run within an npm scripts (eg direct use of mocha)
var env = process.env;
env.yeoman_test = true;

// Top level helper for running specific command on the yeoman cli. Returns a
// Runnable object with API for asserting stdout output, entering prompts and
// so on.
//
// - cmds     - A String specifying the list of command to run
//
// Example:
//
//    var yeoman = helpers.run('init --force');
//    yeoman.prompt(/Woud you like/, 'Y');
//    yeoman.end(done);
//
// Returns a new Runnable object.
helpers.run = function run(cmds, opts) {
  return new Runnable([process.execPath, yeomanpath, cmds].join(' '), opts);
};

// Facade to supertest Test object. Tweaked here to be able to assert against
// yeoman spawned server. Might opt to just use grunt helper, and get back the
// connect HTTP server, but we'll want to test server:* tasks behavior.
helpers.request = function request(opts) {
  opts = opts || {};

  var applike = {};
  applike.address = function() {
    return { port: opts.port || 3501 };
  };

  // supertest uses "methods" module, but the few methods below are enough for
  // our needs.
  var obj = {};
  ['get', 'post', 'put', 'head', 'delete'].forEach(function(method) {
    var name = method === 'delete' ? 'del' : method;
    obj[name] = function(path) {
      return new SuperTest(applike, method, path);
    };
  });
  return obj;
};


// Mocha before step to call out on every test suite, each every new test file.
//
// Will trigger the .directory(), .gruntfile(), and .run() with `yeoman init
// --force` command. In addition, it also trigger the .installed() helper on
// both phantomjs and compass executable, to set whether or not they are
// available on the current system (and set their appropriate flag in mocha
// context)
//
// Example:
//
//    before(helpers.before);
helpers.before = function before(done) {
  var directory = helpers.directory('.test');
  var gruntfile = helpers.gruntfile({ test: true });
  var compass = helpers.installed('compass').bind(this);
  var phantom = helpers.installed('phantomjs').bind(this);
  var init = helpers.init();
  async.series([directory, gruntfile, compass, phantom, init], done);
};

// Basic helper for the default setup of running yeoman with the command `init
// --force`, and dealing with the various prompt happening within the app
// generator, asserts 0 exit code and and trigger the command. `done` is called
// when the underlying process is exiting.
//
// It also setup `this.yeoman` runnable instance in the Mocha context, for
// usage if needed within the test cases.
//
// - redirect   - Boolean flag that when set to true will redirect the output
//                to the parent process. Set this to true if you want to see
//                the yeoman executable output.
// Example:
//
//     before(helpers.init());
//
// Returns a function suitable to use with mocha's before/after hooks.
helpers.init = function init(redirect) {
  return function(done) {
    var yeoman = helpers.run('init --force', { redirect : redirect });
    yeoman
      // enter '\n' for both prompts, and grunt confirm
      .prompt(/would you like/i)
      .prompt(/Do you need to make any changes to the above before continuing?/)
      // handle Overwrite ? prompt
      .prompt(/Overwrite \?/, 'a')
      // check exit code
      .expect(0)
      // run and done
      .end(done);
  };
};


// Removes, creates and cd into the specified directory. If the current working
// directory is the same as the specified one, then acts as a noop. Meant to be
// used once per mocha suite.
//
// - dir   - the directory path to create
//
// Example:
//
//     before(helpers.directory('.test'));
//
// Returns a function suitable to use with mocha's before/after hooks.
helpers.directory = function directory(dir) {
  return function(done) {
    process.chdir(path.join(__dirname, '../..'));
    rimraf(dir, function(err) {
      if(err) {
        return done(err);
      }
      mkdirp(dir, function(err) {
        if(err) {
          return done(err);
        }
        process.chdir(dir);
        done();
      });
    });
  };
};


// Meant to be used with mocha handlers like before / beforeEach, etc. Creates
// and manage a yeoman child process, providing the child instance in the mocha
// context as `self.child`, collecting output for both stdout / stderr as
// `self.stdout` and `self.stderr`
//
// - cmds     - A String specifying the list of command to run
// - takeOver - (Optional) A Boolean that when set to true will create the
//              child and forget, allowing user to interract with the child
//              instance (collecting output, writing to stding, listening to
//              exit)
//
// Example:
//
//      before(helpers.yeoman('foo'));
//
//      describe('when I run foo', function() {
//        it('should run foo and expose child process and stdout / stderr output', function() {
//          console.log(this.stdout);
//          console.log(this.stderr);
//
//        });
//      });
//
//
// Returns a function suitable to use with mocha hooks.
helpers.yeoman = function yeoman(cmds, takeOver) {
  var args = [yeomanpath].concat(cmds.split(' ')),
    options = { env: env };

  if(takeOver) {
    return spawn(process.execPath, args, options);
  }

  return function(done) {
    var child = this.child = spawn(process.execPath, args, options);
    var out = this.stdout = '';
    var err = this.stderr = '';
    child.stdout.on('data', function(chunk) {
      out += chunk;
    });
    child.stderr.on('data', function(chunk) {
      err += chunk;
    });
    child.on('end', done);
  };
};

// Generates a new Gruntfile.js in the current working directory based on
// `options` hash passed in. Same as other helpers, meant to be use as a mocha handler.
//
// - options  - Grunt configuration
//
// Example
//
//    before(helpers.gruntfile({
//      foo: {
//        bar: '<config.baz>'
//      }
//    }));
//
// Returns a function suitable to use with mocha hooks.
helpers.gruntfile = function gruntfile(options) {
  options = options || {};
  return function(done) {
    var config = 'grunt.initConfig(' + JSON.stringify(options, null, 2) + ');';
    config = config.split('\n').map(function(line) {
      return '  ' + line;
    }).join('\n');

    var out = [
      'module.exports = function(grunt) {',
      config,
      '};'
    ];

    fs.writeFile('Gruntfile.js', out.join('\n'), done);
  };
};


// Mocha before helper. Takes a command String to be checked against `which`
// package, and a callback to call on completion, most likely the mocha async
// `done` callback.
//
// Setups the relevant Boolean flag on the test context.
//
helpers.installed = function installed(command) {
  return function(done) {
    var ctx = this;
    which(command, function(err) {
      ctx[command] = !err;
      done();
    });
  };
};
