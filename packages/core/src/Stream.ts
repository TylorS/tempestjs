import $$observable from 'symbol-observable'

import { Subscribable, Subscriber, Source, Subscription } from './interfaces'

import { Multicast } from './multicast/Multicast'

import { isArrayLike } from './util/array'
import { BasicSubscription } from './util/BasicSubscription'
import { SubscriberSink } from './util/SubscriberSink'

import { FromArraySource } from './source/fromArray'
import { FromObservableSource } from './source/fromObservable'

export class Stream<T> implements Subscribable<T> {
  public source: Multicast<T>
  constructor (source: Source<T>) {
    this.source = new Multicast<T>(source)
  }

  static from<T> (input: Subscribable<T> | ArrayLike<T>): Stream<T> {
    if (typeof input[$$observable] === 'function') {
      return new Stream<T>(new FromObservableSource(input as Subscribable<T>))
    } else if (isArrayLike(input)) {
      return new Stream<T>(new FromArraySource(input as T[]))
    } else {
      throw new Error ('Stream can only be made from an Observable or ArrayLike object')
    }
  }

  static of<T> (...items: T[]): Stream<T> {
    return Stream.from<T>(items)
  }

  subscribe (nextOrSubscriber?: Subscriber<T> | ((x: T) => any),
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
      _next = nextOrSubscriber as (x: T) => any
      if (error && typeof error === 'function') _error = error
      if (complete && typeof complete === 'function') _complete = complete
    }

    return BasicSubscription.create<T>(this.source, SubscriberSink.create<T>(_next, _error, _complete))
  }

  [$$observable] () {
    return this
  }
}