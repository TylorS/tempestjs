import { Source, Sink, Scheduler } from '../interfaces'
import { PropagateTask } from '../scheduler/PropagateTask'

export class FromArraySource<T> implements Source<T> {
  constructor (private array: T[]) {}

  run (sink: Sink<T>, scheduler: Scheduler) {
    const task = scheduler.asap(new PropagateTask<T>(runArrayTask<T>(this.array, scheduler), void 0, sink))
    return { dispose: () => task.dispose() }
  }
}

function runArrayTask<T> (array: T[], scheduler: Scheduler) {
  return function arrayTask (time: number, value: T, sink: Sink<T>) {
    array.forEach((x: T) => sink.event(scheduler.now(), x))
    sink.end(scheduler.now(), void 0)
  }
}