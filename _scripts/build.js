const builder = require('electron-builder')

const { Platform } = builder
const { name, productName } = require('../package.json')

const config = {
  appId: `com.alyxmoon.${name}`,
  copyright: `Copyright ${(new Date()).getFullYear()} - Allister Moon - allisterkmoon@gmail.com`,
  productName,
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
    target: ['deb'],
  },
  mac: {
    category: 'public.app-category.utilities',
    icon: '_icons/icon.icns',
    target: ['zip'],
    type: 'distribution',
  },
  win: {
    icon: '_icons/icon.ico',
    target: ['zip'],
  },
  nsis: {
    allowToChangeInstallationDirectory: true,
    oneClick: false,
  },
}

let targets

if (process.argv[2] === 'linux') {
  targets = Platform.LINUX.createTarget()
} else if (process.argv[2] === 'mac') {
  targets = Platform.MAC.createTarget()
} else {
  targets = Platform.WINDOWS.createTarget()
}

builder.build({
  targets,
  config,
}).then(console.log).catch(console.error)
