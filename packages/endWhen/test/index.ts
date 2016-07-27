/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream, Sink, Scheduler, PropagateTask } from '@tempest/core'
import { endWhen } from '../src/index'

describe('@tempest/endWhen', () => {
  it ('should end a stream when a signal emits', (done) => {
    const signal = new Stream<number>({
      run (sink: Sink<number>, scheduler: Scheduler) {
        const task = scheduler.delay(90, PropagateTask.event(100, sink))
        return {
          dispose () {
           scheduler.cancel(task)
          }
        }
      }
    })

    const source = new Stream<number>({
      run (sink: Sink<number>, scheduler: Scheduler) {
       const task = scheduler.periodic(50, PropagateTask.event(0, sink))

        return {
          dispose () {
            scheduler.cancel(task)
          }
        }
      }
    })

    const stream = endWhen(signal, source)
    const expected = [0, 0]

    stream.subscribe((x: number) => {
      assert(x === expected.shift())
    }, done, (y) => {
      assert(y === 100)
      done()
    })
  })
})