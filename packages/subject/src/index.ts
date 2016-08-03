import { Stream, Source, defaultScheduler, PropagateTask } from '@tempest/core'

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
export function asSubject<T> (stream: Stream<T>): Subject<T> {
  return new Subject<T>(stream.source)
}

export class Subject<T> extends Stream<T> {
  constructor (source: Source<T>) {
    super(source)
  }

  next (value: T) {
    defaultScheduler.asap(PropagateTask.event(value, this.source))
  }

  error (err: Error) {
    defaultScheduler.asap(PropagateTask.error(err, this.source))
  }

  complete (value?: T) {
    defaultScheduler.asap(PropagateTask.end(value, this.source))
  }
}