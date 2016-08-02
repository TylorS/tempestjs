/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream } from '@tempest/core'
import { throwError } from '../src/index'

describe('@tempest/throwError', () => {
  it ('should create an errored stream', (done) => {
    const err = new Error('error message')
    const stream = throwError(err)

    assert(stream instanceof Stream)

    stream.subscribe(done, (_err: Error) => {
      assert(_err === err)
      assert(_err.message === 'error message')
      done()
    })
  })
})