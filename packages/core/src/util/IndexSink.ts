import { Sink } from '../interfaces'

export interface IndexedValue<T> {
  index: number,
  value: T
}

export class IndexSink<T> implements Sink<T> {
  private active: boolean = true
  private value: T = void 0
  constructor (private index: number, private sink: Sink<IndexedValue<T>>) {}

  event (time: number, value: T) {
    if (!this.active) return

    this.value = value
    this.sink.event(time, { index: this.index, value: this.value })
  }

  error (time: number, err: Error) {
    this.sink.error(time, err)
  }

  end (time: number, value?: T) {
    if (!this.active) return
    this.active = false
    this.sink.end(time, { index: this.index, value })
  }
}