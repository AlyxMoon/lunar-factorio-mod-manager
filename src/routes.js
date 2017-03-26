import {ProfilesContainer} from './components/Profiles/Profiles'
import {InstalledMods} from './components/InstalledMods/InstalledMods'
import {OnlineMods} from './components/OnlineMods/OnlineMods'
import {About} from './components/About/About'

export const routes = [
  {
    name: 'Profiles',
    pathname: '/',
    component: ProfilesContainer
  },
  {
    name: 'Installed Mods',
    pathname: '/installedMods',
    component: InstalledMods
  },
  {
    name: 'Online Mods',
    pathname: '/onlineMods',
    component: OnlineMods
  },
  {
    name: 'About',
    pathname: '/about',
    component: About
  }
]
