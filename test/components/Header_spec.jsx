/* eslint-disable no-unused-expressions */

import React from 'react'
import {
  renderIntoDocument
} from 'react-addons-test-utils'
import {expect} from 'chai'

import {Header} from '../../src/components/Header'

describe('Components - Header', () => {
  it('renders without exploding', () => {
    const component = renderIntoDocument(<Header />)
    expect(component).to.be.okay
  })
})
