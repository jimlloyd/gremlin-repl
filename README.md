gremlin-repl
============

[![Build Status](https://travis-ci.org/jimlloyd/gremlin-repl.svg)](https://travis-ci.org/jimlloyd/gremlin-repl)

A [REPL](http://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop) for [Gremlin](https://github.com/tinkerpop/gremlin/wiki).

This package provides an alternative for the console application provided with [gremlin-node](https://github.com/inolen/gremlin-node).
Instead of using [Node's REPL module](http://nodejs.org/api/repl.html), it uses the alternate REPL package
[repl-promise](https://github.com/jimlloyd/repl-promise). See that package's [README](https://github.com/jimlloyd/repl-promise/blob/master/README.md) for the full rationale for
not using Node's REPL.

The main reason for this alternate console is to allow writing unit tests for gremlin-node that are simply text
files with console input, and their corresponding expected output transcripts. Most of the examples provided at gremlindocs.com have been ported as such tests. The resulting expected ouput transcript tests are useful
documentation illustrating how the gremlin-node implementation differs from the Groovy Gremlin implementation.

### Dependencies

This package is a work in progress, and currently relies on work in progress in the gremlin-node package. In particular, this package assumes the use of Promises that are being added to gremlin-node that are not yet available on the master branch, let alone in a published NPM module. See the package.json for its reference to a specific branch in the repo
http://github.com/jimlloyd/gremlin-node.
