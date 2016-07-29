/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream } from '@tempest/core'
import { proxy } from '../src/index'

describe('@tempest/proxy', () => {
  it ('should create a circular dependency', (done) => {
    const { attach, stream } = proxy<number>()
    attach(Stream.of(1, 2, 3))

    const expected = [1, 2, 3]

    stream.subscribe((x: number) => {
      assert(x === expected.shift())
    }, done, () => done())
  })

  it ('should not start the stream until actively observed', (done) => {
    const { attach, stream } = proxy<number>()
    attach(Stream.of(1, 2, 3))

    const expected = [1, 2, 3]

    setTimeout(() => {
      stream.subscribe((x: number) => {
        assert(x === expected.shift())
      }, done, () => done())
    })
  })
})