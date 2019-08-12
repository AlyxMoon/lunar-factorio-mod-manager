/* eslint-disable no-unused-expressions */

import React from 'react'
import {MemoryRouter} from 'react-router-dom'
import {
  renderIntoDocument,
  findRenderedDOMComponentWithClass
} from 'react-addons-test-utils'
import {expect} from 'chai'

import {Footer} from '../../../src/components/Footer/Footer'

describe('Components - Footer', () => {
  it('renders without exploding', () => {
    const component = renderIntoDocument(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )
    expect(component).to.be.okay
  })

  it('shows correct login information with playerName provided', () => {
    const component = renderIntoDocument(
      <MemoryRouter>
        <Footer playerName='Alyx' />
      </MemoryRouter>
    )

    const playerName = findRenderedDOMComponentWithClass(component, 'playerName')
    expect(playerName.textContent).to.contain('Logged In')
    expect(playerName.title).to.contain('Alyx')
  })

  it('shows a progress indicator of mods being fetched', () => {
    const component = renderIntoDocument(
      <MemoryRouter>
        <Footer onlineModsFetchedCount={2} totalOnlineMods={10} />
      </MemoryRouter>
    )

    const modFetchStatus = findRenderedDOMComponentWithClass(component, 'modFetchStatus')
    expect(modFetchStatus.textContent).to.contain('20.00%')
  })
})
