(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@tempest/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@tempest/core'], factory) :
    (factory((global.tempestMerge = global.tempestMerge || {}),global.tempestCore));
}(this, function (exports,_tempest_core) { 'use strict';

    function merge(streams) {
        return new _tempest_core.Stream(new Merge(streams.map(getSource)));
    }
    function getSource(stream) {
        return stream.source;
    }
    var Merge = function Merge(sources) {
        this.sources = sources;
    };
    Merge.prototype.run = function run (sink, scheduler) {
            var this$1 = this;

        var length = this.sources.length;
        var disposables = new Array(length);
        var sinks = new Array(length);
        var mergeSink = new MergeSink(disposables, sinks, sink);
        var indexSink;
        for (var i = 0; i < length; ++i) {
            indexSink = sinks[i] = new _tempest_core.IndexSink(i, mergeSink);
            disposables[i] = this$1.sources[i].run(indexSink, scheduler);
        }
        return {
            dispose: function dispose() {
                disposables.forEach(function (disposable) {
                    disposable.dispose();
                });
            }
        };
    };
    var MergeSink = function MergeSink(disposables, sinks, sink) {
        this.disposables = disposables;
        this.sink = sink;
        this.activeCount = sinks.length;
    };
    MergeSink.prototype.event = function event (time, value) {
        this.sink.event(time, value.value);
    };
    MergeSink.prototype.error = function error (time, err) {
        this.sink.error(time, err);
    };
    MergeSink.prototype.end = function end (time, value) {
        tryDispose(time, this.disposables[value.index], this.sink);
        if (--this.activeCount === 0) {
            this.sink.end(time, value.value);
        }
    };
    function tryDispose(time, disposable, sink) {
        try {
            disposable.dispose();
        }
        catch (e) {
            sink.error(time, e);
        }
    }

    exports.merge = merge;
    exports.Merge = Merge;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=tempest-merge.js.map
