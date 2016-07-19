import { Source, Scheduler, Disposable, Sink } from './interfaces'
import { defaultScheduler } from './scheduler/defaultScheduler'

export function withDefaultScheduler<T> (f: (x: T) => any, source: Source<T>) {
  return withScheduler<T>(f, source, defaultScheduler)
}

export function withScheduler<T> (f: (x: T) => any, source: Source<T>, scheduler: Scheduler<any>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    runSource<T>(f, source, scheduler, resolve, reject)
  })
}

export function runSource<T> (f: (x: T) => any, source: Source<T>, scheduler: Scheduler<any>,
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
  constructor () {
    this.disposable = void 0
    this.disposed = false
    this._resolve = void 0
    const self = this
    this._result = new Promise<Promise<T> | void>((resolve) => {
      self._resolve = resolve
    })
  }

  dispose () {
    if (this.disposed) return this._result

    this.disposed = true

    if (this.disposable) {
      this._result = this.disposable.dispose()
    }

    return this._result
  }

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
  constructor (private _event: (x: T) => any,
               private _end: (x?: T) => any,
               private _error: (e: Error) => any,
               private disposable: Disposable<T>) {
  }

  event (time: number, value: T) {
    if (!this.active) return
    this._event(value)
  }

  error (time: number, err: Error) {
    if (!this.active) return
    this.active = false
    disposeThen<any>(this._error, this._error, this.disposable, err)
  }

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