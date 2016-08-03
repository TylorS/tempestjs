/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream } from '@tempest/core'
import { combine } from '../src/index'

describe('@tempest/combine', () => {
  it('should combine multiple streams into an array of values', (done) => {
    const stream = combine<number, number, number>([
      Stream.of(1),
      Stream.of(1, 2, 3),
      Stream.of(4)
    ])

    const expected = [
      [1, 3, 4]
    ]

    stream.subscribe(([x, y, z]) => {
      const [a, b, c] = expected.shift()
      assert(x === a)
      assert(y === b)
      assert(z === c)
    }, done, () => done())
  })
})