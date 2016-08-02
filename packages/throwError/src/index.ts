import { Stream, Source, Sink, Disposable, Scheduler, PropagateTask } from '@tempest/core'

export function throwError (err: Error): Stream<Error> {
  return new Stream<Error>(new ThrowError(err))
}

export class ThrowError implements Source<Error> {
  constructor (private err: Error) {}

  run (sink: Sink<Error>, scheduler: Scheduler): Disposable<Error> {
    const task = scheduler.asap(PropagateTask.error(this.err, sink))

    return {
      dispose () {
        scheduler.cancel(task)
      }
    }
  }
}