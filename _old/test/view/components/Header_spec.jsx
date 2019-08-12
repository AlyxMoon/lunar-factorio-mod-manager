/* eslint-disable no-unused-expressions */

import React from 'react'
import {MemoryRouter} from 'react-router-dom'
import {
  renderIntoDocument,
  findRenderedDOMComponentWithClass,
  scryRenderedDOMComponentsWithTag,
  Simulate
} from 'react-addons-test-utils'
import Sinon from 'sinon'
import {fromJS} from 'immutable'
import {expect} from 'chai'

import {Header} from '../../../src/components/Header/Header'

describe('Components - Header', () => {
  it('renders without exploding', () => {
    const component = renderIntoDocument(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )
    expect(component).to.be.okay
  })

  it('renders list of navigation links', () => {
    const routes = fromJS([
      {
        name: 'home',
        pathname: '/'
      },
      {
        name: 'page1',
        pathname: '/page1'
      }
    ])
    const component = renderIntoDocument(
      <MemoryRouter>
        <Header routes={routes} />
      </MemoryRouter>
    )
    const links = scryRenderedDOMComponentsWithTag(component, 'a')
    expect(links.length).to.equal(2)
    expect(links[0].getAttribute('href')).to.equal('/')
    expect(links[0].text).to.equal('home')
    expect(links[1].getAttribute('href')).to.equal('/page1')
    expect(links[1].text).to.equal('page1')
  })

  it('invokes callback when "Start Factorio" button is pressed', () => {
    const callback = Sinon.spy()
    const component = renderIntoDocument(
      <MemoryRouter>
        <Header startFactorio={callback} />
      </MemoryRouter>
    )
    const button = findRenderedDOMComponentWithClass(component, 'startFactorio')
    Simulate.click(button)
    expect(callback.callCount).to.equal(1)
  })
})
