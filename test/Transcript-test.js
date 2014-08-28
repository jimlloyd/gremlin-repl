// # Transcript-test.js

'use strict';

require('./support/config');

var repl = require('../lib/repl-server.js');
var fs = require('fs');
var concat = require('concat-stream');

describe('Transcript', function() {

    it('should produce the expected transcript given Examples.txt', function(done) {
        this.timeout(5000);

        var expected = fs.readFileSync('test/data/Examples.expected', { encoding: 'utf8' });
        var expectedLines = expected.split('\n');

        var output = concat({encoding: 'string'}, function(data) {
            var dataLines = data.split('\n');
            expect(dataLines).to.deep.equal(expectedLines);
            done();
        });

        var options = {
            prompt: 'node > ',
            input: fs.createReadStream('test/data/Examples.txt'),
            output: output,
        };

        repl.start(options);
    });

    it('should produce the expected transcript given test.txt', function(done) {
        this.timeout(5000);

        var expected = fs.readFileSync('test/data/test.expected', { encoding: 'utf8' });
        var expectedLines = expected.split('\n');

        var output = concat({encoding: 'string'}, function(data) {
            var dataLines = data.split('\n');
            expect(dataLines).to.deep.equal(expectedLines);
            done();
        });

        var options = {
            prompt: 'node > ',
            input: fs.createReadStream('test/data/test.txt'),
            output: output,
        };

        repl.start(options);
    });

});
