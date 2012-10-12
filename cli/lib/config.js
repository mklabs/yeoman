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
  resolve('.yeomanrc'),
  resolve('config/yeoman'),
  resolve('project.json'),
  join(home, '.yeomanrc'),
  join(home, '.yeoman/config'),
  join(home, '.config/yeoman'),
  join(home, '.config/yeoman/config'),
  // how to handle defaults?
  defaults
);

// Get config data, recurse through objects processing keys as a template if
// necessary.
//
// Some tasks (like coffee & css) relies on `key:value` configuration to map
// `destination:sources` values.
config.processKeys = function processKeys(value, data) {
  if(Array.isArray(value)) { return value; }
  if(typeof value !== 'object') { return value; }

  // when data is not provided, we use the given value as template data (which
  // is the first object provided on first run)
  data = data || value;
  Object.keys(value || {}).forEach(function(k) {
    var val = value[k];
    var processed = grunt.template.process(k, data);
    if(k !== processed) {
      value[processed] = val;
      delete value[k];
    }

    // recurse, while carrying on the data object.
    processKeys(val, data);
  });

  return value;
};

// shallow clone helper
config.clone = function clone(o) {
  var cloned = {};
  Object.keys(o).forEach(function(k) {
    cloned[k] = o[k];
  });
  return cloned;
};

