/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import $$observable from 'symbol-observable'

import { UnicastStream, Subscribable, Scheduler, Sink } from '../src/index'

import { FakeSource } from './helpers/FakeSource'

describe('UnicastStream', () => {
  it ('should use a given source', () => {
    const fakeSouce = FakeSource.create()
    const stream = new UnicastStream(fakeSouce)
    assert(stream.source === fakeSouce)
  })

  it('should implement basic Observable interop', () => {
    assert(typeof UnicastStream.from === 'function')
    assert(typeof UnicastStream.of === 'function')
    assert(typeof UnicastStream.prototype.subscribe === 'function')
    assert(typeof UnicastStream.prototype[$$observable] === 'function')
  })

  it('should be a Subscribable', (done) => {
    const fakeSouce = FakeSource.create<number>()

    const s: Subscribable<number> = new UnicastStream<number>({
      run (sink: Sink<number>, scheduler: Scheduler<any>) {
        sink.event(scheduler.now(), 1)
        sink.end(scheduler.now(), 1)
        return fakeSouce.run(sink, scheduler)
      }
    })

    s.subscribe((x) => {
      assert(x === 1)
    }, done, () => done())
  })

  it('should give each listener its own source instance', (done) => {
    const s = UnicastStream.from([1, 2, 3])
    const expected1 = [1, 2, 3]
    const expected2 = [1, 2, 3]

    const sub1 = s.subscribe(
      (x) => { assert(x === expected1.shift()) },
      null,
      () => { sub1.unsubscribe() }
    )

    setTimeout(() => {
       const sub2 = s.subscribe((x) => {
        assert(x === expected2.shift())
      }, null, () => {
        sub2.unsubscribe()
        done()
      })
    }, 15)
  })
})