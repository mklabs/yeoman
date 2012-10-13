
var fs     = require('fs');
var path   = require('path');
var yeoman = require('../..');
var grunt  = require('grunt');

// top level export
var template = module.exports;

// get back the resolved generator name to invoke
var name = yeoman.generators.name;

// and associated cli options (--help, --foo, ...)
var opts = yeoman.generators.options;

// strip back args from any `init:` prefix
grunt.cli.tasks = grunt.cli.tasks.map(function(arg) {
  return arg.replace(/^init:/, '');
});

if(!name && !opts.help) {
  yeoman.generators.name = 'app';
}

// Basic template description.
template.description = 'Init a new project or components';

// Template-specific notes to be displayed before question prompts.
template.notes = '\n'; //... More notes to come here ...'.yellow;

// The actual grunt init template. We need to support:
//
// yeoman init
// yeoman init backbone
// yeoman init backbone:model modelName
//
// Handles the specific case of default generator on `init` (without generator
// name).
template.template = function _template(grunt, init, cb) {
  // delegate the groundwork of scaffolding to the generator layer
  try {
    yeoman.generators.init(grunt, null, yeoman.config.snapshot);
  } catch(e) {
    grunt.fatal(e);
  }
};
