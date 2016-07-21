import { Task, Sink } from '../interfaces'
import { fatalError } from '../util/fatalError'

export type RunFn<T> = (time: number, value: T, sink: Sink<T>) => void

/**
 * 
 * 
 * @export
 * @class PropagateTask
 * @implements {Task}
 * @template T
 */
export class PropagateTask<T> implements Task {
  private _run: RunFn<T>
  private value: T
  private sink: Sink<T>
  private active: boolean
  /**
   * Creates an instance of PropagateTask.
   * 
   * @param {RunFn<T>} run
   * @param {T} value
   * @param {Sink<T>} sink
   */
  constructor (run: RunFn<T>, value: T, sink: Sink<T>) {
    this._run = run
    this.value = value
    this.sink = sink
    this.active = true
  }

  /**
   * 
   * 
   * @static
   * @template T
   * @param {T} value
   * @param {Sink<T>} sink
   * @returns {PropagateTask<T>}
   */
  static event<T> (value: T, sink: Sink<T>): PropagateTask<T> {
    return new PropagateTask<T>(event, value, sink)
  }

  /**
   * 
   * 
   * @static
   * @template T
   * @param {Error} err
   * @param {Sink<Error>} sink
   * @returns {PropagateTask<Error>}
   */
  static error<T> (err: Error, sink: Sink<Error>): PropagateTask<Error> {
    return new PropagateTask<Error>(error, err, sink)
  }

  /**
   * 
   * 
   * @static
   * @template T
   * @param {T} value
   * @param {Sink<T>} sink
   * @returns {PropagateTask<T>}
   */
  static end<T> (value: T, sink: Sink<T>): PropagateTask<T> {
    return new PropagateTask<T>(end, value, sink)
  }

  /**
   * 
   * 
   * @param {number} time
   */
  run (time: number): void {
    if (!this.active) return

    this._run(time, this.value, this.sink)
  }

  /**
   * 
   * 
   * @param {number} time
   * @param {Error} err
   */
  error (time: number, err: Error): void {
    if (!this.active) fatalError(err)
    this.active = false
    this.sink.error(time, err)
  }

  /**
   * 
   */
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