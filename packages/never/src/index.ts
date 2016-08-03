import { Stream, Source, Sink, Disposable, Scheduler } from '@tempest/core'

export class Never implements Source<any> {
  run (sink: Sink<any>, scheduler: Scheduler): Disposable<any> {
    return {
      dispose () {
        return void 0
      }
    }
  }
}

const NEVER = new Stream<any>(new Never())

export function never (): Stream<any> {
  return NEVER
}