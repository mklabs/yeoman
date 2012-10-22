
var fs = require('fs');
var cc = require('config-chain');

// TODO: express dependency to js-yaml, which will become unneeded with
// upcomming grunt.file.readYAML API.
var yaml = require('js-yaml');

// Our own version of configuration file parse, mainly to add yaml parsing
// ability for our chain. Instead of passing String to ConfigChain (which
// internall handle the parsing for us), we handle the parsing directly and
// pass raw object instead (which will prevent ConfigChain from parsing
// attempt)
module.exports = function parse(filename) {
  if(typeof filename !== 'string') {
    return filename;
  }

  var content = '';
  try {
    content = fs.readFileSync(filename,'utf8');
  } catch(err) {
    return;
  }

  var config = {};
  // try yaml and fall back to cc.parse (which tries json and then fall back to
  // ini)
  try {
    // issue with " being ". global replace by '.
    config = yaml.load(content.replace(/"/g, "'"));
  } catch(e) {
    config = cc.parse(content, filename);
  }

  return config;
};
