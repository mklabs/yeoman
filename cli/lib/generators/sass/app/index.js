/*jshint latedef: false */

var util   = require('util');
var path   = require('path');
var yeoman = require('../../../../');

// sass:app generator

module.exports = Generator;

function Generator() {
  yeoman.generators.Base.apply(this, arguments);

  this.styledir = path.join(this.config.paths.app, this.config.paths.styles);
}

util.inherits(Generator, yeoman.generators.Base);

Generator.prototype.main = function main() {
  this.write(path.join(this.styledir, 'main.css'), "/* Will be compiled down to a single stylesheet with your sass files */");
  this.write(path.join(this.styledir, 'main.scss'), '@import "compass_twitter_bootstrap";');
};

Generator.prototype.compassBootstrap = function compassBootstrap() {
  this.directory('compass_twitter_bootstrap', this.styledir);
};
