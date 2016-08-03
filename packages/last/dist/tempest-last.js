(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@tempest/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@tempest/core'], factory) :
    (factory((global.tempestLast = global.tempestLast || {}),global.tempestCore));
}(this, function (exports,_tempest_core) { 'use strict';

    function last(stream) {
        return new _tempest_core.Stream(new Last(stream.source));
    }
    var Last = function Last(source) {
        this.source = source;
    };
    Last.prototype.run = function run (sink, scheduler) {
        return this.source.run(new LastSink(sink), scheduler);
    };
    var LastSink = function LastSink(sink) {
        this.sink = sink;
        this.has = false;
    };
    LastSink.prototype.event = function event (time, value) {
        this.has = true;
        this.value = value;
    };
    LastSink.prototype.error = function error (time, err) {
        this.has = false;
        this.sink.error(time, err);
    };
    LastSink.prototype.end = function end (time, value) {
        if (this.has) {
            this.sink.event(time, this.value);
            this.has = false;
        }
        this.sink.end(time, value);
    };

    exports.last = last;
    exports.Last = Last;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=tempest-last.js.map
