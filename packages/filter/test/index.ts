/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream } from '@tempest/core'
import { filter } from '../src/index'

describe('@tempest/filter', () => {
  it ('should filter event values', (done) => {
    const predicate = (x: number) => x > 2
    const stream = filter(predicate, Stream.of(1, 2, 3))
    const expected = [3]

    stream.subscribe((x: number) => {
      assert(x === expected.shift())
    }, done, () => done())
  })

  it ('should be curried', (done) => {
    const predicate = (x: number) => x > 2
    const greaterThan2 = filter(predicate)
    const stream: Stream<number> = greaterThan2(Stream.of(1, 2, 3))
    const expected = [3]

    stream.subscribe((x: number) => {
      assert(x === expected.shift())
    }, done, () => done())
  })
})