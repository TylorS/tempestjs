import { Stream, Source, Sink, Disposable, Scheduler, PropagateTask } from '@tempest/core'

export function periodic (period: number): Stream<number> {
  return new Stream<number>(new Periodic(period))
}

export class Periodic implements Source<number> {
  constructor (private period: number) {}

  run (sink: Sink<number>, scheduler: Scheduler): Disposable<number> {
    const task = new PropagateTask<number>(makeRun(-1), void 0, sink)
    const scheduledTask = scheduler.periodic(this.period, task)

    return {
      dispose () {
        scheduler.cancel(scheduledTask)
      }
    }
  }
}

function makeRun (i: number) {
  return function run (time: number, value: number, sink: Sink<number>) {
    sink.event(time, ++i)
  }
}
