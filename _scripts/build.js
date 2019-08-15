const builder = require('electron-builder')

const { Platform } = builder
const { name, productName } = require('../package.json')

const config = {
  appId: `com.alyxmoon.${name}`,
  copyright: `Copyright @2019 allisterkmoon@gmail.com`,
  productName,
  directories: {
    output: 'build/',
  },
  files: [
    '!**/node_modules/**/*',
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
    // icon: '_icons/icon.png',
    target: ['deb', 'snap', 'AppImage'],
  },
  mac: {
    category: 'public.app-category.utilities',
    // icon: '_icons/icon.icns',
    target: ['dmg', 'zip'],
    type: 'distribution',
  },
  win: {
    // icon: '_icons/icon.ico',
    target: ['nsis', 'zip', 'portable'],
  },
  nsis: {
    allowToChangeInstallationDirectory: true,
    oneClick: false,
  },
}

builder.build({
  targets: Platform.WINDOWS.createTarget(),
  config,
}).then(console.log).catch(console.error)
