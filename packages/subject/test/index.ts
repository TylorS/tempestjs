/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream, Sink, Scheduler } from '@tempest/core'
import { asSubject } from '../src/index'

describe('@tempest/subject', () => {
  describe('subject()', () => {
    it ('should create a Subject', (done) => {
      const s = asSubject(new Stream<number>({
        run (sink: Sink<number>, scheduler: Scheduler) {
          return {
            dispose () {
              return void 0
            }
          }
        }
      }))
      assert(s instanceof Stream)
      const expected = [1, 2, 3]

      s.subscribe((x) => {
        assert(x === expected.shift())
      }, done, () => done())

      s.next(1)
      s.next(2)
      s.next(3)
      s.complete()
    })
  })
})