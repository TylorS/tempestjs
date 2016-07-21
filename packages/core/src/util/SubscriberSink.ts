import { Sink } from '../interfaces'

export class SubscriberSink<T> implements Sink<T> {
  constructor (private _next: (x: T) => any,
               private _error: (e: Error) => any,
               private _complete: (x?: T) => any) {}

  static create<T> (next: (x: T) => any,
                    error: (e: Error) => any,
                    complete: (x?: T) => any) {
   return new SubscriberSink<T>(next, error, complete)
 }

  event (t: number, x: T) {
    const { _next } = this
    _next(x)
  }

  error (t: number, e: Error) {
    const { _error } = this
    _error(e)
  }

  end (t: number, x?: T) {
    const { _complete } = this
    _complete(x)
  }
}