
var fs     = require('fs');
var path   = require('path');
var bower  = require('bower');

var source = require('bower/lib/core/source');


module.exports = function(grunt) {

  grunt.registerHelper('yeoman:completion', function(env, cb) {
    return cb(null, ['install', 'list', 'search', 'build', 'test', 'server']);
  });

  grunt.registerHelper('server:completion', function(env, cb) {
    return cb(null, ['test', 'dist', 'app', 'reload']);
  });

  // XXX caching strategy (unless internally handled by bower)
  grunt.registerHelper('install:completion', function(env, cb) {
    var name = env.last;
    var done = function done(err, results) {
      if(err) {
        return cb(err);
      }

      var names = results.map(function(pkg) {
        return pkg.name;
      });

      return cb(null, names);
    };

    // Can search with the name as argument with `source.search`, but we
    // want to cache the result internally (ttl to determine, bash
    // session? a day?), so we're doing the filtering on the whole list.
    var home = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME;
    var cache = path.join(home, '.yeoman/cache/components.json');
    fs.readFile(cache, 'utf8', function(err, body) {
      if(!err) {
        return done(null, JSON.parse(body));
      }

      // err, not cache yet. Do the request and cache the results
      source.all(function(err, results) {
        if(err) {
          return cb(err);
        }

        fs.writeFile(cache, JSON.stringify(results, null, 2), function(err) {
          if(err) {
            return cb(err);
          }

          done(null, results);
        });
      });
    });
  });

};
