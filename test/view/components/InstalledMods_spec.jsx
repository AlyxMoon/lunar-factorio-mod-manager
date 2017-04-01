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

import {InstalledMods} from '../../../src/components/InstalledMods/InstalledMods'

describe('Components - InstalledMods', () => {
  it('renders without exploding', () => {
    const component = renderIntoDocument(
      <MemoryRouter>
        <InstalledMods />
      </MemoryRouter>
    )
    expect(component).to.be.okay
  })

  it('renders the list of installed mods', () => {
    const installedMods = fromJS([
      { name: 'Mod1', version: '1.0.0' },
      { name: 'Mod2', version: '0.9.0' }
    ])
    const component = renderIntoDocument(
      <MemoryRouter>
        <InstalledMods installedMods={installedMods} />
      </MemoryRouter>
    )

    const modsList = scryRenderedDOMComponentsWithClass(component, 'installedModListEntry')
    const [mod1, mod2] = modsList.map(e => e.innerHTML)

    expect(modsList.length).to.equal(2)

    expect(mod1).to.contain('Mod1')
    expect(mod1).to.contain('1.0.0')

    expect(mod2).to.contain('Mod2')
    expect(mod2).to.contain('0.9.0')
  })

  it('invokes callback when setSelectedInstalledMod element is clicked', () => {
    const callback = Sinon.spy()
    const installedMods = fromJS([
      { name: 'Mod1', version: '1.0.0' },
      { name: 'Mod2', version: '0.9.0' }
    ])
    const component = renderIntoDocument(
      <MemoryRouter>
        <InstalledMods installedMods={installedMods} setSelectedInstalledMod={callback} />
      </MemoryRouter>
    )
    const buttons = scryRenderedDOMComponentsWithClass(component, 'setSelectedInstalledMod')

    Simulate.click(buttons[0])
    expect(callback.callCount).to.equal(1)
    expect(callback.calledWith(0)).to.be.true

    Simulate.click(buttons[1])
    expect(callback.callCount).to.equal(2)
    expect(callback.calledWith(1)).to.be.true
  })

  it('shows details on the selected installed mod', () => {
    const installedMods = fromJS([{
      name: 'Mod1',
      version: '1.0.0',
      factorio_version: '0.14',
      author: 'Some Guy',
      homepage: 'www.homepage.com',
      contact: 'contact@email.com',
      dependencies: ['Mod2', 'Base >= 0.14'],
      description: 'Some mod that does stuff'
    }])
    const component = renderIntoDocument(
      <MemoryRouter>
        <InstalledMods installedMods={installedMods} selectedInstalledMod={0} />
      </MemoryRouter>
    )

    expect(findRenderedDOMComponentWithClass(component, 'selectedInstalledModName').textContent).to.contain('Mod1')
    expect(findRenderedDOMComponentWithClass(component, 'selectedInstalledModVersion').textContent).to.contain('1.0.0')
    expect(findRenderedDOMComponentWithClass(component, 'selectedInstalledModFactorioVersion').textContent).to.contain('0.14')
    expect(findRenderedDOMComponentWithClass(component, 'selectedInstalledModAuthor').textContent).to.contain('Some Guy')
    expect(findRenderedDOMComponentWithClass(component, 'selectedInstalledModHomepage').textContent).to.contain('www.homepage.com')
    expect(findRenderedDOMComponentWithClass(component, 'selectedInstalledModContact').textContent).to.contain('contact@email.com')
    expect(findRenderedDOMComponentWithClass(component, 'selectedInstalledModDescription').textContent).to.contain('Some mod that does stuff')
    const dependencies = scryRenderedDOMComponentsWithClass(component, 'selectedInstalledModDependency')
    expect(dependencies[0].textContent).to.contain('Mod2')
    expect(dependencies[1].textContent).to.contain('Base >= 0.14')
  })

  it('invokes callback when deleteInstalledMod element is clicked', () => {
    const callback = Sinon.spy()
    const installedMods = fromJS([
      { name: 'Mod1', version: '1.0.0' },
      { name: 'Mod2', version: '0.9.0' }
    ])
    const component = renderIntoDocument(
      <MemoryRouter>
        <InstalledMods
          installedMods={installedMods}
          selectedInstalledMod={1}
          deleteInstalledMod={callback} />
      </MemoryRouter>
    )

    const button = findRenderedDOMComponentWithClass(component, 'deleteInstalledMod')

    Simulate.click(button)
    expect(callback.callCount).to.equal(1)
    expect(callback.calledWith(1)).to.be.true
  })
})
