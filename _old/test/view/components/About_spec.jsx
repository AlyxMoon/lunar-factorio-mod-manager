/* eslint-disable no-unused-expressions */

import React from 'react'
import {MemoryRouter} from 'react-router-dom'
import {
  renderIntoDocument,
  findRenderedDOMComponentWithClass,
  scryRenderedDOMComponentsWithClass,
  Simulate
} from 'react-addons-test-utils'
import Sinon from 'sinon'
import {expect} from 'chai'

import {About} from '../../../src/components/About/About'

describe('Components - About', () => {
  it('renders without exploding', () => {
    const component = renderIntoDocument(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    )
    expect(component).to.be.okay
  })

  it('renders current and latest app version', () => {
    const component = renderIntoDocument(
      <MemoryRouter>
        <About appCurrentVersion='1.0.0' appLatestVersion='2.0.0' />
      </MemoryRouter>
    )

    const appCurrentVersion = findRenderedDOMComponentWithClass(component, 'appCurrentVersion')
    const appLatestVersion = findRenderedDOMComponentWithClass(component, 'appLatestVersion')

    expect(appCurrentVersion.textContent).to.contain('1.0.0')
    expect(appLatestVersion.textContent).to.contain('2.0.0')
  })

  it('invokes callback when an external link is clicked', () => {
    const callback = Sinon.spy()
    const component = renderIntoDocument(
      <MemoryRouter>
        <About openExternalLink={callback} />
      </MemoryRouter>
    )
    const button = scryRenderedDOMComponentsWithClass(component, 'externalLink')[0]
    Simulate.click(button)
    expect(callback.callCount).to.equal(1)
  })
})
