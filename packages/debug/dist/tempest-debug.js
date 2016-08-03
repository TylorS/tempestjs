(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@tempest/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@tempest/core'], factory) :
    (factory((global.tempestDebug = global.tempestDebug || {}),global.tempestCore));
}(this, function (exports,_tempest_core) { 'use strict';

    function debug(infoOrSpy, stream) {
        return new _tempest_core.Stream(new Debug(infoOrSpy, stream.source));
    }
    var Debug = function Debug(infoOrSpy, source) {
        this.infoOrSpy = infoOrSpy;
        this.source = source;
    };
    Debug.prototype.run = function run (sink, scheduler) {
        if (typeof this.infoOrSpy === 'object') {
            if (typeof this.infoOrSpy.dispose === 'function') {
                var disposeSpy = this.infoOrSpy.dispose;
                var disposable = this.source.run(new DebugSink(this.infoOrSpy, sink), scheduler);
                return {
                    dispose: function dispose() {
                        disposeSpy();
                        return disposable.dispose();
                    }
                };
            }
        }
        else {
            return this.source.run(new DebugSink(this.infoOrSpy, sink), scheduler);
        }
    };
    var DebugSink = function DebugSink(infoOrSpy, sink) {
        this.infoOrSpy = infoOrSpy;
        this.sink = sink;
    };
    DebugSink.prototype.event = function event (time, value) {
        if (typeof this.infoOrSpy === 'string') {
            console.log(this.infoOrSpy + ':', value);
        }
        else if (typeof this.infoOrSpy === 'object') {
            if (typeof this.infoOrSpy.next === 'function') {
                this.infoOrSpy.next(value);
            }
        }
        this.sink.event(time, value);
    };
    DebugSink.prototype.error = function error (time, err) {
        if (typeof this.infoOrSpy === 'object') {
            if (typeof this.infoOrSpy.error === 'function') {
                this.infoOrSpy.error(err);
            }
        }
        this.sink.error(time, err);
    };
    DebugSink.prototype.end = function end (time, value) {
        if (typeof this.infoOrSpy === 'string') {
            console.log(this.infoOrSpy + ': ending');
        }
        else if (typeof this.infoOrSpy === 'object') {
            if (typeof this.infoOrSpy.complete === 'function') {
                this.infoOrSpy.complete(value);
            }
        }
        this.sink.end(time, value);
    };

    exports.debug = debug;
    exports.Debug = Debug;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=tempest-debug.js.map
