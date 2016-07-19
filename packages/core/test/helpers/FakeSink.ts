import { Sink } from '../../src/interfaces'

export interface SinkAssertions<T> {
  event?: (x: T) => any
  error?: (e: Error) => any
  end?: (x: T) => any
}

export class FakeSink<T> implements Sink<T> {
  constructor (private assertions?: SinkAssertions<T>) {}

  static create<T> (assertions?: SinkAssertions<T>) {
    return new FakeSink(assertions)
  }

  event (t: number, x: T) {
    if (this.assertions && typeof this.assertions.event === 'function')
      this.assertions.event(x)
  }

  error (t: number, e: Error) {
    if (this.assertions && typeof this.assertions.error === 'function')
      this.assertions.error(e)
  }

  end (t: number, x?: T) {
    if (this.assertions && typeof this.assertions.end === 'function')
      this.assertions.end(x)
  }
}