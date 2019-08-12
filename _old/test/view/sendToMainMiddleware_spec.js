/* eslint-disable no-unused-expressions */

import Sinon from 'sinon'
import {expect} from 'chai'

import sendToMainMiddleware from '../../src/sendToMainMiddleware'

describe('sendToMainMiddleware', function () {
  it('passes the action to next by default', () => {
    const store = {}
    const next = Sinon.spy()
    const action = { type: 'SOME_ACTION' }

    sendToMainMiddleware(store)(next)(action)
    expect(next.callCount).to.equal(1)
    expect(next.calledWith(action)).to.be.true
  })
})
