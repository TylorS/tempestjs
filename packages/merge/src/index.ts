import { Stream, Source, Sink, Disposable, Scheduler, IndexSink, IndexedValue } from '@tempest/core'

export function merge<T> (streams: Stream<T>[]): Stream<T> {
  return new Stream<T>(new Merge<T>(streams.map(getSource)))
}

function getSource<T> (stream: Stream<T>): Source<T> {
  return stream.source
}

export class Merge<T> implements Source<T> {
  constructor (private sources: Source<T>[]) {}

  run (sink: Sink<T>, scheduler: Scheduler): Disposable<T> {
    const length = this.sources.length
    const disposables: Disposable<T>[] = new Array(length)
    const sinks: Sink<T>[] = new Array(length)

    const mergeSink = new MergeSink<T>(disposables, sinks, sink)

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

class MergeSink<T> implements Sink<IndexedValue<T>> {
  private activeCount: number
  constructor (private disposables: Disposable<T>[],
               sinks: Sink<T>[],
               private sink: Sink<T>) {
    this.activeCount = sinks.length
  }

  event (time: number, value: IndexedValue<T>) {
    this.sink.event(time, value.value)
  }

  error (time: number, err: Error) {
    this.sink.error(time, err)
  }

  end (time: number, value?: IndexedValue<T>) {
    tryDispose(time, this.disposables[value.index], this.sink)
    if (--this.activeCount === 0) {
      this.sink.end(time, value.value)
    }
  }
}

function tryDispose<T> (time: number, disposable: Disposable<T>, sink: Sink<T>) {
  try {
    disposable.dispose()
  } catch (e) {
    sink.error(time, e)
  }
}