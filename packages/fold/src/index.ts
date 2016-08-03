import { Stream, Source, Sink, Disposable, Scheduler, PropagateTask } from '@tempest/core'

export function fold<T, R> (f: (acc: R, val: T) => R, seed: R, stream: Stream<T>): Stream<R> {
  return new Stream<R>(new Fold<T, R>(f, seed, stream.source))
}

export class Fold<T, R> implements Source<R> {
  constructor (private f: (acc: R, value: T) => R, private seed: R, private source: Source<T>) {}

  run (sink: Sink<R>, scheduler: Scheduler): Disposable<any> {
    scheduler.asap(PropagateTask.event(this.seed, sink))
    return this.source.run(new FoldSink<T, R>(this.f, this.seed, sink), scheduler)
  }
}

class FoldSink<T, R> implements Sink<T> {
  constructor (private f: (acc: R, val: T) => R, private seed: R, private sink: Sink<R>) {}

  event (time: number, value: T) {
    const { f } = this
    this.seed = f(this.seed, value)
    this.sink.event(time, this.seed)
  }

  error (time: number, err: Error) {
    this.sink.error(time, err)
  }

  end (time: number, value?: T) {
    this.sink.end(time, this.seed)
  }
}