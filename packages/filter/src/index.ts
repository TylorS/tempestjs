import { Stream, Source, Sink, Scheduler, Disposable } from '@tempest/core'

export type PredicateFn<T> = (x: T) => boolean

export interface FilterCurried {
  <T>(): FilterCurried
  <T>(predicate: PredicateFn<T>): <T>(stream: Stream<T>) => Stream<T>
  <T>(predicate: PredicateFn<T>, stream: Stream<T>): Stream<T>
}

export const filter: FilterCurried = <FilterCurried> function <T>(predicate: PredicateFn<T>, stream: Stream<T>): Stream<T> |
  ((stream: Stream<T>) => Stream<T>) |
  ((predicate: PredicateFn<T>, stream: Stream<T>) => Stream<T>) {
  switch (arguments.length) {
    case 1: return function (stream: Stream<T>) { return new Stream<T>(new Filter<T>(predicate, stream.source)) }
    case 2: return new Stream<T>(new Filter<T>(predicate, stream.source))
    default: return filter
  }
}

class Filter<T> implements Source<T> {
  constructor (public predicate: PredicateFn<T>, public source: Source<T>) {}

  run (sink: Sink<T>, scheduler: Scheduler): Disposable<T> {
    return this.source.run(new FilterSink<T>(this.predicate, sink), scheduler)
  }
}

class FilterSink<T> implements Sink<T> {
  constructor (private predicate: PredicateFn<T>, private sink: Sink<T>) {}

  event (time: number, value: T) {
    if (this.predicate(value)) {
      this.sink.event(time, value)
    }
  }

  error (time: number, err: Error) {
    this.sink.error(time, err)
  }

  end (time: number, value?: T) {
    this.sink.end(time, value)
  }
}