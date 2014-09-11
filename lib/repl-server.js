// repl-server.js

'use strict';

var _ = require('lodash');
var Gremlin = require('gremlin');
var repl = require('repl-promise');
var TeeTransform = require('./TeeTransform');
var util = require('util');
var vm = require('vm');
var Q = require('q');

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

//     console.log('Transforming:', result);

    if (Q.isPromise(result)) {
//         console.log('Was a promise:', result);
        return result;
    }
    else if (!_.isObject(result)) {
//         console.log('Was not an object:', result);
        return new Q(result);
    }
    else if (_.isFunction(result.toListSync)) {
        console.log('Has toListSync():', result);
        return new Q(result.toListSync());
    }
    else if (_.isFunction(result.toJSON)) {
//         console.log('Has toJSON():', result);
        deferred = Q.defer();
        result.toJSON(deferred.makeNodeResolver());
        return deferred.promise;
    }
    else if (_.isFunction(result.toStringSync)) {
//         console.log('Has toStringSync():', result);
        return new Q(result.toStringSync());
    }
    else {
//         console.log('Object with no known transform functions:', result);
        return new Q(result);
    }
}

function startReplServer(options) {
    /*jshint -W061 */
    options.ignoreUndefined = true;
    options.eval = cmdEval;
    options.transformResult = transformResult;
    options.writer = function(obj) {
        return util.inspect(obj, { depth: null } );
    };

//     var input = options.input;
//     if (!options.output.isTTY) {
//         var transformedInput = new TeeTransform({ tee: options.output, teeFormat: '%s\n'} );
//         input.pipe(transformedInput);
//         options.input = transformedInput;
//     }

    var initialContext = {
        gremlin: gremlin,
        T: gremlin.Tokens,
        t: makeEmptyTinker(),
        g: makeDemoTinker(),
        HashSet: gremlin.java.import('java.util.HashSet'),
        ArrayList: gremlin.java.import('java.util.ArrayList'),
        HashMap: gremlin.java.import('java.util.HashMap'),
        __: _,
    };

    var replServer = repl.start(options, initialContext);

    return replServer;
}

module.exports = { start: startReplServer };
