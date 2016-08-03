import { Stream, Source, Sink, Scheduler, Disposable } from '@tempest/core'

export interface CurriedMap {
  <T, R>(): (f: (t: T) => R, stream: Stream<T>) => Stream<R>
  <T, R>(f: (t: T) => R): (stream: Stream<T>) => Stream<R>
  <T, R>(f: (t: T) => R, stream: Stream<T>): Stream<R>
}

export const map: CurriedMap = <CurriedMap> function <T, R>(f: (t: T) => R, stream: Stream<T>): Stream<R> | ((stream: Stream<T>) => Stream<R>) |
  ((f: (t: T) => R, stream: Stream<T>) => Stream<R>) {
  switch (arguments.length) {
    case 1: return function (stream: Stream<T>)  { return new Stream<R>(new Map<T, R>(f, stream.source)) }
    case 2: return new Stream<R>(new Map<T, R>(f, stream.source))
    default: return map
  }
}

export interface CurriedMapTo {
  <T, R>(): (value: R, stream: Stream<T>) => Stream<R>
  <T, R>(value: R): (stream: Stream<T>) => Stream<R>
  <T, R>(value: R, stream: Stream<T>): Stream<R>
}

export const mapTo: CurriedMapTo = <CurriedMapTo> function <T, R>(value: R, stream: Stream<T>): Stream<R> |
  ((stream: Stream<T>) => Stream<R>) | ((value: R, stream: Stream<T>) => Stream<R>) {
  switch (arguments.length) {
    case 1: return function (stream: Stream<T>) { return map(() => value, stream) }
    case 2: return map(() => value, stream)
    default: return mapTo
  }
}

export class Map<T, R> implements Source<R> {
  public f: (t: T) => R
  public source: Source<T>
  constructor (f: (t: T) => R, source: Source<T>) {
    this.f = f
    this.source = source
  }

  run (sink: Sink<R>, scheduler: Scheduler) {
    return this.source.run(new MapSink<T, R>(this.f, sink), scheduler) as any as Disposable<R>
 }
}

class MapSink<T, R> implements Sink<T> {
  private f: (t: T) => R
  private sink: Sink<R>
  constructor (f: (t: T) => R, sink: Sink<R>) {
    this.f = f
    this.sink = sink
  }

  event (time: number, value: T) {
    const f = this.f
    this.sink.event(time, f(value))
  }

  error (time: number, err: Error) {
    this.sink.error(time, err)
  }

  end (time: number, value?: T) {
    this.sink.end(time, value as any as R)
  }
}