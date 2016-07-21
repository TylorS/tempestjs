import { Source, Scheduler, Disposable, Sink } from './interfaces'
import { defaultScheduler } from './scheduler/defaultScheduler'

/**
 * 
 * 
 * @export
 * @template T
 * @param {(x: T) => any} f
 * @param {Source<T>} source
 * @returns
 */
export function withDefaultScheduler<T> (f: (x: T) => any, source: Source<T>) {
  return withScheduler<T>(f, source, defaultScheduler)
}

/**
 * 
 * 
 * @export
 * @template T
 * @param {(x: T) => any} f
 * @param {Source<T>} source
 * @param {Scheduler} scheduler
 * @returns {Promise<T>}
 */
export function withScheduler<T> (f: (x: T) => any, source: Source<T>, scheduler: Scheduler): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    runSource<T>(f, source, scheduler, resolve, reject)
  })
}

/**
 * 
 * 
 * @export
 * @template T
 * @param {(x: T) => any} f
 * @param {Source<T>} source
 * @param {Scheduler} scheduler
 * @param {(x?: T) => any} end
 * @param {(e: Error) => any} error
 */
export function runSource<T> (f: (x: T) => any, source: Source<T>, scheduler: Scheduler,
                              end: (x?: T) => any, error: (e: Error) => any) {
  const disposable = new SettableDisposable<T>()
  const observer = new Drain<T>(f, end, error, disposable)

  disposable.setDisposable(source.run(observer, scheduler))
}

class SettableDisposable<T> implements Disposable<T> {
  private disposable: Disposable<T>
  private disposed: boolean
  private _resolve: (x: Promise<T> | void) => any
  private _result: any
  /**
   * Creates an instance of SettableDisposable.
   * 
   */
  constructor () {
    this.disposable = void 0
    this.disposed = false
    this._resolve = void 0
    const self = this
    this._result = new Promise<Promise<T> | void>((resolve) => {
      self._resolve = resolve
    })
  }

  /**
   * 
   * 
   * @returns
   */
  dispose () {
    if (this.disposed) return this._result

    this.disposed = true

    if (this.disposable) {
      this._result = this.disposable.dispose()
    }

    return this._result
  }

  /**
   * 
   * 
   * @param {Disposable<T>} disposable
   */
  setDisposable (disposable: Disposable<T>) {
    if (this.disposable !== void 0) {
      throw new Error('Disposable can only be set one time')
    }
    this.disposable = disposable

    if (this.disposed) {
      this._resolve(disposable.dispose())
    }
  }
}

class Drain<T> implements Sink<T> {
  private active: boolean = true
  /**
   * Creates an instance of Drain.
   * 
   * @param {(x: T) => any} _event
   * @param {(x?: T) => any} _end
   * @param {(e: Error) => any} _error
   * @param {Disposable<T>} disposable
   */
  constructor (private _event: (x: T) => any,
               private _end: (x?: T) => any,
               private _error: (e: Error) => any,
               private disposable: Disposable<T>) {
  }

  /**
   * 
   * 
   * @param {number} time
   * @param {T} value
   */
  event (time: number, value: T) {
    if (!this.active) return
    this._event(value)
  }

  /**
   * 
   * 
   * @param {number} time
   * @param {Error} err
   */
  error (time: number, err: Error) {
    if (!this.active) return
    this.active = false
    disposeThen<any>(this._error, this._error, this.disposable, err)
  }

  /**
   * 
   * 
   * @param {number} time
   * @param {T} [value]
   */
  end (time: number, value?: T) {
    if (!this.active) return
    this.active = false
    disposeThen<T>(this._error, this._error, this.disposable, value)
  }
}

function disposeThen<T>(end: (x: any) => any, error: (x: any) => any, disposable: Disposable<T>, value: T) {
  Promise.resolve<any>(disposable.dispose()).then(() => {
    end(value)
  }, error)
}