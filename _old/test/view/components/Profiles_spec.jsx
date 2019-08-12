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
import {fromJS} from 'immutable'
import {expect} from 'chai'

import {Profiles} from '../../../src/components/Profiles/Profiles'

describe('Components - Profiles', () => {
  it('renders without exploding', () => {
    const component = renderIntoDocument(
      <MemoryRouter>
        <Profiles />
      </MemoryRouter>
    )
    expect(component).to.be.okay
  })

  it('renders list of profiles', () => {
    const profiles = fromJS([
      { name: 'Profile1' }, { name: 'Profile2' }
    ])
    const component = renderIntoDocument(
      <MemoryRouter>
        <Profiles profiles={profiles} />
      </MemoryRouter>
    )
    const profileEntries = scryRenderedDOMComponentsWithClass(component, 'profileListEntry')
    const [profile1, profile2] = profileEntries.map(e => e.innerHTML)

    expect(profileEntries.length).to.equal(2)
    expect(profile1).to.contain('Profile1')
    expect(profile2).to.contain('Profile2')
  })

  it('renders correct amount of profile options (moveUp, moveDown, delete)', () => {
    const profiles = fromJS([
      { name: 'Profile1' }, { name: 'Profile2' }, { name: 'Profile3' }
    ])
    const component = renderIntoDocument(
      <MemoryRouter>
        <Profiles profiles={profiles} />
      </MemoryRouter>
    )
    const moveUp = scryRenderedDOMComponentsWithClass(component, 'moveProfileUp')
    const moveDown = scryRenderedDOMComponentsWithClass(component, 'moveProfileDown')
    const deleteProfile = scryRenderedDOMComponentsWithClass(component, 'deleteProfile')

    expect(moveUp.length, 'moveProfileUp has incorrect number').to.equal(2)
    expect(moveDown.length, 'moveProfileDown has incorrect number').to.equal(2)
    expect(deleteProfile.length, 'deleteProfile has incorrect number').to.equal(3)
  })

  it('invokes callback when addProfile is clicked', () => {
    const callback = Sinon.spy()
    const component = renderIntoDocument(
      <MemoryRouter>
        <Profiles addProfile={callback} />
      </MemoryRouter>
    )
    const button = findRenderedDOMComponentWithClass(component, 'addProfile')
    Simulate.click(button)
    expect(callback.callCount).to.equal(1)
  })

  it('invokes callback when renameProfile element is clicked', () => {
    const callback = Sinon.spy()
    const profiles = fromJS([
      { name: 'Profile1' }, { name: 'Profile2' }
    ])

    const component = renderIntoDocument(
      <MemoryRouter>
        <Profiles profiles={profiles} renameProfile={callback} />
      </MemoryRouter>
    )
    const textFields = scryRenderedDOMComponentsWithClass(component, 'renameProfile')

    Simulate.change(textFields[0], { target: { value: 'Renamed Profile1' } })
    expect(callback.callCount).to.equal(1)
    expect(callback.calledWith(0, 'Renamed Profile1')).to.be.true

    Simulate.change(textFields[1], { target: { value: 'Renamed Profile2' } })
    expect(callback.callCount).to.equal(2)
    expect(callback.calledWith(1, 'Renamed Profile2')).to.be.true
  })

  it('invokes callback when moveProfileUp elements are clicked', () => {
    const callback = Sinon.spy()
    const profiles = fromJS([
      { name: 'Profile1' }, { name: 'Profile2' }, { name: 'Profile3' }
    ])
    const component = renderIntoDocument(
      <MemoryRouter>
        <Profiles profiles={profiles} moveProfileUp={callback} />
      </MemoryRouter>
    )
    const buttons = scryRenderedDOMComponentsWithClass(component, 'moveProfileUp')

    Simulate.click(buttons[0])
    expect(callback.callCount).to.equal(1)
    expect(callback.calledWith(1)).to.be.true

    Simulate.click(buttons[1])
    expect(callback.callCount).to.equal(2)
    expect(callback.calledWith(2)).to.be.true
  })

  it('invokes callback when moveProfileDown elements are clicked', () => {
    const callback = Sinon.spy()
    const profiles = fromJS([
      { name: 'Profile1' }, { name: 'Profile2' }, { name: 'Profile3' }
    ])
    const component = renderIntoDocument(
      <MemoryRouter>
        <Profiles profiles={profiles} moveProfileDown={callback} />
      </MemoryRouter>
    )
    const buttons = scryRenderedDOMComponentsWithClass(component, 'moveProfileDown')

    Simulate.click(buttons[0])
    expect(callback.callCount).to.equal(1)
    expect(callback.calledWith(0)).to.be.true

    Simulate.click(buttons[1])
    expect(callback.callCount).to.equal(2)
    expect(callback.calledWith(1)).to.be.true
  })

  it('invokes callback when deleteProfile elements are clicked', () => {
    const callback = Sinon.spy()
    const profiles = fromJS([
      { name: 'Profile1' }, { name: 'Profile2' }, { name: 'Profile3' }
    ])
    const component = renderIntoDocument(
      <MemoryRouter>
        <Profiles profiles={profiles} deleteProfile={callback} />
      </MemoryRouter>
    )
    const buttons = scryRenderedDOMComponentsWithClass(component, 'deleteProfile')

    Simulate.click(buttons[0])
    expect(callback.callCount).to.equal(1)
    expect(callback.calledWith(0)).to.be.true

    Simulate.click(buttons[1])
    expect(callback.callCount).to.equal(2)
    expect(callback.calledWith(1)).to.be.true

    Simulate.click(buttons[2])
    expect(callback.callCount).to.equal(3)
    expect(callback.calledWith(2)).to.be.true
  })

  it('invokes callback when setActiveProfile elements are changed', () => {
    const callback = Sinon.spy()
    const profiles = fromJS([
      { name: 'Profile1' }, { name: 'Profile2' }
    ])
    const component = renderIntoDocument(
      <MemoryRouter>
        <Profiles profiles={profiles} setActiveProfile={callback} />
      </MemoryRouter>
    )
    const buttons = scryRenderedDOMComponentsWithClass(component, 'setActiveProfile')

    Simulate.change(buttons[0])
    expect(callback.callCount).to.equal(1)
    expect(callback.calledWith(0)).to.be.true

    Simulate.change(buttons[1])
    expect(callback.callCount).to.equal(2)
    expect(callback.calledWith(1)).to.be.true
  })

  it('shows name of active profile', () => {
    const profiles = fromJS([
      { name: 'Profile1' }, { name: 'Profile2' }
    ])
    const activeProfile = 0
    const component = renderIntoDocument(
      <MemoryRouter>
        <Profiles profiles={profiles} activeProfile={activeProfile} />
      </MemoryRouter>
    )
    const profileName = findRenderedDOMComponentWithClass(component, 'activeProfileName')
    expect(profileName.textContent).to.contain('Profile1')
  })

  it('shows list of mods in the active profile', () => {
    const profiles = fromJS([{
      name: 'Profile1',
      mods: [{ name: 'Mod1' }, { name: 'Mod2' }]
    }])
    const activeProfile = 0
    const component = renderIntoDocument(
      <MemoryRouter>
        <Profiles profiles={profiles} activeProfile={activeProfile} />
      </MemoryRouter>
    )
    const modEntries = scryRenderedDOMComponentsWithClass(component, 'activeProfileModListEntry')
    const [modEntry1, modEntry2] = modEntries.map(e => e.innerHTML)

    expect(modEntries.length).to.equal(2)
    expect(modEntry1).to.contain('Mod1')
    expect(modEntry2).to.contain('Mod2')
  })

  it('invokes callback when toggleModStatus elements are clicked', () => {
    const callback = Sinon.spy()
    const profiles = fromJS([{
      name: 'Profile1',
      mods: [{ name: 'Mod1', enabled: true }, { name: 'Mod2', enabled: true }]
    }])
    const activeProfile = 0
    const component = renderIntoDocument(
      <MemoryRouter>
        <Profiles profiles={profiles} activeProfile={activeProfile} toggleModStatus={callback} />
      </MemoryRouter>
    )
    const buttons = scryRenderedDOMComponentsWithClass(component, 'toggleModStatus')

    Simulate.click(buttons[0])
    expect(callback.callCount).to.equal(1)
    expect(callback.calledWith(0, 0)).to.be.true

    Simulate.click(buttons[1])
    expect(callback.callCount).to.equal(2)
    expect(callback.calledWith(0, 1)).to.be.true
  })
})
