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

// Add our own API to ConfigChain (mainly we miss the ability to return
// a single object with all resolved configuration properties)
cc.ConfigChain.prototype.all = function() {
  console.log('wait what', this);
};


// how do we handle defaults?
var defaults = {};

// build and expose the chain
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
).snapshot;

