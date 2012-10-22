// Configuration module
// --------------------
//
// Responsible of setting up the yeoman configuration system, working
// closely with Grunt's internal config.
//
// This is the main abstraction on top of config-chain, kinda like our
// orw rc module.

var grunt   = require('grunt');
var cc      = require('config-chain');
var path    = require('path');
var join    = path.join;
var resolve = path.resolve;
var merge   = require('./utils/lodash').merge;
var parse   = require('./utils/parse');

// home dir, windows is the exception to deal with.
var home = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];

// Note:
//
// - we might opt to not rely on grunt to read cli options, but use
// directly `nopt` for that. Internally, grunt uses nopt anyway these
// same options from the command line.

// shallow clone of grunt option's. You don't want to mess around
// options references.
var opts = {};
Object.keys(grunt.cli.options).forEach(function(key) {
  opts[key] = grunt.cli.options[key];
});

// how do we handle defaults?
var defaults = {
  app        : 'app',
  temp       : 'temp',
  dist       : 'dist',
  test       : 'test',
  components : 'components',

  // below paths are used relative to `app`
  scripts    : 'scripts',
  styles     : 'styles',
  images     : 'images',
  vendor     : 'scripts/vendor'
};

// build and expose the chain, access `.snapshot` to get back the result of the
// configuration chain.
var config = module.exports = cc(
  opts,
  cc.env('YEOMAN_'),
  opts.config,
  parse(resolve('.yeomanrc')),
  parse(resolve('config/yeoman')),
  parse(resolve('project.json')),
  parse(join(home, '.yeomanrc')),
  parse(join(home, '.yeoman/config')),
  parse(join(home, '.config/yeoman')),
  parse(join(home, '.config/yeoman/config')),
  // how to handle defaults?
  defaults
);

// Redefine the "snapshot" property to do a deep extend / merge (using lodash
// merge method) of the configuration chain. We loose the chain based on
// prototype though.
Object.defineProperty(config, 'snapshot', {
    get: function() {
      console.log('snap', this.list);
      var chain = [{}].concat(this.list.reverse());
      return merge.apply(null, chain);
    }
});
