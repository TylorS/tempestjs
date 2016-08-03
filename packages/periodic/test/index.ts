/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream } from '@tempest/core'
import { periodic } from '../src/index'

describe('@tempest/periodic', () => {
  it ('should create a stream of incrementing numbers', (done) => {
    const stream: Stream<number> = periodic(100)
    const expected = [0, 1, 2, 3]

    const sub = stream.subscribe((x) => {
      assert(x === expected.shift())
      if (expected.length === 0) {
        sub.unsubscribe()
        done()
      }
    })
  })
})