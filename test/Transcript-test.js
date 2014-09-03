// # Transcript-test.js

'use strict';

require('./support/config');

var repl = require('../lib/repl-server.js');
var fs = require('fs');
var concat = require('concat-stream');

function transcriptTest(name, done) {
    var expected = fs.readFileSync('test/data/'+name+'.expected', { encoding: 'utf8' });
    var expectedLines = expected.split('\n');

    var output = concat({encoding: 'string'}, function(data) {
        var dataLines = data.split('\n');
        expect(dataLines).to.deep.equal(expectedLines);
        done();
    });

    var options = {
        prompt: 'node > ',
        input: fs.createReadStream('test/data/'+name+'.txt'),
        output: output,
    };

    repl.start(options);
}

describe('Transcript', function() {

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

});
