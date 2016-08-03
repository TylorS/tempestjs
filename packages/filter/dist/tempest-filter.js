(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@tempest/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@tempest/core'], factory) :
    (factory((global.tempestFilter = global.tempestFilter || {}),global.tempestCore));
}(this, function (exports,_tempest_core) { 'use strict';

    var filter = function (predicate, stream) {
        switch (arguments.length) {
            case 1: return function (stream) { return new _tempest_core.Stream(new Filter(predicate, stream.source)); };
            case 2: return new _tempest_core.Stream(new Filter(predicate, stream.source));
            default: return filter;
        }
    };
    var Filter = function Filter(predicate, source) {
        this.predicate = predicate;
        this.source = source;
    };
    Filter.prototype.run = function run (sink, scheduler) {
        return this.source.run(new FilterSink(this.predicate, sink), scheduler);
    };
    var FilterSink = function FilterSink(predicate, sink) {
        this.predicate = predicate;
        this.sink = sink;
    };
    FilterSink.prototype.event = function event (time, value) {
        if (this.predicate(value)) {
            this.sink.event(time, value);
        }
    };
    FilterSink.prototype.error = function error (time, err) {
        this.sink.error(time, err);
    };
    FilterSink.prototype.end = function end (time, value) {
        this.sink.end(time, value);
    };

    exports.filter = filter;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=tempest-filter.js.map
