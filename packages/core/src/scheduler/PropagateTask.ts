import { Task, Sink } from '../interfaces'
import { fatalError } from '../util/fatalError'

export type RunFn<T> = (time: number, value: T, sink: Sink<T>) => void

export class PropagateTask<T> implements Task {
  private _run: RunFn<T>
  private value: T
  private sink: Sink<T>
  private active: boolean
  constructor (run: RunFn<T>, value: T, sink: Sink<T>) {
    this._run = run
    this.value = value
    this.sink = sink
    this.active = true
  }

  static event<T> (value: T, sink: Sink<T>): PropagateTask<T> {
    return new PropagateTask<T>(event, value, sink)
  }

  static error<T> (err: Error, sink: Sink<any>): PropagateTask<Error> {
    return new PropagateTask<Error>(error, err, sink)
  }

  static end<T> (value: T, sink: Sink<T>): PropagateTask<T> {
    return new PropagateTask<T>(end, value, sink)
  }

  run (time: number): void {
    if (!this.active) return

    this._run(time, this.value, this.sink)
  }

  error (time: number, err: Error): void {
    if (!this.active) fatalError(err)
    this.active = false
    this.sink.error(time, err)
  }

  dispose (): void {
    this.active = false
  }
}

function event<T> (time: number, value: T, sink: Sink<T>): void {
  sink.event(time, value)
}

function error<T> (time: number, err: Error, sink: Sink<Error>): void {
  sink.error(time, err)
}

function end<T> (time: number, value: T, sink: Sink<T>): void {
  sink.end(time, value)
}