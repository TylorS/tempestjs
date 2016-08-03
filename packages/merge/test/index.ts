/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream } from '@tempest/core'
import { merge } from '../src/index'

describe('@tempest/merge', () => {
  it ('should merge multiple streams into 1', (done) => {
    const stream = merge([
      Stream.of(1),
      Stream.of(2),
      Stream.of(3)
    ])

    const expected = [1, 2, 3]

    stream.subscribe((x) => {
      assert(x === expected.shift())
    }, done, () => {
      assert(expected.length === 0)
      done()
    })
  })
})