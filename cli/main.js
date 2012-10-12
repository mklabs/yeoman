

// Required by grunt, main package entry point should be relative to the
// internal tasks directory (as require.resolve('yeoman') + 'tasks')

// but still contain all yeoman specifics within the lib directory
module.exports = require('./lib/yeoman');
