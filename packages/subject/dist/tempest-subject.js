(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@tempest/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@tempest/core'], factory) :
    (factory((global.tempestSubject = global.tempestSubject || {}),global.tempestCore));
}(this, function (exports,_tempest_core) { 'use strict';

    /**
     * Takes a Stream and 'upgrades' it to a Subject
     *
     * @export
     * @template T
     * @param {Stream<T>} stream
     * @returns {Subject<T>}
     * @example
     * import { never } from '@tempest/never'
     * import { asSubject } from '@tempest/subject'
     *
     * const subject = asSubject(never())
     *
     * subject.subscribe(x => console.log(x)) // 1, 2, 3
     *
     * subject.next(1)
     * subject.next(2)
     * subject.next(3)
     * subject.complete()
     */
    function asSubject(stream) {
        return new Subject(stream.source);
    }
    var Subject = (function (Stream) {
        function Subject(source) {
            Stream.call(this, source);
        }

        if ( Stream ) Subject.__proto__ = Stream;
        Subject.prototype = Object.create( Stream && Stream.prototype );
        Subject.prototype.constructor = Subject;
        Subject.prototype.next = function next (value) {
            _tempest_core.defaultScheduler.asap(_tempest_core.PropagateTask.event(value, this.source));
        };
        Subject.prototype.error = function error (err) {
            _tempest_core.defaultScheduler.asap(_tempest_core.PropagateTask.error(err, this.source));
        };
        Subject.prototype.complete = function complete (value) {
            _tempest_core.defaultScheduler.asap(_tempest_core.PropagateTask.end(value, this.source));
        };

        return Subject;
    }(_tempest_core.Stream));

    exports.asSubject = asSubject;
    exports.Subject = Subject;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=tempest-subject.js.map
