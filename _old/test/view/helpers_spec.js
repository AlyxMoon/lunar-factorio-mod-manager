/* eslint-disable no-unused-expressions */

import {expect} from 'chai'

import {isVersionHigher} from '../../src/helpers'

describe('client-side helpers', () => {
  describe('isVersionHigher()', () => {
    it('returns true when major is higher', () => {
      expect(isVersionHigher('1.0.0', '2.0.0')).to.be.true
    })

    it('returns true when minor is higher', () => {
      expect(isVersionHigher('1.1.0', '1.2.0')).to.be.true
    })

    it('returns true when patch is higher', () => {
      expect(isVersionHigher('1.0.0', '1.0.1')).to.be.true
    })

    it('returns false when both versions are the same', () => {
      expect(isVersionHigher('1.0.0', '1.0.0')).to.be.false
    })

    it('always returns false when major is smaller', () => {
      expect(isVersionHigher('2.0.0', '1.0.0')).to.be.false
      expect(isVersionHigher('2.0.0', '1.1.0')).to.be.false
      expect(isVersionHigher('2.0.0', '1.1.1')).to.be.false
    })

    it('returns false when major is same and minor is smaller', () => {
      expect(isVersionHigher('1.1.0', '1.0.0')).to.be.false
      expect(isVersionHigher('1.1.0', '1.0.1')).to.be.false
    })

    it('works fine without a patch number', () => {
      expect(isVersionHigher('0.14', '0.15')).to.be.true
      expect(isVersionHigher('0.14', '0.14')).to.be.false
    })
  })
})
