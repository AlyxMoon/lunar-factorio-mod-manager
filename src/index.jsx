import React from 'react'
import ReactDOM from 'react-dom'
import {createStore, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'

import reducer from './reducer'
import {
  setRoutes,
  setActiveTab,
  setProfiles,
  setActiveProfile,
  setInstalledMods,
  setSelectedInstalledMod,
  setAppCurrentVersion,
  setAppLatestVersion,
  setPlayerName,
  setOnlineMods,
  setSelectedOnlineMod,
  setOnlineModFilter,
  setOnlineModSort
} from './action_creators'

import {routes} from './routes.js'
import {AppContainer} from './components/App'
import openLinkMiddleware from './openLinkMiddleware'
import requestDownloadMiddleware from './requestDownloadMiddleware'

const {ipcRenderer} = require('electron')
ipcRenderer.on('ping', function (event, message) {
  console.log(message, arguments)
})

const createStoreWithMiddleware = applyMiddleware(
  requestDownloadMiddleware,
  openLinkMiddleware
)(createStore)
const store = createStoreWithMiddleware(reducer)

store.dispatch(setRoutes(routes))
store.dispatch(setActiveTab(routes[0].pathname))

// Placeholder data until app is hooked up fully
const activeProfile = 0
const profiles = [
  {
    name: 'Profile1',
    mods: [{ name: 'Mod1', enabled: true }, { name: 'Mod2', enabled: true }]
  },
  {
    name: 'Profile2',
    mods: [{ name: 'Mod3', enabled: false }, { name: 'Mod4', enabled: false }]
  },
  {
    name: 'Profile3',
    mods: [{ name: 'Mod5', enabled: true }, { name: 'Mod6', enabled: false }]
  }
]

const selectedInstalledMod = 0
const installedMods = [
  {
    name: 'Mod1',
    version: '1.0.0',
    factorio_version: '0.14',
    author: 'Placeholder author',
    contact: 'somecontact@email.com',
    homepage: 'www.definitelyarealhomepage.com',
    dependencies: ['base >= 0.14.0', 'Mod2'],
    description: 'This mod does stuff'
  },
  {
    name: 'Mod2',
    version: '0.9.0',
    dependencies: 'Just one dependency'
  }
]

const onlineModFilter = 'all'
const onlineModSort = ['name', 'ascending']
const selectedOnlineMod = [0, 0]
const onlineMods = [
  {
    title: '0.15 like infinite research',
    homepage: 'http://example.com',
    downloads_count: 7074,
    name: '015_like_infinite_research',
    created_at: '2016-11-11 07:07:22.467400+00:00',
    github_path: '',
    game_versions: [
      '0.13'
    ],
    description_html: "<p>this mod add (almost) infinite research like planned in 0.15. see friday fact #161.<br> this mod add tech for upgrading robots, turrets, weapons and researching speed for tier 20.</p> <p>maybe bug or don't well working features:<br> ・turret firerate upgrading may not well work at greater tier 10.<br> ・rotate turret is slow at both turret, <br> and game mechanics can't supplying enough electric power to full upgraded laser turret.<br> ・this text is written at broken english.</p>",
    tags: [
      {
        id: 16,
        name: 'weapons',
        title: 'Weapons',
        description: '',
        type: 't'
      }
    ],
    updated_at: '2016-11-11 07:07:23.023019+00:00',
    ratings_count: 0,
    description: "this mod add (almost) infinite research like planned in 0.15. see friday fact #161. this mod add tech for upgrading robots, turrets, weapons and researching speed for tier 20. maybe bug or don't well working features: ・turret firerate upgrading may not well work at greater tier 10. ・rotate turret is slow at both turret, and game mechanics can't supplying enough electric power to full upgraded laser turret. ・this text is written at broken english.",
    license_flags: 599,
    id: 868,
    media_files: [
      {
        id: 2411,
        width: 851,
        height: 705,
        size: 595550,
        urls: {
          original: 'https://mods-data.factorio.com/pub_data/media_files/xSjXvJ6l8aS5.png',
          thumb: 'https://mods-data.factorio.com/pub_data/media_files/xSjXvJ6l8aS5.thumb.png'
        }
      }
    ],
    releases: [
      {
        id: 3436,
        version: '0.1.0',
        game_version: '0.13',
        released_at: '2016-11-11T07:07:22.473664Z',
        download_url: '/api/downloads/data/mods/868/015_like_infinite_research_0.1.0.zip',
        info_json: {
          author: 'marshkip',
          dependencies: [
            'base >= 0.14.0'
          ],
          factorio_version: '0.14',
          version: '0.1.0',
          description: 'add (almost) infinite research like planned in 0.15. see friday fact #161. this mod add infinite research for upgrading robots, turrets, weapons and researching speed.',
          title: '0.15 like infinite research',
          contact: 'http://example.com',
          homepage: 'http://example.com',
          name: '015_like_infinite_research'
        },
        file_name: '015_like_infinite_research_0.1.0.zip',
        file_size: 2535,
        downloads_count: 7074,
        factorio_version: '0.14'
      }
    ],
    license_name: 'MIT',
    current_user_rating: null,
    summary: 'add (almost) infinite research like planned in 0.15. see friday fact #161. this mod add infinite research for upgrading robots, turrets, weapons and researching speed.',
    owner: 'marshkip',
    license_url: 'https://opensource.org/licenses/MIT'
  },
  {
    license_url: 'http://unlicense.org/',
    license_flags: 535,
    description: 'filler because the description was too bloody long',
    media_files: [
      {
        id: 3019,
        width: 306,
        height: 423,
        size: 30449,
        urls: {
          original: 'https://mods-data.factorio.com/pub_data/media_files/hb2MoZUvlD1b.jpg',
          thumb: 'https://mods-data.factorio.com/pub_data/media_files/hb2MoZUvlD1b.thumb.png'
        }
      }
    ],
    releases: [
      {
        id: 4882,
        version: '1.0.7',
        game_version: '0.13',
        released_at: '2017-03-16T23:50:38.743660Z',
        download_url: '/api/downloads/data/mods/1106/10xHarder_1.0.7.zip',
        info_json: {
          contributors: 'me',
          description: 'Makes the game 10x harder and more. ',
          factorio_version: '0.14',
          dependencies: [
            'base >= 0.14.0',
            '? ScienceCostTweaker >= 0.14.0'
          ],
          author: 'Wells',
          name: '10xHarder',
          homepage: 'None',
          version: '1.0.7',
          title: '10x Harder'
        },
        file_name: '10xHarder_1.0.7.zip',
        file_size: 374157,
        downloads_count: 88,
        factorio_version: '0.14'
      },
      {
        id: 4711,
        version: '1.0.6',
        game_version: '0.13',
        released_at: '2017-03-03T08:50:44.075116Z',
        download_url: '/api/downloads/data/mods/1106/10xHarder_1.0.6.zip',
        info_json: {
          title: '10x Harder',
          contributors: 'me',
          description: 'Makes the game 10x harder and more. ',
          factorio_version: '0.14',
          dependencies: [
            'base >= 0.14.0',
            '? ScienceCostTweaker >= 0.14.0'
          ],
          author: 'Wells',
          version: '1.0.6',
          homepage: 'None',
          name: '10xHarder'
        },
        file_name: '10xHarder_1.0.6.zip',
        file_size: 374142,
        downloads_count: 108,
        factorio_version: '0.14'
      },
      {
        id: 4601,
        version: '1.0.5',
        game_version: '0.13',
        released_at: '2017-02-22T10:08:24.718038Z',
        download_url: '/api/downloads/data/mods/1106/10xHarder_1.0.5.zip',
        info_json: {
          dependencies: [
            'base >= 0.14.0',
            '? ScienceCostTweaker >= 0.14.0'
          ],
          contributors: 'me',
          description: 'Makes the game 10x harder and more. ',
          factorio_version: '0.14',
          version: '1.0.5',
          author: 'Wells',
          name: '10xHarder',
          homepage: 'None',
          title: '10x Harder'
        },
        file_name: '10xHarder_1.0.5.zip',
        file_size: 374072,
        downloads_count: 83,
        factorio_version: '0.14'
      },
      {
        id: 4578,
        version: '1.0.4',
        game_version: '0.13',
        released_at: '2017-02-20T23:15:03.557798Z',
        download_url: '/api/downloads/data/mods/1106/10xHarder_1.0.4.zip',
        info_json: {
          title: '10x Harder',
          contributors: 'me',
          description: 'Makes the game 10x harder and more. ',
          version: '1.0.4',
          dependencies: [
            'base >= 0.14.0'
          ],
          author: 'Wells',
          factorio_version: '0.14',
          homepage: 'None',
          name: '10xHarder'
        },
        file_name: '10xHarder_1.0.4.zip',
        file_size: 20469,
        downloads_count: 11,
        factorio_version: '0.14'
      },
      {
        id: 4570,
        version: '1.0.3',
        game_version: '0.13',
        released_at: '2017-02-20T07:09:02.520735Z',
        download_url: '/api/downloads/data/mods/1106/10xHarder_1.0.3.zip',
        info_json: {
          contributors: 'me',
          description: 'Makes the game 10x harder and more. ',
          version: '1.0.3',
          dependencies: [
            'base >= 0.14.0'
          ],
          factorio_version: '0.14',
          author: 'Wells',
          name: '10xHarder',
          homepage: 'None',
          title: '10x Harder'
        },
        file_name: '10xHarder_1.0.3.zip',
        file_size: 20471,
        downloads_count: 9,
        factorio_version: '0.14'
      },
      {
        id: 4534,
        version: '1.0.2',
        game_version: '0.13',
        released_at: '2017-02-18T10:57:44.571463Z',
        download_url: '/api/downloads/data/mods/1106/10xHarder_1.0.2.zip',
        info_json: {
          contributors: 'me',
          description: 'Makes most of the final products require 10x more resources. (or adjust to whatever you want)',
          factorio_version: '0.14',
          dependencies: [
            'base >= 0.14.0'
          ],
          author: 'Wells',
          title: '10x Harder',
          homepage: 'None',
          version: '1.0.2',
          name: '10xHarder'
        },
        file_name: '10xHarder_1.0.2.zip',
        file_size: 7069,
        downloads_count: 16,
        factorio_version: '0.14'
      },
      {
        id: 4532,
        version: '1.0.1',
        game_version: '0.13',
        released_at: '2017-02-18T07:14:01.785270Z',
        download_url: '/api/downloads/data/mods/1106/10xHarder_1.0.1.zip',
        info_json: {
          contributors: 'me',
          description: 'Makes most of the final products require 10x more resources.',
          factorio_version: '0.14',
          dependencies: [
            'base >= 0.14.0'
          ],
          author: 'Wells',
          name: '10xHarder',
          homepage: 'None',
          version: '1.0.1',
          title: '10x Harder'
        },
        file_name: '10xHarder_1.0.1.zip',
        file_size: 6634,
        downloads_count: 4,
        factorio_version: '0.14'
      },
      {
        id: 4463,
        version: '1.0.0',
        game_version: '0.13',
        released_at: '2017-02-12T03:52:53.647617Z',
        download_url: '/api/downloads/data/mods/1106/10xHarder_1.0.0.zip',
        info_json: {
          contributors: 'me',
          description: 'Makes most of the final products require 10x more resources. Made for Bobs + Angels',
          factorio_version: '0.14',
          dependencies: [
            'base >= 0.14.0',
            'angelsrefining >= 0.6.5',
            'angelsaddons-oresilos >= 0.2.2',
            'angelspetrochem >= 0.4.1',
            'angelsaddons-pressuretanks >= 0.1.1',
            'angelsaddons-warehouses >= 0.1.3',
            'angelscomponents >= 0.1.0',
            'angelslogistics >= 0.1.1',
            'bobassembly >= 0.14.0',
            'bobconfig >= 0.14.0',
            'bobelectronics >= 0.14.0',
            'bobgreenhouse >= 0.14.0',
            'boblibrary >= 0.14.3',
            'bobplates >= 0.14.0',
            'boblogistics >= 0.14.5',
            'bobmining >= 0.14.0',
            'bobpower >= 0.14.0',
            'bobwarfare >= 0.14.2'
          ],
          author: 'Wells',
          title: '10x Harder',
          homepage: 'None',
          version: '1.0.0',
          name: '10xHarder'
        },
        file_name: '10xHarder_1.0.0.zip',
        file_size: 49293,
        downloads_count: 44,
        factorio_version: '0.14'
      }
    ],
    github_path: '',
    game_versions: [
      '0.13'
    ],
    name: '10xHarder',
    license_name: 'The Unlicense (Public Domain)',
    id: 1106,
    description_html: '<p>Filler because the description was too bloody long</p>',
    created_at: '2017-02-12 03:52:53.639761+00:00',
    downloads_count: 363,
    owner: 'withers',
    homepage: 'None',
    tags: [
      {
        id: 15,
        name: 'balancing',
        title: 'Balancing',
        description: '',
        type: 't'
      }
    ],
    summary: 'Makes the game 10x harder and more.',
    updated_at: '2017-03-16 23:50:39.125580+00:00',
    current_user_rating: null,
    ratings_count: 0,
    title: '10x Harder'
  }
]

store.dispatch(setProfiles(profiles))
store.dispatch(setActiveProfile(activeProfile))

store.dispatch(setInstalledMods(installedMods))
store.dispatch(setSelectedInstalledMod(selectedInstalledMod))

store.dispatch(setOnlineMods(onlineMods))
store.dispatch(setSelectedOnlineMod(selectedOnlineMod[0], selectedOnlineMod[0]))
store.dispatch(setOnlineModFilter(onlineModFilter))
store.dispatch(setOnlineModSort(onlineModSort[0], onlineModSort[1]))

store.dispatch(setAppCurrentVersion('1.0.0'))
store.dispatch(setAppLatestVersion('2.0.0'))

store.dispatch(setPlayerName('Alyx DeLunar'))

ReactDOM.render((
  <Provider store={store}>
    <AppContainer />
  </Provider>),
  document.getElementById('app')
)
