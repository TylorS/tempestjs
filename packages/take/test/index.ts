/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream } from '@tempest/core'
import { take } from '../src/index'

describe('@tempest/take', () => {
  it ('should take n events and end', (done) => {
    const stream = take(1, Stream.of(1, 2, 3))
    const expected = [1]

    stream.subscribe((x: number) => {
      assert(x === expected.shift())
    }, done, () => done())
  })

  it ('should be curried', (done) => {
    const first = take(1)
    const stream = first(Stream.of(1, 2, 3))
    const expected = [1]

    stream.subscribe((x: number) => {
      assert(x === expected.shift())
    }, done, () => done())
  })
})