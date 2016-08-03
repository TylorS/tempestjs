import { Source, Sink, Scheduler, Disposable, ScheduledTask } from '../interfaces'

import { addSink, removeSink, none } from './sink'

import { MulticastDisposable } from './MulticastDisposable'

const EMPTY: Disposable<any> = { dispose (): void { return void 0 } }
const NONE: ScheduledTask = null

export class Multicast<T> implements Source<T>, Sink<T> {
  public source: Source<T>
  public _stopId: ScheduledTask
  protected sink: Sink<T>;
  protected activeCount: number = 0
  protected disposable: Disposable<T>
  constructor (source: Source<T>) {
    this.source = source
    this.sink = none()
    this.disposable = EMPTY
    this._stopId = NONE
  }

  public run (sink: Sink<T>, scheduler: Scheduler) {
    const n = this._add(sink)

    if (n === 1) {
      if (this._stopId !== NONE) {
        scheduler.cancel(this._stopId)
        this._stopId = NONE
      }
      if (this.disposable === EMPTY) {
        this.disposable = this.source.run(this, scheduler)
      }
    }

    return new MulticastDisposable<T>(this, sink, scheduler)
  }

  public _dispose (): void {
    const disposable = this.disposable
    this.disposable = EMPTY
    this._stopId = NONE
    Promise.resolve(disposable).then(dispose)
  }

  public _add (sink: Sink<T>): number {
    this.sink = addSink(sink, this.sink)
    this.activeCount += 1
    return this.activeCount
  }

  public _remove (sink: Sink<T>): number {
    const s = this.sink
    this.sink = removeSink(sink, this.sink)

    if (s !== this.sink) {
      this.activeCount -= 1
    }

    return this.activeCount
  }

  public event (time: number, value: T): void {
    this.sink.event(time, value)
  }

  public end (time: number, value?: T): void {
    this.sink.end(time, value)
  }

  public error (time: number, err: Error): void {
   this.sink.error(time, err)
  }
}

function dispose<T> (disposable: Disposable<T>): void {
  disposable.dispose()
}
