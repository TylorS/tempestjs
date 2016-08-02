import { Stream, Source, Sink, Disposable, Scheduler, PropagateTask } from '@tempest/core'

export function empty (): Stream<void> {
  return new Stream<void>(new Empty())
}

export class Empty implements Source<void> {

  run (sink: Sink<void>, scheduler: Scheduler): Disposable<void> {
    const task = scheduler.asap(PropagateTask.end(void 0, sink))
    return {
      dispose () {
        scheduler.cancel(task)
      }
    }
  }
}