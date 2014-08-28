// TeeTransform.js
//
// Transform stream code adapted from:
// http://strongloop.com/strongblog/practical-examples-of-the-new-node-js-streams-api/

'use strict';

var Transform = require('stream').Transform;
var util = require('util');
var _ = require('lodash');

util.inherits(TeeTransform, Transform);

function TeeTransform(options) {
    this.tee = _.has(options, 'tee') ? options.tee : process.stdout;
    this.teeFormat = _.has(options, 'teeFormat') ? options.teeFormat : '%s\n';
    Transform.call(this, options);

    this.on('finish', function() {
        if (this.tee !== process.stdout) {
            this.tee.end();
        }
    });
}

TeeTransform.prototype._transform = function(chunk, enc, done) {
    var UTF8 = 'utf8';
    var data = chunk.toString(UTF8);
    if (this._lastLineData) data = this._lastLineData + data;

    var lines = data.split('\n');
    this._lastLineData = lines.splice(lines.length-1,1)[0];

    for (var i=0; i<lines.length; i++) {
        if (this.tee) {
            this.tee.write(util.format(this.teeFormat, lines[i]), UTF8);
        }
        this.push(lines[i]+'\n', UTF8);
    }

    done();
};

TeeTransform.prototype._flush = function(done) {
     if (this._lastLineData) this.push(this._lastLineData);
     this._lastLineData = null;
     done();
};

module.exports = TeeTransform;
