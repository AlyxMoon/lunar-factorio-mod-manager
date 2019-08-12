/* eslint-disable no-unused-expressions */

import {expect} from 'chai'
import {Map, fromJS} from 'immutable'

import * as About from '../../src/about'

describe('client-side about', () => {
  describe('setAppCurrentVersion()', () => {
    it('sets the current version to the state', () => {
      const nextState = About.setAppCurrentVersion(Map(), '1.0.0')
      expect(nextState).to.equal(fromJS({
        appCurrentVersion: '1.0.0'
      }))
    })
  })

  describe('setAppLatestVersion()', () => {
    it('sets the current version to the state', () => {
      const nextState = About.setAppLatestVersion(Map(), '1.0.0')
      expect(nextState).to.equal(fromJS({
        appLatestVersion: '1.0.0'
      }))
    })
  })
})
