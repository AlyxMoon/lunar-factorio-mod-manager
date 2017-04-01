/* eslint-disable no-unused-expressions */

import React from 'react'
import {MemoryRouter} from 'react-router-dom'
import {
  renderIntoDocument,
  scryRenderedDOMComponentsWithClass,
  findRenderedDOMComponentWithClass,
  Simulate
} from 'react-addons-test-utils'
import Sinon from 'sinon'
import {fromJS} from 'immutable'
import {expect} from 'chai'

import {OnlineMods} from '../../../src/components/OnlineMods/OnlineMods'

describe('Components - OnlineMods', () => {
  it('renders without exploding', () => {
    const component = renderIntoDocument(
      <MemoryRouter>
        <OnlineMods />
      </MemoryRouter>
    )
    expect(component).to.be.okay
  })

  it('renders the list of online mods', () => {
    const onlineMods = fromJS([
        { name: 'Mod1', releases: [{ version: '1.1.0' }, { version: '1.0.0' }] },
        { name: 'Mod2', releases: [{ version: '2.1.0' }, { version: '2.0.0' }] }
    ])
    const component = renderIntoDocument(
      <MemoryRouter>
        <OnlineMods onlineMods={onlineMods} />
      </MemoryRouter>
    )

    const modsList = scryRenderedDOMComponentsWithClass(component, 'onlineModListEntry')
    const [mod1, mod2] = modsList.map(e => e.innerHTML)

    expect(modsList.length).to.equal(2)

    expect(mod1).to.contain('Mod1')
    expect(mod1).to.contain('1.1.0')

    expect(mod2).to.contain('Mod2')
    expect(mod2).to.contain('2.1.0')
  })

  it('invokes callback when setSelectedOnlineMod element is clicked', () => {
    const callback = Sinon.spy()
    const onlineMods = fromJS([
        { name: 'Mod1', releases: [{ version: '1.1.0' }, { version: '1.0.0' }] },
        { name: 'Mod2', releases: [{ version: '2.1.0' }, { version: '2.0.0' }] }
    ])
    const component = renderIntoDocument(
      <MemoryRouter>
        <OnlineMods onlineMods={onlineMods} setSelectedOnlineMod={callback} />
      </MemoryRouter>
    )
    const buttons = scryRenderedDOMComponentsWithClass(component, 'setSelectedOnlineMod')

    Simulate.click(buttons[0])
    expect(callback.callCount).to.equal(1)
    expect(callback.calledWith(0, 0)).to.be.true

    Simulate.click(buttons[1])
    expect(callback.callCount).to.equal(2)
    expect(callback.calledWith(1, 0)).to.be.true
  })

  it('displays title of selected online mod', () => {
    const selectedOnlineMod = fromJS([0, 0])
    const onlineMods = fromJS([
        { name: 'Mod1', title: 'Mod 1', releases: [{ version: '1.1.0' }, { version: '1.0.0' }] },
        { name: 'Mod2', title: 'Mod 2', releases: [{ version: '2.1.0' }, { version: '2.0.0' }] }
    ])
    const component = renderIntoDocument(
      <MemoryRouter>
        <OnlineMods onlineMods={onlineMods} selectedOnlineMod={selectedOnlineMod} />
      </MemoryRouter>
    )

    const selectedModName = findRenderedDOMComponentWithClass(component, 'selectedOnlineModName')
    expect(selectedModName.textContent).to.contain('Mod 1')
  })

  it('invokes callback when downloadOnlineMod element is clicked', () => {
    const callback = Sinon.spy()
    const selectedOnlineMod = fromJS([0, 0])
    const onlineMods = fromJS([{
      name: 'Mod1',
      title: 'Mod 1',
      id: 42,
      releases: [{
        version: '1.1.0',
        download_url: '/api/downloads/blahblahblah.zip'
      }]
    }])
    const component = renderIntoDocument(
      <MemoryRouter>
        <OnlineMods
          onlineMods={onlineMods}
          selectedOnlineMod={selectedOnlineMod}
          requestDownload={callback} />
      </MemoryRouter>
    )

    const button = findRenderedDOMComponentWithClass(component, 'requestDownload')
    Simulate.click(button)

    expect(callback.callCount).to.equal(1)
    expect(callback.calledWith(42, '/api/downloads/blahblahblah.zip')).to.be.true
  })

  it('invokes callback when setOnlineModSort element is clicked', () => {
    const callback = Sinon.spy()
    const component = renderIntoDocument(
      <MemoryRouter>
        <OnlineMods setOnlineModSort={callback} />
      </MemoryRouter>
    )
    const buttons = scryRenderedDOMComponentsWithClass(component, 'setOnlineModSort')
    Simulate.click(buttons[0].children[0])
    expect(callback.callCount).to.equal(1)
  })

  it('invokes callback when setOnlineModFilter element is clicked', () => {
    const callback = Sinon.spy()
    const component = renderIntoDocument(
      <MemoryRouter>
        <OnlineMods setOnlineModFilter={callback} />
      </MemoryRouter>
    )
    const buttons = scryRenderedDOMComponentsWithClass(component, 'setOnlineModFilter')
    Simulate.click(buttons[0].children[0])
    expect(callback.callCount).to.equal(1)
  })
})
