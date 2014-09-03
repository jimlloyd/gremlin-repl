// # Transcript-test.js

'use strict';

require('./support/config');

var repl = require('../lib/repl-server.js');
var fs = require('fs');
var concat = require('concat-stream');
var Q = require('q');

function transcriptTest(name, done) {
    var expected = fs.readFileSync('test/data/'+name+'.expected', { encoding: 'utf8' });
    var expectedLines = expected.split('\n');

    var concatDeferred = Q.defer();

    var output = concat({encoding: 'string'}, function(data) {
        var dataLines = data.split('\n');
        concatDeferred.resolve(dataLines);
    });

    var options = {
        prompt: 'node > ',
        input: fs.createReadStream('test/data/'+name+'.txt'),
        output: output,
    };

    var replServer = repl.start(options);

    Q.all([concatDeferred.promise, replServer.endOfSessionPromise])
        .then(function(results) {
            var dataLines = results[0];
            expect(dataLines).to.deep.equal(expectedLines);
            done();
        })
        .done();
}

describe('Transcript', function() {

    it('should produce the expected transcript given promises-test.txt', function(done) {
        this.timeout(5000);
        transcriptTest('promises-test', done);
    });

    it('should produce the expected transcript given Examples.txt', function(done) {
        this.timeout(5000);
        transcriptTest('Examples', done);
    });

    it('should produce the expected transcript given test.txt', function(done) {
        this.timeout(5000);
        transcriptTest('test', done);
    });

    it('should produce the expected transcript given gremlindocs-transform.txt', function(done) {
        this.timeout(5000);
        transcriptTest('gremlindocs-transform', done);
    });

    it('should produce the expected transcript given gremlindocs-filter.txt', function(done) {
        this.timeout(5000);
        transcriptTest('gremlindocs-filter', done);
    });

    it('should produce the expected transcript given gremlindocs-side-effects.txt', function(done) {
        this.timeout(5000);
        transcriptTest('gremlindocs-side-effects', done);
    });

    it('should produce the expected transcript given gremlindocs-branch.txt', function(done) {
        this.timeout(5000);
        transcriptTest('gremlindocs-branch', done);
    });

    it('should produce the expected transcript given gremlindocs-methods.txt', function(done) {
        this.timeout(10000);
        transcriptTest('gremlindocs-methods', done);
    });

});
