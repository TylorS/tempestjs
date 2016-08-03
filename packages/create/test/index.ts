/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream } from '@tempest/core'
import { create } from '../src/index'

describe('@tempest/create', () => {
  it ('should create a new stream with a subscriber fn', (done) => {
    const stream: Stream<number> = create((observer) => {
      observer.next(1)
      observer.next(2)
      observer.next(3)
      observer.complete()
      return done
    })

    const expected = [1, 2, 3]

    const sub = stream.subscribe((x) => {
      assert(x === expected.shift())
    }, done, () => {
      assert(expected.length === 0)
      sub.unsubscribe()
    })
  })
})