(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@tempest/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@tempest/core'], factory) :
    (factory((global.tempestProxy = global.tempestProxy || {}),global.tempestCore));
}(this, function (exports,_tempest_core) { 'use strict';

    /**
     * Create a proxy stream and a function to attach to a yet to exist stream
     * @example
     * import {proxy} from 'most-proxy'
     * const {attach, stream} = proxy()
     *
     * stream.map(f)
     *
     * attach(otherStream)
     */
    function proxy() {
        var source = new ProxySource();
        var stream = new _tempest_core.Stream(source);
        function attach(origin) {
            source.add(origin.source);
            return origin;
        }
        return { attach: attach, stream: stream };
    }
    var ProxySource = function ProxySource() {
        this.sink = void 0;
        this.active = false;
        this.source = void 0;
        this.disposable = void 0;
    };
    ProxySource.prototype.run = function run (sink, scheduler) {
        this.sink = sink;
        this.active = true;
        if (this.source !== void 0) {
            this.disposable = this.source.run(sink, scheduler);
        }
        return this;
    };
    ProxySource.prototype.dispose = function dispose () {
        this.active = false;
        this.disposable.dispose();
    };
    ProxySource.prototype.add = function add (source) {
        if (this.active) {
            this.source = source;
            this.disposable = source.run(this.sink, _tempest_core.defaultScheduler);
        }
        else if (!this.source) {
            this.source = source;
            return;
        }
        else {
            throw new Error('Can only attach to one stream');
        }
    };
    ProxySource.prototype.event = function event (t, x) {
        if (this.sink === void 0) {
            return;
        }
        this.ensureActive();
        this.sink.event(t, x);
    };
    ProxySource.prototype.end = function end (t, x) {
        this.propagateAndDisable(this.sink.end, t, x);
    };
    ProxySource.prototype.error = function error (t, e) {
        this.propagateAndDisable(this.sink.error, t, e);
    };
    ProxySource.prototype.propagateAndDisable = function propagateAndDisable (method, t, x) {
        if (this.sink === void 0) {
            return;
        }
        this.ensureActive();
        this.active = false;
        var sink = this.sink;
        this.sink = void 0;
        method.call(sink, t, x);
    };
    ProxySource.prototype.ensureActive = function ensureActive () {
        if (!this.active) {
            throw new Error('stream has already ended');
        }
    };

    exports.proxy = proxy;
    exports.ProxySource = ProxySource;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=tempest-proxy.js.map
