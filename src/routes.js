import {Profiles} from './components/Profiles'
import {InstalledMods} from './components/InstalledMods'
import {OnlineMods} from './components/OnlineMods'
import {About} from './components/About'

export const routes = [
  {
    name: 'Profiles',
    pathname: '/',
    component: Profiles
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
