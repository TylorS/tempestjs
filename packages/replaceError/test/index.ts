/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream, Sink, Scheduler, PropagateTask } from '@tempest/core'
import { replaceError } from '../src/index'

describe('@tempest/replaceError', () => {
  it ('should allow replacing a stream after an error', (done) => {
    const errorStream = new Stream<any>({
      run (sink: Sink<any>, scheduler: Scheduler) {
        const task = scheduler.asap(PropagateTask.error(new Error('oh no'), sink))
        return {
          dispose () {
            scheduler.cancel(task)
          }
        }
      }
    })

    const replace = (e: Error) => Stream.of(1)

    const stream = replaceError(replace, errorStream)

    stream.subscribe((x: number) => {
      assert(x === 1)
    }, done, () => done())
  })

  it ('should be curried', (done) => {
    const errorStream = new Stream<any>({
      run (sink: Sink<any>, scheduler: Scheduler) {
        const task = scheduler.asap(PropagateTask.error(new Error('oh no'), sink))
        return {
          dispose () {
            scheduler.cancel(task)
          }
        }
      }
    })

    const replace = (e: Error) => Stream.of(1)

    const replaceWith = replaceError(replace)
    const stream = replaceWith(errorStream)

    stream.subscribe((x: number) => {
      assert(x === 1)
    }, done, () => done())
  })
})