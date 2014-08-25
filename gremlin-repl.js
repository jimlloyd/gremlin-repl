#!/usr/bin/env node
// gremlin-repl.js

'use strict';

var Gremlin = require('gremlin');
var repl = require('repl');
var vm = require('vm');
var _ = require('lodash');

var gremlin = new Gremlin();

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
    else if (_.isObject(result) && _.isFunction(result.toJSONSync)) {
        cb(null, result.toJSONSync());
    }
    else {
        cb(null, result);
    }
}

var replServer = repl.start({
  prompt: 'node > ',
  ignoreUndefined: true,
  eval: cmdEval,
});

function NewEmptyTinker() {
    var TinkerGraph = gremlin.java.import('com.tinkerpop.blueprints.impls.tg.TinkerGraph');
    return gremlin.wrap(new TinkerGraph());
}

function NewDemoTinker() {
    var TinkerGraphFactory = gremlin.java.import('com.tinkerpop.blueprints.impls.tg.TinkerGraphFactory');
    return gremlin.wrap(TinkerGraphFactory.createTinkerGraphSync());
}

replServer.context.gremlin = gremlin;
replServer.context.t = NewEmptyTinker();
replServer.context.g = NewDemoTinker();
replServer.context.HashSet = gremlin.java.import('java.util.HashSet');
replServer.context.ArrayList = gremlin.java.import('java.util.ArrayList');
replServer.context.HashMap = gremlin.java.import('java.util.HashMap');
replServer.context.__ = _;
