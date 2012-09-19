module.exports = function(grunt) {
  // trigger on yeoman server:*
  grunt.registerHelper('server:completion', function(env, cb) {
    return cb(null, ['test', 'dist', 'app', 'reload']);
  });
};
