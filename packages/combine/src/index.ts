import { Stream, Source, Sink, Disposable, Scheduler, IndexSink, IndexedValue } from '@tempest/core'

export interface CombineInterface {
  <T1>(streams: [Stream<T1>]): Stream<[T1]>
  <T1, T2>(streams: [Stream<T1>, Stream<T2>]): Stream<[T1, T2]>
  <T1, T2, T3>(streams: [Stream<T1>, Stream<T2>, Stream<T3>]): Stream<[T1, T2, T3]>
  <T1, T2, T3, T4>(streams: [Stream<T1>, Stream<T2>, Stream<T3>, Stream<T4>]): Stream<[T1, T2, T3, T4]>
  <T1, T2, T3, T4, T5>(streams: [Stream<T1>, Stream<T2>, Stream<T3>, Stream<T4>, Stream<T5>]): Stream<[T1, T2, T3, T4, T5]>
  <T1, T2, T3, T4, T5, T6>(streams: [Stream<T1>, Stream<T2>, Stream<T3>, Stream<T4>, Stream<T5>, Stream<T6>]): Stream<[T1, T2, T3, T4, T5, T6]>
  <T1, T2, T3, T4, T5, T6, T7>(streams: [Stream<T1>, Stream<T2>, Stream<T3>, Stream<T4>, Stream<T5>, Stream<T6>, Stream<T7>]):
    Stream<[T1, T2, T3, T4, T5, T6, T7]>
  (streams: Stream<any>[]): Stream<any[]>
}

export const combine: CombineInterface = <CombineInterface> function (streams: Stream<any>[]) {
  return new Stream(new Combine(streams.map(getSource)))
}

function getSource<T> (stream: Stream<T>): Source<T> {
  return stream.source
}

export class Combine<T> implements Source<T[]> {
  constructor (private sources: Source<T>[]) {}

  run (sink: Sink<T[]>, scheduler: Scheduler) {
    const length = this.sources.length
    const disposables: Disposable<T>[] = new Array(length)
    const sinks: Sink<T>[] = new Array(length)

    const mergeSink = new CombineSink<T>(disposables, sinks, sink)

    let indexSink: IndexSink<T>
    for (let i = 0; i < length; ++i) {
      indexSink = sinks[i] = new IndexSink<T>(i, mergeSink)
      disposables[i] = this.sources[i].run(indexSink, scheduler)
    }

    return {
      dispose () {
        disposables.forEach((disposable: Disposable<T>) => {
          disposable.dispose()
        })
      }
    }
  }
}

class CombineSink<T> implements Sink<IndexedValue<T>> {
  private awaiting: number
  private values: T[]
  private hasValue: boolean[]
  private activeCount: number
  constructor (private disposables: Disposable<T>[],
               private sinks: Sink<T>[],
               private sink: Sink<T[]>) {
    const l = sinks.length
    this.awaiting = l
    this.values = new Array(l)
    this.hasValue = new Array(l)
    for (let i = 0; i < l; ++i) {
      this.hasValue[i] = false
    }
    this.activeCount = l
 }

  event (time: number, value: IndexedValue<T>) {
    const i = value.index
    const awaiting = this._updateReady(i)

    this.values[i] = value.value
    if (awaiting === 0) {
      this.sink.event(time, this.values)
    }
  }

  error (time: number, err: Error) {
    this.sink.error(time, err)
  }

  end (time: number, value?: IndexedValue<T>) {
    tryDispose(time, this.disposables[value.index], this.sink)
    if (--this.activeCount === 0) {
      this.sink.end(time, this.values)
    }
  }

  private _updateReady (i: number) {
    if (this.awaiting > 0) {
      if (!this.hasValue[i]) {
        this.hasValue[i] = true
        this.awaiting -= 1
      }
    }
    return this.awaiting
  }
}

function tryDispose<T> (time: number, disposable: Disposable<T>, sink: Sink<T[]>) {
  try {
    disposable.dispose()
  } catch (e) {
    sink.error(time, e)
  }
}