
var fs = require('fs'),
  join = require('path').join,
  util = require('util'),
  h5bp = require('../');

// ant build script has a nice notion of environment, this defaults to
// production. And we only support env=prod for now.
//
// not implemented tasks (add noop waithing for their impl): manifest

module.exports = function(grunt) {

  // External grunt plugin:
  //
  // - jasmine task: https://github.com/creynders/grunt-jasmine-task
  //
  // note: We need to use loadTasks instead of loadNpmTasks, otherwise will try
  // to load relative to gruntfile node_modules, this would require user to
  // install manually. So we load tasks specifically from our node_modules,
  // with abs path.
  //
  grunt.loadTasks(join(__dirname, '../node_modules/grunt-jasmine-task/tasks'));
  grunt.loadTasks(join(__dirname, '../node_modules/grunt-mocha/tasks'));

  // build targets: these are equivalent to grunt alias except that we defined
  // a single task and use arguments to trigger the appropriate target
  //
  // - build    - no html compression, no usemin-handler task
  // - usemin   - (default) same as build but parsing config from markup
  // - text     - same as usemin but without image (png/jpg) optimizing
  // - buildkit - minor html optimizations, all html whitespace/comments
  //              maintained (todo: inline script/style minified)
  // - basics   - same as buildkit plus minor html optimizations
  // - minify   - same as build plus full html minification
  var targets = {
    "default" : '                rjs concat css min img rev usemin manifest',
    usemin    : 'usemin-handler rjs concat css img rev usemin manifest',
    text      : 'usemin-handler rjs concat css min     rev usemin manifest',
    buildkit  : 'usemin-handler rjs concat css min img rev usemin manifest html:buildkit',
    basics    : 'usemin-handler rjs concat css min img rev usemin manifest html:basics',
    minify    : 'usemin-handler rjs concat css min img rev usemin manifest html:compress'
  };

  var targetList = grunt.log.wordlist(Object.keys(targets));
  grunt.registerTask('build', 'Run a predefined target - build:<target> \n' + targetList, function(target) {
    var valid = Object.keys(targets);
    target = target || 'usemin';

    if ( valid.indexOf( target ) === -1 ) {
      grunt.log
        .error('Not a valid target')
        .error(grunt.helper('invalid targets', targets));
      return false;
    }

    var tasks = ['intro', 'clean coffee compass mkdirs', targets[target], 'copy time'].join(' ');
    grunt.log.subhead('Running ' + target + ' target')
      .writeln('  - ' + grunt.log.wordlist(tasks.split(' '), { separator: ' ' }));

    // make sure to update the configuration and process any kind of <%= %> base
    // value. Grunt will handle that for us with grunt.config.get()
    grunt.helper('config:process');

    grunt.task.run(tasks);
  });

  grunt.registerHelper('invalid targets', function(valid, code) {
    var msg = Object.keys(valid).map(function(key) {
      if ( /pre|post/.test( key ) ) {
        return '';
      }
      return grunt.helper('pad', key, 10) + '# '+ valid[key];
    }).join(grunt.util.linefeed);

    var err = new Error(grunt.util.linefeed + msg);
    err.code = code || 3;
    return err;
  });

  grunt.registerHelper('pad', function pad(str, max) {
    return str.length > max ? str :
        str + new Array(max - str.length + 1).join(' ');
  });

  var now = +new Date();
  grunt.registerTask('time', 'Print sucess status with elapsed time', function() {
    grunt.log.ok('Build sucess. Done in ' + ((+new Date() - now) / 1000) + 's');
  });

  // Output some size info about a file, from a stat object.
  grunt.registerHelper('min_max_stat', function(min, max) {
    min = typeof min === 'string' ? fs.statSync(min) : min;
    max = typeof max === 'string' ? fs.statSync(max) : max;
    grunt.log.writeln('Uncompressed size: ' + String(max.size).green + ' bytes.');
    grunt.log.writeln('Compressed size: ' + String(min.size).green + ' bytes minified.');
  });

  // Output some info on given object, using util.inspect, using colorized output.
  grunt.registerHelper('inspect', function(o) {
    return util.inspect(o, false, 4, true);
  });


  // config:process helper is a special helper to recursively process any
  // config value <%= stuff %> with the actual grunt config.  trigger our
  // specific config:process helper.
  //
  // will somewhat be replaced by the new config API that is coming with grunt
  // 0.4.x (https://github.com/cowboy/grunt/issues/396)
  grunt.registerHelper( 'config:process', function() {
    var config = grunt.config();
    config = grunt.util.recurse( config, function(value) {
      // grunt will do this much better, right now we just ignore any non
      // string stuff
      if (typeof value !== 'string') { return value; }
      return grunt.template.process( value, config );
    });

    // not that great.. Specific stuff about css config. grunt.util.recurse
    // only allows us to process values, not keys. And the CSS config relies on
    // the subtarget task name to guess the output, should be refactored to use
    // src / dest config like coffee does.
    //
    // go through css subtargets, process the key and update the config.
    Object.keys( config.css ).forEach(function(key) {
      // process the value
      var result = grunt.template.process( key );
      // update the config with the new key (may be the same)
      config.css[result] = config.css[key];
      // delete the old one
      if(result !== key) {
        delete config.css[key];
      }
    });

    // set it back in config
    grunt.initConfig( config );
  });

};
