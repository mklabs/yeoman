var fs     = require('fs');
var path   = require('path');
var bower  = require('bower');

var source = require('bower/lib/core/source');

module.exports = function(grunt) {

  // Caching strategy:
  //
  // - Local cache is located at $HOME/.yeoman/cache/components
  // - fs.readFile on the cached file
  // - on error, we trigger the request to bower's registry to get the full
  //   dictionary, and write the results (json)to the cache file.
  // - cached file used afterwards, to prevent the bower registry request on
  //   each completion.
  //
  // TTL still to determine, probably an hour.
  //
  // Bower also allow the installation of local components (expand to the
  // filesystem on ./, or find the options for each system to fallback on
  // defaults behavior when no completion results)
  //
  //
  // Possible improvment: expand after pkg#, trigger a call to bower.info(),
  // cache the results and expand to the list of available version.
  grunt.registerHelper('install:completion', function(env, cb) {
    var done = function done(err, results) {
      if(err) {
        return cb(err);
      }

      var names = results.map(function(pkg) {
        return pkg.name;
      });

      return cb(null, names);
    };

    // Can search with the name as argument with `source.search`, but we want
    // to cache the result internally (ttl to determine, bash session? a day?),
    // so we're doing the filtering on the whole list.
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


  // Info command completion is the same as install.
  grunt.registerHelper('info:completion', function(env, cb) {
    grunt.helper('install:completion', env, cb);
  });

};
