
module.exports = function(grunt) {
  // triggered on yeoman *
  grunt.registerHelper('yeoman:completion', function(env, cb) {
    var bowers = ['install', 'list', 'ls', 'uninstall', 'update', 'lookup', 'info', 'search'];
    var yeomans = ['init', 'build', 'server', 'test'];
    return cb(null, bowers.concat(yeomans));
  });
};
