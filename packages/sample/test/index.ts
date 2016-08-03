/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream, Sink, Scheduler, PropagateTask } from '@tempest/core'
import { sample } from '../src/index'

describe('@tempest/sample', function () {
  it ('should sample another streams values', function (done) {
    const sampler = new Stream<number>({
      run (sink: Sink<number>, scheduler: Scheduler) {
        scheduler.delay(100, PropagateTask.event(0, sink))
        scheduler.delay(250, PropagateTask.event(0, sink))
        scheduler.delay(260, PropagateTask.end(0, sink))
        return {
          dispose () {
            return void 0
          }
        }
      }
    })

    const stream = new Stream<number>({
      run (sink: Sink<number>, scheduler: Scheduler) {
        sink.event(scheduler.now(), 1)
        setTimeout(() => {
          sink.event(scheduler.now(), 2)
        }, 150)
        setTimeout(() => {
          sink.event(scheduler.now(), 3)
        }, 190)
        return {
          dispose () {
            return void 0
          }
        }
      }
    })

    const expected = [1, 3]

    sample(sampler, stream).subscribe((x: number) => {
      assert(x === expected.shift())
    }, done, (x) => {
      assert(x === 3)
      done()
    })
  })

  it ('should be curried', function (done) {
    const sampler = new Stream<number>({
      run (sink: Sink<number>, scheduler: Scheduler) {
        scheduler.delay(100, PropagateTask.event(0, sink))
        scheduler.delay(250, PropagateTask.event(0, sink))
        scheduler.delay(260, PropagateTask.end(0, sink))
        return {
          dispose () {
            return void 0
          }
        }
      }
    })

    const stream = new Stream<number>({
      run (sink: Sink<number>, scheduler: Scheduler) {
        sink.event(scheduler.now(), 1)
        setTimeout(() => {
          sink.event(scheduler.now(), 2)
        }, 150)
        setTimeout(() => {
          sink.event(scheduler.now(), 3)
        }, 190)
        return {
          dispose () {
            return void 0
          }
        }
      }
    })

    const expected = [1, 3]

    sample(sampler)(stream).subscribe((x: number) => {
      assert(x === expected.shift())
    }, done, (x) => {
      assert(x === 3)
      done()
    })
  })
})