/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream } from '@tempest/core'
import { map } from '../src/index'

describe ('map', () => {
  it ('should map event values from T to R', (done) => {
    const stream = Stream.of(1)
    map((x: number) => x + 1, stream).subscribe((x: number) => {
      assert(x === 2)
    }, done, () => done())
  })
})