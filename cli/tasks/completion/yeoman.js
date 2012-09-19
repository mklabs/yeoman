
module.exports = function(grunt) {
  // triggered on yeoman *
  grunt.registerHelper('yeoman:completion', function(env, cb) {
    // is it an option ?
    if(/^-/.test(env.last)) {
      return grunt.helper('yeoman:options:completion', env, cb);
    }

    var bowers = ['install', 'list', 'ls', 'uninstall', 'update', 'lookup', 'info', 'search'];
    var yeomans = ['init', 'build', 'server', 'test'];
    return cb(null, bowers.concat(yeomans));
  });

  grunt.registerHelper('yeoman:options:completion', function(env, cb) {
    var optlist = grunt.cli.optlist;

    // build up the completion results. Normal option prepended with double
    // `--`, alias prefixed with single `-`
    var known = [];
    Object.keys(optlist).forEach(function(option) {
      var alias = optlist[option].short;
      if(alias) {
        known.push('-' + alias);
      }

      known.push('--' + option);
    });

    return cb(null, known);
  });
};
