import { Stream, Source, Sink, Disposable, Scheduler } from '@tempest/core'

export interface DebugSubscriber<T> {
  next?: (x: T) => any
  error?: (e: Error) => any
  complete?: (x?: T) => any
  dispose?: () => any
}

export interface CurriedDebug {
  <T>(): (infoOrSpy: string | DebugSubscriber<T>, stream: Stream<T>) => Stream<T>
  <T>(infoOrSpy: string | DebugSubscriber<T>): <T>(stream: Stream<T>) => Stream<T>
  <T>(infoOrSpy: string | DebugSubscriber<T>, stream: Stream<T>): Stream<T>
}

export const debug: CurriedDebug = <CurriedDebug> function (infoOrSpy: string | DebugSubscriber<any>, stream: Stream<any>):
  ((infoOrSpy: string | DebugSubscriber<any>, stream: Stream<any>) => Stream<any>) |
  ((stream: Stream<any>) => Stream<any>) |
  Stream<any>
{
  switch (arguments.length) {
    case 1: return function <T>(stream: Stream<T>): Stream<T> { return new Stream<any>(new Debug<any>(infoOrSpy, stream.source)) }
    case 2: return new Stream<any>(new Debug<any>(infoOrSpy, stream.source))
    default: return debug
  }
}

export class Debug<T> implements Source<T> {
  constructor (private infoOrSpy: string | DebugSubscriber<T>, private source: Source<T>) {}

  run (sink: Sink<T>, scheduler: Scheduler): Disposable<T> {
    if (typeof this.infoOrSpy === 'object') {
      if (typeof (this.infoOrSpy as DebugSubscriber<T>).dispose === 'function') {
        const disposeSpy = (this.infoOrSpy as DebugSubscriber<T>).dispose
        const disposable = this.source.run(new DebugSink<T>(this.infoOrSpy, sink), scheduler)
        return {
          dispose () {
            disposeSpy()
            return disposable.dispose()
          }
        }
      }
    } else {
      return this.source.run(new DebugSink<T>(this.infoOrSpy, sink), scheduler)
    }
  }
}

class DebugSink<T> implements Sink<T> {
  constructor (private infoOrSpy: string | DebugSubscriber<T>, private sink: Sink<T>) {}

  event (time: number, value: T) {
    if (typeof this.infoOrSpy === 'string') {
      console.log(this.infoOrSpy as string + ':', value)
    } else if (typeof this.infoOrSpy === 'object') {
      if (typeof (this.infoOrSpy as DebugSubscriber<T>).next === 'function') {
        (this.infoOrSpy as DebugSubscriber<T>).next(value)
      }
    }
    this.sink.event(time, value)
  }

  error (time: number, err: Error) {
    if (typeof this.infoOrSpy === 'object') {
      if (typeof (this.infoOrSpy as DebugSubscriber<T>).error === 'function') {
        (this.infoOrSpy as DebugSubscriber<T>).error(err)
      }
    }
    this.sink.error(time, err)
  }

  end (time: number, value?: T) {
    if (typeof this.infoOrSpy === 'string') {
      console.log(this.infoOrSpy as string + ': ending')
    } else if (typeof this.infoOrSpy === 'object') {
      if (typeof (this.infoOrSpy as DebugSubscriber<T>).complete === 'function') {
        (this.infoOrSpy as DebugSubscriber<T>).complete(value)
      }
    }
    this.sink.end(time, value)
  }
}