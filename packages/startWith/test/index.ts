/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream } from '@tempest/core'
import { startWith } from '../src/index'

describe('@tempest/startWith', () => {
  it ('should start with a value an continue emittting as normal', (done) => {
    const stream = startWith(0, Stream.of(1, 2, 3))
    const expected = [0, 1, 2, 3]

    stream.subscribe({
      next: (x: number) => {
        assert(x === expected.shift())
      },
      error: done,
      complete: () => done()
    })
  })

  it ('should be curried', (done) => {
    const startWithZero = startWith(0)
    const stream = startWithZero(Stream.of(1, 2, 3))
    const expected = [0, 1, 2, 3]

    stream.subscribe({
      next: (x: number) => {
        assert(x === expected.shift())
      },
      error: done,
      complete: () => done()
    })
  })
})