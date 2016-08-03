/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream, Sink, Scheduler, PropagateTask } from '@tempest/core'
import { remember } from '../src/index'

describe('@tempest/remember', () => {
  it ('should remember the last value for a late subscriber', (done) => {
    const stream = new Stream<number>({
      run (sink: Sink<number>, scheduler: Scheduler) {
        let i = -1
        const interval = setInterval(() => {
          sink.event(scheduler.now(), ++i)
        }, 50)

        return {
          dispose () {
            clearInterval(interval)
          }
        }
      }
    })

    const rstream = remember(stream)

    stream.subscribe()
    setTimeout(() => {
      rstream.subscribe((x: number) => {
        assert(x === 1)
        done()
      })
    }, 80)
  })
})