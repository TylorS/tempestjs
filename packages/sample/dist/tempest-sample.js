(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@tempest/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@tempest/core'], factory) :
    (factory((global.tempestSample = global.tempestSample || {}),global.tempestCore));
}(this, function (exports,_tempest_core) { 'use strict';

    var sample = function (sampler, stream) {
        switch (arguments.length) {
            case 1: return function (stream) { return new _tempest_core.Stream(new Sample(sampler.source, stream.source)); };
            case 2: return new _tempest_core.Stream(new Sample(sampler.source, stream.source));
            default: return sample;
        }
    };
    var Sample = function Sample(sampler, source) {
        this.sampler = sampler;
        this.source = source;
    };
    Sample.prototype.run = function run (sink, scheduler) {
        var sampleSink = new SampleSink(sink);
        var samplerDisposable = this.sampler.run(sampleSink, scheduler);
        var sourceDisposable = this.source.run(sampleSink.hold, scheduler);
        return new SampleDisposable(samplerDisposable, sourceDisposable);
    };
    var SampleSink = function SampleSink(sink) {
        this.sink = sink;
        this.hold = new SampleHold(this);
    };
    SampleSink.prototype.event = function event (time, value) {
        if (this.hold.hasValue) {
            this.sink.event(time, this.hold.value);
        }
    };
    SampleSink.prototype.error = function error (time, err) {
        this.sink.error(time, err);
    };
    SampleSink.prototype.end = function end (time, value) {
        this.sink.end(time, this.hold.value);
    };
    var SampleHold = function SampleHold(sink) {
        this.sink = sink;
        this.hasValue = false;
        this.value = void 0;
    };
    SampleHold.prototype.event = function event (time, value) {
        this.hasValue = true;
        this.value = value;
    };
    SampleHold.prototype.error = function error (time, err) {
        this.sink.error(time, err);
    };
    SampleHold.prototype.end = function end (time, value) {
        return void 0;
    };
    var SampleDisposable = function SampleDisposable(sampleDisposable, sourceDisposable) {
        this.sampleDisposable = sampleDisposable;
        this.sourceDisposable = sourceDisposable;
    };
    SampleDisposable.prototype.dispose = function dispose () {
        this.sampleDisposable.dispose();
        this.sourceDisposable.dispose();
    };

    exports.sample = sample;
    exports.Sample = Sample;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=tempest-sample.js.map
