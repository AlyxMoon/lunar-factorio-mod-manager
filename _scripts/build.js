const builder = require('electron-builder')

const { Platform } = builder
const { name, productName } = require('../package.json')

const config = {
  appId: `com.alyxmoon.${name}`,
  copyright: `Copyright ${(new Date()).getFullYear()} - Allister Moon - allisterkmoon@gmail.com`,
  productName,
  asar: true,
  directories: {
    output: 'build/',
  },
  files: [
    'dist/**/*',
    'src/data/**/*',
  ],
  dmg: {
    contents: [
      {
        path: '/Applications',
        type: 'link',
        x: 410,
        y: 230,
      },
      {
        type: 'file',
        x: 130,
        y: 230,
      },
    ],
    window: {
      height: 800,
      width: 600,
    },
  },
  linux: {
    icon: '_icons/icon.png',
    target: ['AppImage', 'deb', 'zip'],
  },
  mac: {
    category: 'public.app-category.utilities',
    icon: '_icons/icon.png',
    target: ['dmg', 'zip'],
    type: 'distribution',
  },
  win: {
    icon: '_icons/icon.png',
    target: ['nsis', 'zip'],
  },
  nsis: {
    allowToChangeInstallationDirectory: true,
    oneClick: false,
  },
}

let targets

if (process.argv[2]) {
  switch (process.argv[2]) {
    case 'linux':
      targets = Platform.LINUX.createTarget()
      break
    case 'mac':
      targets = Platform.MAC.createTarget()
      break
    case 'windows':
    default:
      targets = Platform.WINDOWS.createTarget()
  }
}

builder.build({
  targets,
  config,
}).then(console.log).catch(console.error)
