
var path       = require('path');
var generators = require('yeoman-generators');

module.exports = function(grunt) {

  function grequire() {
    if(grequire.cache) {
      return grequire.cache;
    }
    var generators = require('yeoman-generators');
    generators.setup(grunt);
    return generators;
  }

  grunt.registerHelper('init:completion', function(env, cb) {
    var parts = env.last.split(':');
    env.prefix = parts.slice(0, -1).join(':');
    var basepath = path.join(__dirname, '../../node_modules/yeoman-generators');

    if(/^-/.test(env.last)) {
      return grunt.helper('init:options:completion', env, cb);
    }

    var internals = grunt.helper('init:completion:list', basepath, env);
    // grunt.helper('init:completion:list', internals, env);
    var locals = grunt.helper('init:completion:list', process.cwd(), env);

    var plugins = generators.plugins.map(function(pathname) {
      return grunt.helper('init:completion:list', path.resolve(pathname));
    }).reduce(function(a, b) {
      a = a.concat(b);
      return a;
    }, []);

    var results = internals.concat(locals).concat(plugins);
    // filter out the final results
    results = grunt.helper('init:completion:format', results, env);

    if(parts.length > 1) {
      env.prefix = env.prefix + ':';
    }

    return cb(null, results);
  });


  grunt.registerHelper('init:options:completion', function(env, cb) {
    // get rid of the first "init", determine namespace
    var namespace = env.words.slice(1)[0];
    // if there is a namespace
    if(/^-/.test(namespace)) {
      return cb(null, ['--help']);
    }

    // now that we have the namespace, create the generator, read its options
    var generator = grequire().create(namespace, [], grunt.cli.options, grunt.config());
    if(!generator) {
      return;
    }

    var opts = generator._options.map(function(o) {
      return '--' + o.name;
    });

    return cb(null, opts);
  });

  // not a completion helper, used to look for generators, based on the provided
  // `basedir`.
  grunt.registerHelper('init:completion:list', function(basedir) {
    return grequire().lookupHelp(basedir, [], {}, {}).map(function(gen) {
      return gen.namespace.replace(/^yeoman/, '');
    });
  });

  // not a completion helper, used to format and filter the results based on
  // the info in env. Returns a formatted the list as an array of completion
  // results. `prefix` is the base generator expanded (yeoman angular:* ->
  // angular, yeoman mocha:angular:mo* -> mocha:angular)
  grunt.registerHelper('init:completion:format', function(namespaces, env) {
    namespaces = namespaces.filter(function(ns) {
      return ns.indexOf(env.last) !== -1;
    }).map(function(ns) {
      return ns.replace(env.prefix, '').replace(/^:/, '');
    });

    return namespaces;
  });
};
