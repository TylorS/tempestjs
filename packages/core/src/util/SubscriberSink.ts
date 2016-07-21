import { Sink } from '../interfaces'

/**
 * 
 * 
 * @export
 * @class SubscriberSink
 * @implements {Sink<T>}
 * @template T
 */
export class SubscriberSink<T> implements Sink<T> {
  /**
   * Creates an instance of SubscriberSink.
   * 
   * @param {(x: T) => any} _next
   * @param {(e: Error) => any} _error
   * @param {(x?: T) => any} _complete
   */
  constructor (private _next: (x: T) => any,
               private _error: (e: Error) => any,
               private _complete: (x?: T) => any) {}

  /**
   * 
   * 
   * @static
   * @template T
   * @param {(x: T) => any} next
   * @param {(e: Error) => any} error
   * @param {(x?: T) => any} complete
   * @returns
   */
  static create<T> (next: (x: T) => any,
                    error: (e: Error) => any,
                    complete: (x?: T) => any) {
   return new SubscriberSink<T>(next, error, complete)
 }

  /**
   * 
   * 
   * @param {number} t
   * @param {T} x
   */
  event (t: number, x: T) {
    const { _next } = this
    _next(x)
  }

  /**
   * 
   * 
   * @param {number} t
   * @param {Error} e
   */
  error (t: number, e: Error) {
    const { _error } = this
    _error(e)
  }

  /**
   * 
   * 
   * @param {number} t
   * @param {T} [x]
   */
  end (t: number, x?: T) {
    const { _complete } = this
    _complete(x)
  }
}