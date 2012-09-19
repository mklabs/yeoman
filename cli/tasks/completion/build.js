
module.exports = function(grunt) {
  // triggered on yeoman *
  grunt.registerHelper('build:completion', function(env, cb) {
    var targets = ['default', 'usemin', 'text', 'buildkit', 'basics', 'minify', 'test'];
    return cb(null, targets);
  });
};
