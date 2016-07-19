import { Source, Sink, Scheduler, Disposable, ScheduledTask } from '../interfaces'

import { append, remove, findIndex } from '../util/array'

import { MulticastDisposable } from './MulticastDisposable'

const EMPTY: Disposable<any> = { dispose (): void { return void 0 } }
const NONE: ScheduledTask = null

export class Multicast<T> implements Source<T>, Sink<T> {
  public source: Source<T>
  public _stopId: ScheduledTask
  protected sinks: Sink<T>[];
  protected disposable: Disposable<T>
  constructor (source: Source<T>) {
    this.source = source
    this.sinks = []
    this.disposable = EMPTY
    this._stopId = NONE
  }

    public run (sink: Sink<T>, scheduler: Scheduler<any>) {
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
    this.sinks = append(sink, this.sinks)
    return this.sinks.length
  }

  public _remove (sink: Sink<T>): number {
    const index = findIndex(sink, this.sinks)

    if (index >= 0) {
      this.sinks = remove(index, this.sinks)
    }

    return this.sinks.length
  }

  public event (time: number, value: T): void {
    const s = this.sinks
    if (s.length === 1) {
      return s[0].event(time, value)
    }
    for (let i = 0; i < s.length; ++i) {
      tryEvent(time, value, s[i])
    }
  }

  public end (time: number, value?: T): void {
    const s = this.sinks
    for (let i = 0; i < s.length; ++i) {
      tryEnd(time, value, s[i])
    }
  }

  public error (time: number, err: Error): void {
    const s = this.sinks
    for (let i = 0; i < s.length; ++i) {
      s[i].error(time, err)
    }
  }
}

function dispose<T> (disposable: Disposable<T>): void {
  disposable.dispose()
}

function tryEvent<T> (time: number, value: T, sink: Sink<T>): void {
  try {
    sink.event(time, value)
  } catch (e) {
    sink.error(time, e)
  }
}

function tryEnd<T> (time: number, value: T, sink: Sink<T>): void {
  try {
    sink.end(time, value)
  } catch (e) {
    sink.error(time, e)
  }
}