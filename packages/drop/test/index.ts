/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream } from '@tempest/core'
import { drop } from '../src/index'

describe('@tempest/drop', () => {
  it ('should drop first n events', (done) => {
    const stream = drop(1, Stream.of(1, 2, 3))
    const expected = [2, 3]

    stream.subscribe((x: number) => {
      assert(x === expected.shift())
    }, done, () => done())
  })
})