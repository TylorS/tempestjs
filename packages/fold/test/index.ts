/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream } from '@tempest/core'
import { fold } from '../src/index'

describe('@tempest/fold', () => {
  it ('should accumulate values over time', (done) => {
    const stream = fold((x, y) => x + y, 0, Stream.of(1, 1, 1))
    const expected = [0, 1, 2, 3]

    stream.subscribe((x) => {
      assert(x === expected.shift())
    }, done, () => done())
  })

  it ('should emit its seed value first', (done) => {
    const stream = fold((x, y) => x, 0, Stream.of())
    const expected = [0]

    stream.subscribe((x) => {
      assert(x === expected.shift())
    }, done, () => done())
  })

  it ('should be curried', (done) => {
    const add = fold<number, number>((x, y) => x + y, 0)
    const stream = add(Stream.of(1, 1, 1))
    const expected = [0, 1, 2, 3]

    stream.subscribe((x) => {
      assert(x === expected.shift())
    }, done, () => done())
  })
})