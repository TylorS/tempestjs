import { Sink } from '../interfaces'

export class IndexSink<T> implements Sink<T> {
  private active: boolean = true
  private value: T = void 0
  constructor (private index: number, private sink: Sink<T>) {}

  event (time: number, value: T) {
    if (!this.active) return

    this.value = value
    this.sink.event(time, this)
  }

  error (time: number, err: Error) {
    this.sink.error(err)
  }

  end (time: number, value?: T) {
    if (!this.active) return
    this.active = false
    this.sink.end(time, { index: this.index, value })
  }
}