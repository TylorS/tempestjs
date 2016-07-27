/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream } from '@tempest/core'
import { last } from '../src/index'

describe('@tempest/last', () => {
  it ('should only emit the last value of a stream', (done) => {
    const stream = last(Stream.from([1, 2, 3]))
    const expected = [3]
    stream.subscribe((value) => {
      assert(value === expected.shift())
    }, done, () => done())
  })
})