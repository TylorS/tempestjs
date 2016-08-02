/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream } from '@tempest/core'
import { fromPromise } from '../src/index'

describe('@tempest/fromPromise', () => {
  it ('should create a stream from a Promise', (done) => {
    const promise: Promise<number> = Promise.resolve<number>(123)
    const stream: Stream<number> = fromPromise(promise)

    const expected = [123]

    stream.subscribe((x: number) => {
      assert(x === expected.shift())
    }, done, () => done())
  })
})