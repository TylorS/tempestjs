(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@tempest/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@tempest/core'], factory) :
    (factory((global.tempestFlatten = global.tempestFlatten || {}),global.tempestCore));
}(this, function (exports,_tempest_core) { 'use strict';

    function flatten(stream) {
        return new _tempest_core.Stream(new Flatten(stream.source));
    }
    var emptyDisposable = { dispose: function () { return void 0; } };
    var Flatten = function Flatten(source) {
        this.source = source;
    };
    Flatten.prototype.run = function run (sink, scheduler) {
        var flattenSink = new FlattenSink(sink, scheduler);
        var disposable = this.source.run(flattenSink, scheduler);
        return {
            dispose: function dispose() {
                flattenSink.dispose();
                disposable.dispose();
            }
        };
    };
    var FlattenSink = function FlattenSink(sink, scheduler) {
        this.sink = sink;
        this.scheduler = scheduler;
        this.current = null;
        this.ended = false;
    };
    FlattenSink.prototype.event = function event (time, value) {
        this._disposeCurrent(time);
        this.current = new Segment(time, Infinity, this, this.sink);
        this.current.disposable = value.source.run(this.current, this.scheduler);
    };
    FlattenSink.prototype.error = function error (time, err) {
        this.ended = true;
        this.sink.error(time, err);
    };
    FlattenSink.prototype.end = function end (time) {
        this.ended = true;
        this._checkEnd(time, void 0);
    };
    FlattenSink.prototype.dispose = function dispose () {
        return this._disposeCurrent(0);
    };
    FlattenSink.prototype._disposeCurrent = function _disposeCurrent (time) {
        if (this.current !== null) {
            return this.current._dispose(time);
        }
    };
    FlattenSink.prototype._disposeInner = function _disposeInner (time, inner) {
        inner._dispose(time);
        if (inner === this.current) {
            this.current = null;
        }
    };
    FlattenSink.prototype._checkEnd = function _checkEnd (time, value) {
        if (this.ended && this.current === null) {
            this.sink.end(time, value);
        }
    };
    FlattenSink.prototype._endInner = function _endInner (time, value, inner) {
        this._disposeInner(time, inner);
        this._checkEnd(time, value);
    };
    FlattenSink.prototype._errorInner = function _errorInner (time, err, inner) {
        this._disposeInner(time, inner);
        this.sink.error(time, err);
    };
    var Segment = function Segment(min, max, outer, sink) {
        this.min = min;
        this.max = max;
        this.outer = outer;
        this.sink = sink;
        this.disposable = emptyDisposable;
    };
    Segment.prototype.event = function event (time, value) {
        if (time < this.max) {
            this.sink.event(Math.max(time, this.min), value);
        }
    };
    Segment.prototype.error = function error (time, err) {
        this.outer._errorInner(Math.max(time, this.min), err, this);
    };
    Segment.prototype.end = function end (time, value) {
        this.outer._endInner(Math.max(time, this.min), value, this);
    };
    Segment.prototype._dispose = function _dispose (time) {
        this.max = time;
        try {
            this.disposable.dispose();
        }
        catch (e) {
            this.sink.error(time, e);
        }
    };

    exports.flatten = flatten;
    exports.Flatten = Flatten;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=tempest-flatten.js.map
