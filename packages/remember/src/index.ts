import { Stream, Source, Sink, Multicast } from '@tempest/core'

export function remember<T> (stream: Stream<T>) {
  return new MemoryStream<T>(stream.source)
}

export class MemoryStream<T> extends Stream<T> {
  public source: Memory<T>
  constructor (source: Source<T>) {
    super(source)
    this.source = new Memory<T>(source)
  }
}

export class Memory<T> extends Multicast<T> {
  private has: boolean = false
  private value: T = void 0
  constructor (source: Source<T>) {
    super(source)
  }

  _add (sink: Sink<T>) {
    if (this.has) {
      sink.event(Date.now(), this.value)
    }
    return super._add(sink)
  }

  event (time: number, value: T) {
    this.has = true
    this.value = value
    super.event(time, value)
  }
}
