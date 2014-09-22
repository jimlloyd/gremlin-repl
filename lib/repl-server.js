// repl-server.js

'use strict';

var _ = require('lodash');
var dlog = require('debug')('repl-server');
var Gremlin = require('gremlin');
var Q = require('q');
var repl = require('repl-promise');
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

function cmdEval(code, context, file, cb) {
    var err;
    var result;

    try {
        result = vm.runInContext(code, context, file);
    } catch (e) {
        err = e;
    }

    if (err && process.domain) {
        process.domain.emit('error', err);
        process.domain.exit();
    }
    else if (err) {
        cb(err);
    }
    else if (!_.isObject(result)) {
        cb(null, result);
    }
    else if (_.isFunction(result.toJSONSync)) {
        cb(null, result.toJSONSync());
    }
    else if (_.isFunction(result.toStringSync)) {
        cb(null, result.toStringSync());
    }
    else {
        cb(null, result);
    }
}

function transformResult(result) {
    var deferred;

    if (_.isUndefined(result)) {
		dlog('Result is undefined');
        return new Q(result);
    }

    if (!_.isObject(result)) {
		dlog('Was not an object:', result);
        return new Q(result);
    }

    if (Q.isPromise(result)) {
		dlog('Was a promise:', result);
        return result;
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

    var hasToJson = _.isFunction(result.toJSON);
    var hasToStrSync = _.isFunction(result.toStringSync);

    if (hasToJson && hasToStrSync) {
		dlog('Has BOTH toJSON && toStringSync. toStringSync:'. result.toStringSync());
    }

    if (hasToJson) {
		dlog('Calling toJSON()');
        deferred = Q.defer();
        result.toJSON(deferred.makeNodeResolver());
        return deferred.promise;
// 		return Q.nbind(result.toJSON, result)();
    }

    if (hasToStrSync) {
		dlog('Has toStringSync():', result);
        return new Q(result.toStringSync());
    }

    if (_.isFunction(result.toListSync)) {
        dlog('Has toListSync():', result);
        return new Q(result.toListSync());
    }

    dlog('Object with no known transform functions:', result);
    return new Q(result);
}

function startReplServer(options) {
    /*jshint -W061 */
    options.ignoreUndefined = true;
    options.eval = cmdEval;
    options.transformResult = transformResult;
    options.writer = function(obj) {
        return util.inspect(obj, { depth: null } );
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
        __: _,
    };

    var replServer = repl.start(options, initialContext);

    return replServer;
}

module.exports = { start: startReplServer };
