import { Stream, Source, Sink, Disposable, Scheduler } from '@tempest/core'

export interface SampleCurried {
  <T>(): (sampler: Stream<any>, stream: Stream<T>) => Stream<T>
  <T>(sampler: Stream<any>): <T>(stream: Stream<T>) => Stream<T>
  <T>(sampler: Stream<any>, stream: Stream<T>): Stream<T>
}

export const sample: SampleCurried = <SampleCurried> function <T>(sampler: Stream<any>, stream: Stream<T>): Stream<T> |
  ((stream: Stream<T>) => Stream<T>) | ((sampler: Stream<any>, stream: Stream<T>) => Stream<T>) {
  switch (arguments.length) {
    case 1: return function (stream: Stream<T>) { return new Stream<T>(new Sample<T>(sampler.source, stream.source)) }
    case 2: return new Stream<T>(new Sample<T>(sampler.source, stream.source))
    default: return sample
  }
}

export class Sample<T> implements Source<T> {
  constructor (private sampler: Source<any>, private source: Source<T>) {}

  run (sink: Sink<T>, scheduler: Scheduler): Disposable<T> {
    const sampleSink = new SampleSink<T>(sink)
    const samplerDisposable = this.sampler.run(sampleSink, scheduler)
    const sourceDisposable = this.source.run(sampleSink.hold, scheduler)
    return new SampleDisposable<T>(samplerDisposable, sourceDisposable)
 }
}

class SampleSink<T> implements Sink<T> {
  public hold: SampleHold<T>
  constructor (private sink: Sink<T>) {
    this.hold = new SampleHold<T>(this)
  }

  event (time: number, value: T) {
    if (this.hold.hasValue) {
      this.sink.event(time, this.hold.value)
    }
  }

  error (time: number, err: Error) {
    this.sink.error(time, err)
  }

  end (time: number, value?: T) {
    this.sink.end(time, this.hold.value)
  }
}

class SampleHold<T> implements Sink<T> {
  public hasValue: boolean = false
  public value: T = void 0
  constructor(private sink: Sink<T>) {}

  event (time: number, value: T): void {
    this.hasValue = true
    this.value = value
  }

  error (time: number, err: Error): void {
    this.sink.error(time, err)
  }

  end (time: number, value?: T): void {
    return void 0
  }
}

class SampleDisposable<T> implements Disposable<T> {
  constructor (private sampleDisposable: Disposable<T>, private sourceDisposable: Disposable<T>) {
  }

  dispose () {
    this.sampleDisposable.dispose()
    this.sourceDisposable.dispose()
  }
}