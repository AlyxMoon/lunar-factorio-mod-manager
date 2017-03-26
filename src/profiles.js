import {List, fromJS} from 'immutable'

export function setRoutes (state, routes) {
  return state.set('routes', fromJS(routes))
}

export function setActiveTab (state, tab) {
  return state.set('activeTab', tab)
}

export function setProfiles (state, profiles) {
  return state.set('profiles', fromJS(profiles))
}

export function setActiveProfile (state, activeProfile) {
  let profilesLength = state.get('profiles', List()).size

  activeProfile = activeProfile >= profilesLength ? profilesLength - 1 : activeProfile
  activeProfile = activeProfile < 0 ? 0 : activeProfile

  return state.set('activeProfile', activeProfile)
}

export function addProfile (state, name = 'New Profile') {
  return state.update(
    'profiles',
    List(),
    profiles => profiles.push(fromJS({ name: name }))
  )
}

export function renameProfile (state, index, name) {
  const profilesSize = state.get('profiles').size

  index = index < 0 ? profilesSize - index : index
  if (index < 0 || index >= profilesSize) return state

  return state.setIn(
    ['profiles', index, 'name'],
    name
  )
}

export function deleteProfile (state, index) {
  return state.update(
    'profiles',
    List(),
    profiles => profiles.delete(index)
  ).update(
    'activeProfile',
    0,
    activeProfile => activeProfile <= index && activeProfile !== 0 ? activeProfile - 1 : activeProfile
  )
}

export function moveProfileUp (state, index) {
  const [profile1, profile2] = state.get('profiles').slice(index - 1, index + 1)
  if (!profile1 || !profile2) return state

  let newActiveProfile = state.get('activeProfile', 0)
  if (newActiveProfile === index) newActiveProfile = index - 1
  else if (newActiveProfile === index - 1) newActiveProfile = index

  return state.update(
    'profiles',
    List(),
    profiles => profiles.splice(index - 1, 2, profile2, profile1)
  ).set('activeProfile', newActiveProfile)
}

export function moveProfileDown (state, index) {
  const [profile1, profile2] = state.get('profiles').slice(index, index + 2)
  if (!profile1 || !profile2) return state

  let newActiveProfile = state.get('activeProfile', 0)
  if (newActiveProfile === index) newActiveProfile = index + 1
  else if (newActiveProfile === index + 1) newActiveProfile = index

  return state.update(
    'profiles',
    List(),
    profiles => profiles.splice(index, 2, profile2, profile1)
  ).set('activeProfile', newActiveProfile)
}

export function toggleModStatus (state, profileIndex, modIndex) {
  if (!state.hasIn(['profiles', profileIndex, 'mods', modIndex])) return state

  return state.updateIn(
    ['profiles', profileIndex, 'mods', modIndex, 'enabled'],
    enabled => !enabled
  )
}
