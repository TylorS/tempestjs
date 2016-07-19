import { Source, Sink, Scheduler } from '../../src/index'

export interface SourceAssertions<T> {
  run?: (sink: Sink<T>, scheduler: Scheduler<any>) => any
  dispose?: () => any
}

export class FakeSource<T> implements Source<T> {
  constructor (private assertions?: SourceAssertions<T>) {}

  static create<T> (assertions?: SourceAssertions<T>) {
    return new FakeSource<T>(assertions)
  }

  run (sink: Sink<T>, scheduler: Scheduler<any>) {
    if (this.assertions && typeof this.assertions.run === 'function')
      this.assertions.run(sink, scheduler)

    const _dispose = this.assertions && typeof this.assertions.dispose === 'function'
      ? this.assertions.dispose
      : Function.prototype
    return {
      dispose () {
        _dispose()
      }
    }
  }
}