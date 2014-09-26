// repl-server.js

'use strict';

var _ = require('lodash');
var dlog = require('debug')('repl-server');
var Gremlin = require('gremlin');
var Q = require('q');
var util = require('util');
var vm = require('vm');

var gremlin = new Gremlin();

function makeEmptyTinker() {
  var TinkerGraph = gremlin.java.import('com.tinkerpop.blueprints.impls.tg.TinkerGraph');
  return gremlin.wrap(new TinkerGraph());
}

function makeDemoTinker() {
  var TinkerGraphFactory = gremlin.java.import('com.tinkerpop.blueprints.impls.tg.TinkerGraphFactory');
  return gremlin.wrap(TinkerGraphFactory.createTinkerGraphSync());
}

function transformResult(result) {
  if (_.isUndefined(result)) {
    dlog('Result is undefined');
    return result;
  }

  if (!_.isObject(result)) {
    dlog('Was not an object:', result);
    return result;
  }

  if (Q.isPromise(result)) {
    console.error('Was a promise:', result);
    process.exit();
  }

  if (result instanceof Gremlin.PipelineWrapper)
    dlog('Result is a gremlin pipeline.');
  if (result instanceof Gremlin.GraphWrapper)
    dlog('Result is a gremlin graph.');
  if (result instanceof Gremlin.QueryWrapper)
    dlog('Result is a gremlin query.');
  if (result instanceof Gremlin.VertexWrapper)
    dlog('Result is a gremlin vertex.');
  if (result instanceof Gremlin.EdgeWrapper)
    dlog('Result is a gremlin edge.');

  var hasToJsonSync = _.isFunction(result.toJSONSync);
  var hasToStrSync = _.isFunction(result.toStringSync);

  if (hasToJsonSync && hasToStrSync) {
    dlog('Has BOTH toJSON && toStringSync. toStringSync:'. result.toStringSync());
  }

  if (hasToJsonSync) {
    dlog('Calling toJSONSync()');
    return result.toJSONSync();
  }

  if (hasToStrSync) {
    dlog('Has toStringSync():', result);
    return result.toStringSync();
  }

  if (_.isFunction(result.toListSync)) {
    dlog('Has toListSync():', result);
    return result.toListSync();
  }

  dlog('Object with no known transform functions:', result);
  return result;
}

function promisify(repl) {
  /*jshint -W061 */
  var Q = require('q');
  var _eval = repl.eval;
  repl.eval = function(cmd, context, filename, callback) {
    dlog('cmd:', cmd);

    var parenthesized = /^\((.+)\n\)$/m;
    var isParenthesized = parenthesized.exec(cmd);
    if (isParenthesized) {
      cmd = isParenthesized[1];
      dlog('deParened:', cmd);
    }

    // var (symbol) = (expression)
    var assignmentExpr = /^(\s*|var\s+)([_\w\$]+)\s*=\s*(.*)$/m;
    var matches = assignmentExpr.exec(cmd);
    var isScopedVar = matches!==null;
    dlog('Is scoped var:', isScopedVar, matches);

    var symbol;
    if (isScopedVar) {
        symbol = matches[2];
        cmd = matches[3];    // change cmd that will be compiled & executed!
        dlog('var assignment', symbol, cmd);
    }

    Q.nfcall(_eval, cmd, context, filename)
      .catch(function (error) { callback(error); })
      .done(function (result) {
        if (Q.isPromise(result)) {
          console.error('Was a promise:', result);
          process.exit();
        }
        if (isScopedVar) {
          context[symbol] = result;
          if (matches[1].trim() === 'var')
            result = undefined;
        }
        callback(null, result);
      });
  };
}

function startReplServer(options) {

  /*jshint -W061 */
  options.ignoreUndefined = true;
  options.writer = function(obj) {
    var transformed = transformResult(obj);
    return util.inspect(transformed, {depth: null, colors: options.output.isTTY });
  };

  var initialContext = {
    gremlin: gremlin,
    T: gremlin.Tokens,
    t: makeEmptyTinker(),
    g: makeDemoTinker(),
    makeEmptyTinker: makeEmptyTinker,
    makeDemoTinker: makeDemoTinker,
    HashSet: gremlin.java.import('java.util.HashSet'),
    ArrayList: gremlin.java.import('java.util.ArrayList'),
    HashMap: gremlin.java.import('java.util.HashMap'),
    Q: Q,
    __: _,
  };

  var repl;
  var replServer;
  if (options.input.isTTY) {
    dlog("Using node's repl library.");
    repl = require('repl');
    replServer = repl.start(options);
    promisify(replServer);
    _.assign(replServer.context, initialContext);
  }
  else {
    dlog("Using repl-promise.");
    repl = require('repl-promise');
    replServer = repl.start(options, initialContext);
  }

  return replServer;
}

module.exports = { start: startReplServer };
