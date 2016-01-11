var colors = require('colors');
var _ = require('underscore');
var s = require('underscore.string');

var methodColors = {
	trace: colors.cyan,
    debug: colors.magenta,
    express: colors.green,
    info: colors.grey,
    warn: colors.yellow,
    error: colors.red,
    data: colors.grey
};

module.exports = debugConfig();

module.exports.stream = {
    write: function(message, encoding) {
        module.exports.express(message);
    }
}


function debugConfig() {
  return require('tracer').console({
    methods: ['trace', 'debug', 'express', 'info', 'warn', 'error'],
    format: [
      '[{{timestamp}}]  {{title}}  {{message}}'
    ],
    dateformat: 'yyyy-mm-dd HH:MM:ss.l',
    preprocess: preprocess,
    filters: {
      express: s.trim
    }
  })
}

function productionConfig() {
  return require('tracer').console({
    level: 'express',
    methods: ['trace', 'debug', 'express', 'info', 'warn', 'error'],
    format: [
      '[{{timestamp}}]  {{title}}  {{message}}'
    ],
    dateformat: 'yyyy-mm-dd HH:MM:ss.l',
    preprocess: preprocess,
    filters: {
      express: s.trim
    }
  })
}


function preprocess(data) {
  // Format method name (severity)
  var color = methodColors[data.title];
  data.title = s.rpad(data.title.toUpperCase(), 7);
  if (color)
      data.title = color(data.title);
  // Pretty print args that are objects
  for(var i in data.args) {
      if (_.isObject(data.args[i]))
          data.args[i] = prettyPrint(data.args[i]);
  }
}

function prettyPrint(obj) {
    var dataColor = methodColors['data'] || colors.grey;
    // Handle exceptions
    if (obj instanceof Error) {
		// Remove the stack from the error object and format it so that
		// it's easier to read.
        var err = '';
        if (obj.stack) {
            var stackPrefix = dataColor('\nstack:  ');
            err += stackPrefix + obj.stack.split('\n').join(stackPrefix);
        }
        var errPrefix = methodColors['error']('\nerror: ');
        err += errPrefix + JSON.stringify(_.omit(obj, 'stack'), null, 2).split('\n').join(errPrefix);
        return err;
    }
    // Handle all other objects
    var pretty = JSON.stringify(obj, null, 2);
    var prefix = dataColor('\ndata:   ');
    return prefix + pretty.split('\n').join(prefix);
}