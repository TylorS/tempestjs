import { Source, Sink } from '../interfaces'
import { Multicast } from './Multicast'

export class Memory<T> extends Multicast<T> {
  private has: boolean
  private time: number
  private value: T
  constructor (source: Source<T>) {
    super(source)
    this.value = void 0
    this.time = -Infinity
    this.has = false
  }

  _dispose () {
    super._dispose()
    this.has = false
    this.value = void 0
    this.time = -Infinity
  }

  _add (sink: Sink<T>): number {
    if (this.has) {
      sink.event(this.time, this.value)
    }
    return super._add(sink)
  }

  event (time: number, value: T): void {
    this.has = true
    this.time = time
    this.value = value
    super.event(time, value)
  }
}