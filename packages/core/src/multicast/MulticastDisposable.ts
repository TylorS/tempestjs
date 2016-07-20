import { Disposable, Sink, Scheduler } from '../interfaces'

import { Multicast } from './Multicast'
import { MulticastTask } from './MulticastTask'

export class MulticastDisposable<T> implements Disposable<T> {
  private source: Multicast<T>
  private sink: Sink<T>
  private scheduler: Scheduler
  private disposed: boolean
  constructor (source: Multicast<T>, sink: Sink<T>, scheduler: Scheduler) {
    this.source = source
    this.sink = sink
    this.scheduler = scheduler
    this.disposed = false
  }

  dispose () {
    if (this.disposed) return
    this.disposed = true

    const source = this.source

   const remaining = source._remove(this.sink)
    if (remaining === 0) {
      const task = MulticastTask.create(() => source._dispose())
      source._stopId = this.scheduler.asap(task)
    }
  }
}