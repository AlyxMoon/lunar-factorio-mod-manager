/* eslint-disable no-unused-expressions */

import Sinon from 'sinon'
import {expect} from 'chai'

import openLinkMiddleware from '../../src/openLinkMiddleware'

describe('openLinkMiddlware', function () {
  it('passes the action to next by default', () => {
    const store = {}
    const next = Sinon.spy()
    const action = { type: 'SOME_ACTION' }

    openLinkMiddleware(store)(next)(action)
    expect(next.callCount).to.equal(1)
    expect(next.calledWith(action)).to.be.true
  })

  // Doesn't fully test at this time since I'm not sure how to stub the electron API
  it('calls shell.openExternal() and does not pass action with meta.isExternalLink', () => {
    const store = {}
    const next = Sinon.spy()
    const action = {
      meta: { isExternalLink: true },
      type: 'OPEN_EXTERNAL_LINK',
      link: 'www.website.com'
    }

    openLinkMiddleware(store)(next)(action)
    expect(next.callCount).to.equal(0)
  })
})
