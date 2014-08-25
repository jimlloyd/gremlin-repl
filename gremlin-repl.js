// gremlin-repl.js

'use strict';

var util = require('util');
var repl = require('repl');
var Gremlin = require('gremlin');
var gremlin = new Gremlin();

var replServer = repl.start({
  prompt: 'node > ',
  ignoreUndefined: true,
});

replServer.context.P = function(err, results) {
  if (err) {
    return console.err(err);
  }
  else {
    util.print(util.inspect(results));
  }
}

function NewTinkerGraph() {
    var TinkerGraph = gremlin.java.import('com.tinkerpop.blueprints.impls.tg.TinkerGraph');
    return gremin.wrap(new TinkerGraph());
}

replServer.context.gremlin = gremlin;
replServer.context.g = NewTinkerGraph();
