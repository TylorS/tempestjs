/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream } from '@tempest/core'
import { empty } from '../src/index'

describe('@tempest/empty', () => {
  it ('should create a stream that has already ended', (done) => {
    const stream: Stream<void> = empty()
    assert(stream instanceof Stream)

    stream.subscribe(done, done, () => done())
  })
})