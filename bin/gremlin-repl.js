#!/usr/bin/env node
// gremlin-repl.js

'use strict';

var repl = require('../lib/repl-server.js');

var options = {
    prompt: 'node > ',
    input: process.stdin,
    output: process.stdout,
}

var replServer = repl.start(options);
