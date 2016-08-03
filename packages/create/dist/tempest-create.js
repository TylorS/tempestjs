(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@tempest/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@tempest/core'], factory) :
    (factory((global.tempestCreate = global.tempestCreate || {}),global.tempestCore));
}(this, function (exports,_tempest_core) { 'use strict';

    function create(subscriber) {
        return new _tempest_core.Stream(new Create(subscriber));
    }
    var Create = function Create(_subscribe) {
        this._subscribe = _subscribe;
    };
    Create.prototype.run = function run (sink, scheduler) {
        var subscribe = this._subscribe;
        var observer = new SinkObserver(sink, scheduler);
        var dispose = Promise.resolve(observer).then(subscribe);
        return {
            dispose: function dispose$1() {
                dispose.then(function (f) {
                    if (typeof f === 'function')
                        f();
                });
            }
        };
    };
    var SinkObserver = function SinkObserver(sink, scheduler) {
        this.sink = sink;
        this.scheduler = scheduler;
    };
    SinkObserver.prototype.next = function next (value) {
        this.sink.event(this.scheduler.now(), value);
    };
    SinkObserver.prototype.error = function error (err) {
        this.sink.error(this.scheduler.now(), err);
    };
    SinkObserver.prototype.complete = function complete (value) {
        this.sink.end(this.scheduler.now(), value);
    };

    exports.create = create;
    exports.Create = Create;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=tempest-create.js.map
