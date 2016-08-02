/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream } from '@tempest/core'
import { never } from '../src/index'

describe('@tempest/never', () => {
  it ('should create a stream that never emits', (done) => {
    const stream = never()
    assert(stream instanceof Stream)

    const subscription = stream.subscribe(done, done, done)

    setTimeout(() => {
      subscription.unsubscribe()
      done()
    }, 1000)
  })
})