/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import $$observable from 'symbol-observable'

import { Stream, Sink, Scheduler, Subscribable } from '../src/index'
import { Multicast } from '../src/multicast/Multicast'

import { FakeSource } from './helpers/FakeSource'

describe('Stream', () => {
  it ('should use a given source wrapped in Multicast', () => {
    const fakeSource = FakeSource.create()
    const stream = new Stream(fakeSource)
    assert(stream.source instanceof Multicast)
    assert(stream.source.source === fakeSource)
  })

  it('should implement basic Observable interop', () => {
    assert(typeof Stream.from === 'function')
    assert(typeof Stream.of === 'function')
    assert(typeof Stream.prototype.subscribe === 'function')
    assert(typeof Stream.prototype[$$observable] === 'function')
  })

  it('should be a Subscribable', (done) => {
    const fakeSource = FakeSource.create<number>({
      run (sink: Sink<number>, scheduler: Scheduler) {
        sink.event(scheduler.now(), 1)
        sink.end(scheduler.now(), 1)
      }
    })

    const s: Subscribable<number> = new Stream<number>(fakeSource)

    s.subscribe((x) => {
      assert(x === 1)
   }, done, () => done())
  })

  it('should share with each listener the same source instance', (done) => {
    let finish: () => any
    const source = FakeSource.create({
      run (sink, scheduler) {
        let i = -1
        setInterval(() => {
          sink.event(scheduler.now(), ++i)
        }, 10)
        finish = () => sink.end(scheduler.now(), void 0)
      }
    })
    const s = new Stream(source)

    const expected1 = [0, 1, 2]
    const expected2 = [1, 2, 3]

    const sub1 = s.subscribe((x) => {
      assert(x === expected1.shift())
      if (expected1.length === 0 && sub1) {
        sub1.unsubscribe()
      }
    })

    setTimeout(() => {
      const sub2 = s.subscribe((x) => {
        assert(x === expected2.shift())
        if (expected2.length === 0) {
          finish()
        }
      }, null, () => {
        sub2.unsubscribe()
        done()
      })
    }, 15)
  })

  it ('should continue a source if a listener is removed then synchronously readded', (done) => {
    let finish: () => any
    const source = FakeSource.create({
      run (sink, scheduler) {
        let i = -1
        setInterval(() => {
          sink.event(scheduler.now(), ++i)
        }, 10)
        finish = () => sink.end(scheduler.now(), void 0)
      }
    })
    const s = new Stream(source)

    const expected1 = [0, 1, 2, 3]
    const expected2 = [4, 5, 6]

    const sub1 = s.subscribe((x) => {
      assert(x === expected1.shift())
      if (expected1.length === 0) finish()
    }, done, () => {
      sub1.unsubscribe()
      const sub2 = s.subscribe((x) => {
       assert(x === expected2.shift())
        if (expected2.length === 0) {
          finish()
        }
      }, null, () => {
        sub2.unsubscribe()
        done()
      })
    })
  })
})