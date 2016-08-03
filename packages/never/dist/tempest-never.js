(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@tempest/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@tempest/core'], factory) :
    (factory((global.tempestNever = global.tempestNever || {}),global.tempestCore));
}(this, function (exports,_tempest_core) { 'use strict';

    var Never = function Never () {};

    Never.prototype.run = function run (sink, scheduler) {
        return {
            dispose: function dispose() {
                return void 0;
            }
        };
    };
    var NEVER = new _tempest_core.Stream(new Never());
    function never() {
        return NEVER;
    }

    exports.Never = Never;
    exports.never = never;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=tempest-never.js.map
