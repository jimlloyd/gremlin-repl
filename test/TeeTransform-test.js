// # TeeTransform-test.js

'use strict';

require('./support/config');

var from = require('from');
var concat = require('concat-stream');

describe('TeeTransform', function() {
    var TeeTransform = require('../lib/TeeTransform');
    var semaphore = require('semaphore');

    it('should process an empty stream', function(done) {
        var lines = [];
        var input = from(lines.slice());
        var sem = semaphore(0);

        var mainOut = concat({encoding: 'string'}, function(data) {
            var expected = '';
            expect(data).to.equal(expected);
            sem.leave();
        });

        var teeOut = concat({encoding: 'string'}, function(data) {
            var expected = '';
            expect(data).to.equal(expected);
            sem.leave();
        });

        var tee = new TeeTransform({ tee: teeOut, teeFormat: '|%s|\n' });

        tee.pipe(mainOut);
        input.pipe(tee);

        sem.take(2, function() {
            done();
        });
    });

    it('should process one line of text', function(done) {
        var lines = ['Hello world\n'];
        var input = from(lines.slice());
        var sem = semaphore(0);

        var mainOut = concat({encoding: 'string'}, function(data) {
            var expected = lines.join('');
            expect(data).to.equal(expected);
            sem.leave();
        });

        var teeOut = concat({encoding: 'string'}, function(data) {
            var expected = '|Hello world|\n';
            expect(data).to.equal(expected);
            sem.leave();
        });

        var tee = new TeeTransform({ tee: teeOut, teeFormat: '|%s|\n' });

        tee.pipe(mainOut);
        input.pipe(tee);

        sem.take(2, function() {
            done();
        });
    });

    it('should process two lines of text', function(done) {
        var lines = ['Hello world\n', 'Goodbye Jim\n'];
        var input = from(lines.slice());
        var sem = semaphore(0);

        var mainOut = concat({encoding: 'string'}, function(data) {
            var expected = lines.join('');
            expect(data).to.equal(expected);
            sem.leave();
        });

        var teeOut = concat({encoding: 'string'}, function(data) {
            var expected = '|Hello world|\n|Goodbye Jim|\n';
            expect(data).to.equal(expected);
            sem.leave();
        });

        var tee = new TeeTransform({ tee: teeOut, teeFormat: '|%s|\n' });

        tee.pipe(mainOut);
        input.pipe(tee);

        sem.take(2, function() {
            done();
        });
    });

    it('should process multiple partial lines of text', function(done) {
        var lines = ['Hello ', 'world\n', 'Good', 'bye Jim\n'];
        var input = from(lines.slice());
        var sem = semaphore(0);

        var mainOut = concat({encoding: 'string'}, function(data) {
            var expected = lines.join('');
            expect(data).to.equal(expected);
            sem.leave();
        });

        var teeOut = concat({encoding: 'string'}, function(data) {
            var expected = '|Hello world|\n|Goodbye Jim|\n';
            expect(data).to.equal(expected);
            sem.leave();
        });

        var tee = new TeeTransform({ tee: teeOut, teeFormat: '|%s|\n' });

        tee.pipe(mainOut);
        input.pipe(tee);

        sem.take(2, function() {
            done();
        });
    });
});
