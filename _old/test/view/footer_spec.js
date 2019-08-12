/* eslint-disable no-unused-expressions */

import {expect} from 'chai'
import {Map, fromJS} from 'immutable'

import * as Footer from '../../src/footer'

describe('client-side footer', () => {
  describe('setPlayerName()', () => {
    it('sets the player name to the state', () => {
      const nextState = Footer.setPlayerName(Map(), 'Alyx the Cool')
      expect(nextState).to.equal(fromJS({
        playerName: 'Alyx the Cool'
      }))
    })
  })

  describe('setOnlineModsFetchedCount()', () => {
    it('sets the online mods fetched to the state', () => {
      const nextState = Footer.setOnlineModsFetchedCount(Map(), 10)
      expect(nextState).to.equal(fromJS({
        onlineModsFetchedCount: 10
      }))
    })
  })

  describe('setOnlineModsCount()', () => {
    it('sets the online mods count to the state', () => {
      const nextState = Footer.setOnlineModsCount(Map(), 10)
      expect(nextState).to.equal(fromJS({
        onlineModsCount: 10
      }))
    })
  })

  describe('setFactorioVersion()', () => {
    it('sets the factorio version to the state', () => {
      const nextState = Footer.setFactorioVersion(Map(), '0.14.0')
      expect(nextState).to.equal(fromJS({
        factorioVersion: '0.14.0'
      }))
    })
  })
})
