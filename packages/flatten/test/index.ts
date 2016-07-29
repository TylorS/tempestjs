/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream, Sink, Scheduler, PropagateTask } from '@tempest/core'
import { flatten } from '../src/index'

describe('@tempest/flatten', () => {
  it ('should flatten a higher order stream into a single order stream', (done) => {
    const stream = Stream.of(1, 2, 3)
    const higherStream = new Stream<Stream<number>>({
      run (sink: Sink<Stream<number>>, scheduler: Scheduler) {
        const task = scheduler.asap(PropagateTask.event(stream, sink))
        const task2 = scheduler.asap(PropagateTask.end(void 0, sink))
        return {
          dispose () {
            scheduler.cancel(task)
            scheduler.cancel(task2)
          }
        }
      }
    })

    const s = flatten(higherStream)
    const expected = [1, 2, 3]

    s.subscribe((x) => {
      assert(x === expected.shift())
    }, done, () => done())
  })

  it('should continue an inner stream rather than restarting', (done) => {
    const innerStream = new Stream<number>({
      run(sink: Sink<number>, scheduler: Scheduler) {
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

    const outerStream = new Stream<Stream<number>>({
      run (sink: Sink<Stream<number>>, scheduler: Scheduler) {
        sink.event(scheduler.now(), innerStream)
        const id = setTimeout(() => {
          sink.event(scheduler.now(), innerStream)
        }, 110)

        return {
          dispose () {
            clearTimeout(id)
          }
        }
      }
    })

    const expected = [0, 1, 2, 3, 4, 5]

    flatten(outerStream).subscribe((x: number) => {
      assert(x === expected.shift())
      if (expected.length === 0) {
        done()
      }
    })
  })
})