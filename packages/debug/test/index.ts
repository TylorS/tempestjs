/// <reference path="../typings/index.d.ts" />

import * as assert from 'power-assert'
import { Stream } from '@tempest/core'
import { debug } from '../src/index'
import * as sinon from 'sinon'

describe('@tempest/debug', () => {
  it('should console.log events when given a string', (done) => {
    const sandbox = sinon.sandbox.create()
    sandbox.spy(console, 'log')

    const stream = debug('Stream', Stream.of(1))
    const expected = [1]

    stream.subscribe((x) => {
      assert(x === expected.shift())
    }, done, () => {
      sinon.assert.calledTwice(console.log as Sinon.SinonSpy)
      sandbox.restore()
      done()
    })
  })

  it('should call spy on indiviual event types when given DebugSubscriber', (done) => {
    const sandbox = sinon.sandbox.create()
    const spy = sandbox.spy()
    const disposeSpy = sandbox.spy()

    const stream = debug({
      next: spy,
      dispose: disposeSpy
    }, Stream.of(1))
    const expected = [1]

    const sub = stream.subscribe((x) => {
      assert(x === expected.shift())
    }, done, () => {
      sinon.assert.calledOnce(spy)
      sub.unsubscribe()
      setTimeout(() => {
        sinon.assert.calledOnce(disposeSpy)
        sandbox.restore()
        done()
      })
    })
  })

  it('should be curried', (done) => {
    const sandbox = sinon.sandbox.create()
    const spy = sandbox.spy()
    const disposeSpy = sandbox.spy()

    const debugSpy = debug<number>({
      next: spy,
      dispose: disposeSpy
    })
    const stream = debugSpy(Stream.of(1))
    const expected = [1]

    const sub = stream.subscribe((x) => {
      assert(x === expected.shift())
    }, done, () => {
      sinon.assert.calledOnce(spy)
      sub.unsubscribe()
      setTimeout(() => {
        sinon.assert.calledOnce(disposeSpy)
        sandbox.restore()
        done()
      })
    })
  })
})