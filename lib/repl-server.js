// repl-server.js

'use strict';

var _ = require('lodash');
var Gremlin = require('gremlin');
var repl = require('repl');
var TeeTransform = require('./TeeTransform');
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

function startReplServer(options) {
    /*jshint -W061 */
    options.ignoreUndefined = true;
    options.eval = cmdEval;
    options.writer = function(obj) {
        return util.inspect(obj, { depth: null } );
    };

    var input = options.input;
    if (!options.output.isTTY) {
        var transformedInput = new TeeTransform({ tee: options.output, teeFormat: '%s\n'} );
        input.pipe(transformedInput);
        options.input = transformedInput;
    }

    var replServer = repl.start(options);

    replServer.context.gremlin = gremlin;
    replServer.context.T = gremlin.Tokens;

    replServer.context.t = makeEmptyTinker();
    replServer.context.g = makeDemoTinker();
    replServer.context.HashSet = gremlin.java.import('java.util.HashSet');
    replServer.context.ArrayList = gremlin.java.import('java.util.ArrayList');
    replServer.context.HashMap = gremlin.java.import('java.util.HashMap');
    replServer.context.__ = _;

    return replServer;
}

module.exports = { start: startReplServer };
