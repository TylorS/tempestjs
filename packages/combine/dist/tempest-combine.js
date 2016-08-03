(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@tempest/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@tempest/core'], factory) :
    (factory((global.tempestCombine = global.tempestCombine || {}),global.tempestCore));
}(this, function (exports,_tempest_core) { 'use strict';

    var combine = function (streams) {
        return new _tempest_core.Stream(new Combine(streams.map(getSource)));
    };
    function getSource(stream) {
        return stream.source;
    }
    var Combine = function Combine(sources) {
        this.sources = sources;
    };
    Combine.prototype.run = function run (sink, scheduler) {
            var this$1 = this;

        var length = this.sources.length;
        var disposables = new Array(length);
        var sinks = new Array(length);
        var mergeSink = new CombineSink(disposables, sinks, sink);
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
    var CombineSink = function CombineSink(disposables, sinks, sink) {
        var this$1 = this;

        this.disposables = disposables;
        this.sinks = sinks;
        this.sink = sink;
        var l = sinks.length;
        this.awaiting = l;
        this.values = new Array(l);
        this.hasValue = new Array(l);
        for (var i = 0; i < l; ++i) {
            this$1.hasValue[i] = false;
        }
        this.activeCount = l;
    };
    CombineSink.prototype.event = function event (time, value) {
        var i = value.index;
        var awaiting = this._updateReady(i);
        this.values[i] = value.value;
        if (awaiting === 0) {
            this.sink.event(time, this.values);
        }
    };
    CombineSink.prototype.error = function error (time, err) {
        this.sink.error(time, err);
    };
    CombineSink.prototype.end = function end (time, value) {
        tryDispose(time, this.disposables[value.index], this.sink);
        if (--this.activeCount === 0) {
            this.sink.end(time, this.values);
        }
    };
    CombineSink.prototype._updateReady = function _updateReady (i) {
        if (this.awaiting > 0) {
            if (!this.hasValue[i]) {
                this.hasValue[i] = true;
                this.awaiting -= 1;
            }
        }
        return this.awaiting;
    };
    function tryDispose(time, disposable, sink) {
        try {
            disposable.dispose();
        }
        catch (e) {
            sink.error(time, e);
        }
    }

    exports.combine = combine;
    exports.Combine = Combine;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=tempest-combine.js.map
