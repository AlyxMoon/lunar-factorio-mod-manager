/* eslint-disable no-unused-expressions */

import React from 'react'
import {MemoryRouter} from 'react-router-dom'
import {
  renderIntoDocument
} from 'react-addons-test-utils'
import {expect} from 'chai'

import {Settings} from '../../../src/components/Settings/Settings'

describe('Components - Settings', () => {
  it('renders without exploding', () => {
    const component = renderIntoDocument(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    )
    expect(component).to.be.okay
  })
})
