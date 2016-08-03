import { Sink } from '../interfaces'
import { append, remove, findIndex } from '../util/array'

function tryEvent<T> (time: number, value: T, sink: Sink<T>): void {
  try {
    sink.event(time, value)
  } catch (e) {
    sink.error(time, e)
  }
}

function tryEnd<T> (time: number, value: T, sink: Sink<T>): void {
  try {
    sink.end(time, value)
  } catch (e) {
    sink.error(time, e)
  }
}

class None implements Sink<any> {
  event (t: number, x: any): void { return void 0 }
  end (t: number, x?: any): void { return void 0 }
  error (t: number, x: Error): void { return void 0 }
}

const NONE = new None()
export function none (): None {
  return NONE
}

function removeManyAt<T> (i: number, sinks: Sink<T>[]): Sink<T> {
  const updated = remove(i, sinks)
  // It's impossible to create a Many with 1 sink
  // so we can't end up with updated.length === 0 here
  return updated.length === 1 ? updated[0]
    : new Many(updated)
}

function removeMany<T> (sink: Sink<T>, many: Many<T>): Sink<T> {
  const { sinks } = many
  const i = findIndex(sink, sinks)
  return i < 0 ? many : removeManyAt(i, sinks)
}

export function addSink<T> (sink: Sink<T>, sinks: Sink<T>): Sink<T> {
  return sinks === NONE ? sink
    : sinks instanceof Many ? new Many(append(sink, sinks.sinks))
    : new Many([sinks, sink])
}

export function removeSink<T> (sink: Sink<T>, sinks: Sink<T>): Sink<T> {
  return sinks === NONE || sink === sinks ? NONE
    : sinks instanceof Many ? removeMany(sink, sinks)
    : sinks
}

class Many<T> implements Sink<T> {
  constructor (public sinks: Sink<T>[]) {}

  event (t: number, x: T): void {
    const s = this.sinks
    for (let i = 0; i < s.length; ++i) {
      tryEvent(t, x, s[i])
    }
  }

  end (t: number, x?: T): void {
    const s = this.sinks
    for (let i = 0; i < s.length; ++i) {
      tryEnd(t, x, s[i])
    }
  }

  error (t: number, x: Error): void {
    const s = this.sinks
    for (let i = 0; i < s.length; ++i) {
      s[i].error(t, x)
    }
  }
}