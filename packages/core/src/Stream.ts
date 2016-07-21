import $$observable from 'symbol-observable'

import { Subscribable, Subscriber, Source, Subscription } from './interfaces'

import { Multicast } from './multicast/Multicast'

import { isArrayLike } from './util/array'
import { BasicSubscription } from './util/BasicSubscription'
import { SubscriberSink } from './util/SubscriberSink'

import { FromArraySource } from './source/fromArray'
import { FromObservableSource } from './source/fromObservable'

/**
 * 
 * 
 * @export
 * @class Stream
 * @implements {Subscribable<T>}
 * @template T
 */
export class Stream<T> implements Subscribable<T> {
  /**
   * 
   * 
   * @type {Multicast<T>}
   */
  public source: Multicast<T>
  /**
   * Creates an instance of Stream.
   * 
   * @param {Source<T>} source
   */
  constructor (source: Source<T>) {
    this.source = new Multicast<T>(source)
  }

  /**
   * 
   * 
   * @static
   * @template T
   * @param {(Subscribable<T> | ArrayLike<T>)} input
   * @returns {Stream<T>}
   */
  static from<T> (input: Subscribable<T> | ArrayLike<T>): Stream<T> {
    if (typeof input[$$observable] === 'function') {
      return new Stream<T>(new FromObservableSource(input as Subscribable<T>))
    } else if (isArrayLike(input)) {
      return new Stream<T>(new FromArraySource(input as T[]))
    } else {
      throw new Error ('Stream can only be made from an Observable or ArrayLike object')
    }
  }

  /**
   * 
   * 
   * @static
   * @template T
   * @param {...T[]} items
   * @returns {Stream<T>}
   */
  static of<T> (...items: T[]): Stream<T> {
    return Stream.from<T>(items)
  }

  /**
   * 
   * 
   * @param {((x: T) => any | Subscriber<T>)} [nextOrSubscriber]
   * @param {(e: Error) => any} [error]
   * @param {(x?: T) => any} [complete]
   * @returns {Subscription<T>}
   */
  subscribe (nextOrSubscriber?: (x: T) => any | Subscriber<T>,
             error?: (e: Error) => any,
             complete?: (x?: T) => any): Subscription<T> {
    let _next = Function.prototype as (x: T) => any
    let _error = Function.prototype as (e: Error) => any
    let _complete = Function.prototype as (x?: T) => any

    if (nextOrSubscriber !== null && typeof nextOrSubscriber === 'object') {
      const subscriber = nextOrSubscriber as any as Subscriber<T>
      const { next, error, complete } = subscriber
      if (next && typeof next === 'function') _next = next
      if (error && typeof error === 'function') _error = error
      if (complete && typeof complete === 'function') _complete = complete
    } else if (typeof nextOrSubscriber === 'function') {
      _next = nextOrSubscriber
      if (error && typeof error === 'function') _error = error
      if (complete && typeof complete === 'function') _complete = complete
    }

    return BasicSubscription.create<T>(this.source, SubscriberSink.create<T>(_next, _error, _complete))
  }

  /**
   * 
   * 
   * @returns
   */
  [$$observable] () {
    return this
  }
}