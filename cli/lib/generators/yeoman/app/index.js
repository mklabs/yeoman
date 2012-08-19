/*jshint latedef:false*/

var fs      = require('fs');
var util    = require('util');
var path    = require('path');
var cheerio = require('cheerio');
var yeoman  = require('../../../../');

module.exports = AppGenerator;

// This generator is the main generator triggered on `yeoman init`.
//
// It delegates the sass and test directories creation through hooks to
// according generators:
//
// - sass:app (hook: stylesheet-engine)
// - mocha:app (hook: test-framework)
//
// Those hooks can be changed using cli flags when `yeoman init` is ran:
//
//      yeoman init --test-framework jasmine --stylesheet-engine less
//
// Provided that a less:app generator is available in one of the generator load
// path, it allows you to specifically change the sass part of the generator to
// instead generates you a less setup. Jasmine generator is provided by default
// with yeoman (even if not used with the default setup)

function AppGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  // setup the test-framework property, Gruntfile template will need this
  this.test_framework = options['test-framework'] || 'mocha';

  // cleanup the name property from trailing /, typical usage of directories.
  // update the args object, it's used to initialize js-framework hooks
  if(this.name) {
    this.args[0] = this.args[0].replace(/\/$/, '');
  }

  // resolved to sass by default (could be switched to less for instance)
  this.hookFor('stylesheet-engine');

  // resolved to mocha by default (could be switched to jasmine for instance)
  this.hookFor('test-framework');

}

util.inherits(AppGenerator, yeoman.generators.NamedBase);


AppGenerator.prototype.askFor = function askFor (argument) {
  var cb   = this.async();
  var self = this;

  // a bit verbose prompt configuration, maybe we can improve that
  // demonstration purpose. Also, probably better to have this in other generator, whose responsability is to ask
  // and fetch all realated bootstrap stuff, that we hook from this generator.
  var prompts = [{
    name: 'bootstrap',
    message: 'Would you like to include the Twitter Bootstrap plugins?',
    default: 'Y/n',
    warning: 'Yes: All Twitter Bootstrap plugins will be placed into the JavaScript vendor directory.'
  }, {
    name: 'bootstrapDest',
    message: 'Where would you like it be downloaded ? (not used if previous answer is no, and relative to application script directory if yes)',
    default: 'vendor/bootstrap',
    warning: 'You can change the default download location'
  },
  {
    name: 'includeRequireJS',
    message: 'Would you like to include RequireJS (for AMD support)?',
    default: 'Y/n',
    warning: 'Yes: RequireJS will be placed into the JavaScript vendor directory.'
  },
  {
    name: 'includeRequireHM',
    message: 'Would you like to support writing ECMAScript 6 modules?',
    default: 'Y/n',
    warning: 'Yes: RequireHM will be placed into the JavaScript vendor directory.'
  }];

  this.prompt( prompts, function(e, props) {
    if(e) {
      return self.emit( 'error', e );
    }

    // manually deal with the response, get back and store the results.
    // We change a bit this way of doing to automatically do this in the self.prompt() method.
    self.bootstrap = (/y/i).test(props.bootstrap);
    self.bootstrapLocation = props.bootstrapDest;
    self.includeRequireJS = (/y/i).test(props.includeRequireJS);
    self.includeRequireHM = (/y/i).test(props.includeRequireHM);

    // we're done, go through next step
    cb();
  });
};

AppGenerator.prototype.readme = function readme() {
  this.copy( 'readme.md', 'readme.md' );
};

AppGenerator.prototype.gruntfile = function gruntfile() {
  this.template('Gruntfile.js');
  this.copy( 'paths.js', 'config/paths.js' );
};

AppGenerator.prototype.packageJSON = function packageJSON() {
  this.template('package.json');
};

AppGenerator.prototype.git = function git() {
  this.copy( 'gitignore', '.gitignore' );
  this.copy( 'gitattributes', '.gitattributes' );
};

AppGenerator.prototype.fetchH5bp = function fetchH5bp() {
  var cb = this.async();

  // we need the grunt config to read the necessary paths
  var config = this.config;
  var appdir = config.paths.app;
  var scripts = config.paths.scripts;

  // Using sha since the lastest tag is so old
  this.remote( 'h5bp', 'html5-boilerplate', '456211dc54c7a0328485d73cf25443d210d8e1d8', function(err, remote) {
    if(err) {
      return cb( err );
    }

    remote.copy( '.htaccess', path.join(appdir, '.htaccess') );
    remote.copy( '404.html', path.join(appdir, '404.html') );
    remote.copy( 'index.html', path.join(appdir, 'index.html') );
    remote.copy( 'robots.txt', path.join(appdir, 'robots.txt') );
    remote.copy( 'js/vendor/jquery-1.8.0.min.js', path.join(appdir, scripts, 'vendor/jquery.min.js') );
    remote.copy( 'js/vendor/modernizr-2.6.1.min.js', path.join(appdir, scripts, 'vendor/modernizr.min.js') );

    cb();
  });
};

AppGenerator.prototype.fetchBootstrap = function fetchBootstrap() {
  // prevent the bootstrap fetch is user said NO
  if(!this.bootstrap) {
    return;
  }

  var cb = this.async();
  var dest = this.bootstrapLocation;

  var scriptdir = path.join(this.config.paths.app, this.config.paths.scripts);

  // third optional argument is the branch / sha1. Defaults to master when ommitted.
  this.remote( 'twitter', 'bootstrap', 'v2.0.4', function(err, remote, files) {
    if(err) {
      return cb( err );
    }

    // XXX to be changed to allow remote.copy('js/*', 'app/scripts/vendor/bootstrap');
    'alert button carousel collapse dropdown modal popover scrollspy tab tooltip transition typeahead'.split(' ')
      .forEach(function( el ) {
        var filename = 'bootstrap-' + el + '.js';
        remote.copy( path.join('js', filename), path.join(scriptdir, dest, filename) );
      });

    cb();
  });
};

AppGenerator.prototype.writeIndex = function writeIndex() {
  // specific paths from grunt config
  var appdir = this.config.paths.app;
  var scriptdir = this.config.paths.scripts;
  var styledir = this.config.paths.styles;

  // Resolve path to index.html
  var indexOut = path.join( appdir, 'index.html' );

  // Read in as string for further update
  var indexData = this.readFileAsString( indexOut );

  // setup the jQuery like cheerio instance
  var $ = cheerio.load( indexData );

  // Prepare default content text
  var defaults = ['HTML5 Boilerplate','Twitter Bootstrap'];
  var contentText = [
    '    <div class="container" style="margin-top:50px">',
    '        <div class="hero-unit">',
    '            <h1>Cheerio!</h1>',
    '            <p>You now have</p>',
    '            <ul>'
  ];

  if(this.includeRequireJS) {
    defaults.push('RequireJS');
  }

  if(this.includeRequireHM) {
    defaults.push('Support for ES6 Modules');
  }

  // Asked for Twitter bootstrap plugins?
  if(this.bootstrap) {
    defaults.push('Twitter Bootstrap plugins');
  }

  // Iterate over defaults, create content string
  defaults.forEach(function(i,x){
    contentText.push('                <li>' + i  +'</li>');
  });

  contentText = contentText.concat([
    '            </ul>',
    '            <p>installed.</p>',
    '            <h3>Enjoy coding! - Yeoman</h3>',
    '        </div>',
    '    </div>',
    ''
  ]);

  // Append the default content
  indexData = indexData.replace( '<body>', '<body>\n' + contentText.join('\n') );

  // Strip sections of H5BP we're going to overwrite
  indexData = this.removeScript( indexData, 'js/plugins.js' );
  indexData = this.removeScript( indexData, 'js/main.js' );
  indexData = this.removeStyle( indexData, 'css/normalize.css' );

  // path.join here will break the page on windows system, sometimes
  // unix-like sepator should be used no matter what. Simple concat may
  // risk a double-slash case (eg. app//scripts//vendor...)

  indexData = indexData.replace( /js\/vendor\/jquery[^"]+/g, scriptdir + '/vendor/jquery.min.js' );

  $('link[href="css/main.css"]').attr( 'href', styledir + '/main.css' );
  $('script[src^="js/vendor/modernizr"]').attr( 'src', scriptdir + '/vendor/modernizr.min.js' );
  indexData = $.html();

  // Asked for Twitter bootstrap plugins?
  if(this.bootstrap) {
    // Wire Twitter Bootstrap plugins (usemin: scripts/plugins.js)
    indexData = this.appendScripts( indexData, scriptdir + '/plugins.js', [
      'vendor/bootstrap/bootstrap-alert.js',
      'vendor/bootstrap/bootstrap-dropdown.js',
      'vendor/bootstrap/bootstrap-tooltip.js',
      'vendor/bootstrap/bootstrap-modal.js',
      'vendor/bootstrap/bootstrap-transition.js',
      'vendor/bootstrap/bootstrap-button.js',
      'vendor/bootstrap/bootstrap-popover.js',
      'vendor/bootstrap/bootstrap-typeahead.js',
      'vendor/bootstrap/bootstrap-carousel.js',
      'vendor/bootstrap/bootstrap-scrollspy.js',
      'vendor/bootstrap/bootstrap-collapse.js',
      'vendor/bootstrap/bootstrap-tab.js'
    ].map(function(plugin) {
      return scriptdir + '/' + plugin;
     }));
  }

  // Write out final file
  this.writeFileFromString( indexData, indexOut );
};

// XXX to be put in a subgenerator like rjs:app, along the fetching or require.js /
// almond lib
AppGenerator.prototype.requirejs = function requirejs() {
  if(!this.includeRequireJS) {
    return;
  }

  var cb   = this.async();
  var self = this;

  // path infos
  var appdir = this.config.paths.app;
  var scriptdir = this.config.paths.scripts;

  this.remote( 'jrburke', 'requirejs', '2.0.5', function(err, remote) {
    if(err) {
      return cb( err );
    }

    remote.copy( 'require.js', path.join(appdir, 'scripts/vendor/require.js') );

    // Wire RequireJS/AMD (usemin: js/amd-app.js)
    var body = self.read( path.resolve(appdir, 'index.html') );
    body = self.appendScripts( body, scriptdir + '/amd-app.js', [scriptdir + '/vendor/require.js'], {
      'data-main': 'main'
    });
    self.write( path.join(appdir, 'index.html'), body );

    // add a basic amd module (should be a file in templates/)
    self.write( path.join(appdir, scriptdir, 'app.js'), [
      "define([], function() {",
      "    return 'Hello from Yeoman!'",
      "});"
    ].join('\n'));

    self.write( path.join(appdir, scriptdir, 'main.js'), [
      "require.config({",
      "  shim:{",
      "  },",
      "  paths: {",
      "    jquery: 'app/scripts/vendor/jquery.min'",
      "  }",
      "});",
      " ",
      "require(['app'], function(app) {",
      "    // use app here",
      "    console.log(app);",
      "});"
    ].join('\n'));

    cb();
  });

};


AppGenerator.prototype.requirehm = function requirehm() {
  if(!this.includeRequireHM) {
    return;
  }

  var cb   = this.async();
  var self = this;

  // path infos
  var appdir = this.config.paths.app;
  var scriptdir = this.config.paths.scripts;

  this.remote( 'jrburke', 'require-hm', '0.2.1', function(err, remote) {
    if(err) {
      return cb( err );
    }

    remote.copy( 'hm.js', path.join(appdir, scriptdir, 'vendor/hm.js') );
    remote.copy( 'esprima.js', path.join(appdir, scriptdir, 'vendor/esprima.js') );


    // Wire RequireJS/AMD (usemin: js/amd-app.js)
    var mainjs = self.read( path.resolve(appdir, scriptdir, 'main.js') );
    mainjs = mainjs.replace( 'require.config({', 'require.config({\n  hm: \'' + appdir + '/' + scriptdir + '/hm\',\n' );
    mainjs = mainjs.replace( 'paths: {', 'paths: {\n    esprima: \'' + appdir + '/' + scriptdir + '/esprima\',' );
    self.write( path.join(appdir, scriptdir, 'main.js'), mainjs );
    cb();
  });
};

AppGenerator.prototype.writeMain = function writeMain() {
  this.log.writeln('Writing compiled Bootstrap');
  this.template( 'main.css', path.join(this.config.paths.app, this.config.paths.styles, 'bootstrap.css') );
};

AppGenerator.prototype.app = function app() {
  var appdir = this.config.paths.app;
  this.mkdir( appdir );
  this.mkdir( path.join(appdir, this.config.paths.scripts) );
  this.mkdir( path.join(appdir, this.config.paths.styles) );
  this.mkdir( path.join(appdir, this.config.paths.images) );
  this.mkdir( path.join(appdir, 'templates') );
};

AppGenerator.prototype.lib = function lib() {
  this.mkdir('lib');
  // init a generator ? a readme explaining the purpose of the lib/ folder?
};

AppGenerator.prototype.test = function test() {
  this.mkdir(this.config.paths.test);
};
