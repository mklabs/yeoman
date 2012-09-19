


module.exports = function(grunt) {

  grunt.registerHelper('yeoman:completion', function(env, cb) {
    return cb(null, ['install', 'list', 'search', 'build', 'test', 'server']);
  });


  grunt.registerHelper('server:completion', function(env, cb) {
    // this === env
    return cb(null, ['server:test', 'server:dist', 'server:app', 'server:reload']);
  });
};
