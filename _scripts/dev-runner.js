process.env.NODE_ENV = 'development'

const electron = require('electron')
const webpack = require('webpack')
const treeKill = require('tree-kill')

const path = require('path')
const { spawn } = require('child_process')

const mainConfig = require('./webpack.main.config')

let electronProcess = null
let manualRestart = null
const remoteDebugging = !!(
  process.argv[2] && process.argv[2] === '--remote-debug'
)

if (remoteDebugging) {
  process.env.RENDERER_REMOTE_DEBUGGING = true
}

const killElectron = (pid) => {
  return new Promise((resolve, reject) => {
    if (pid) {
      treeKill(pid, err => {
        if (err) reject(err)

        resolve()
      })
    } else {
      resolve()
    }
  })
}

const restartElectron = async () => {
  console.log('\nStarting electron...')

  const { pid } = electronProcess || {}
  await killElectron(pid)

  electronProcess = spawn(electron, [
    '.',
    remoteDebugging ? '--inspect=9222' : '',
    remoteDebugging ? '--remote-debugging-port=9223' : '',
  ], {
    cwd: path.join(__dirname, '..'),
  })

  electronProcess.on('exit', (code, signal) => {
    if (!manualRestart) process.exit(0)
    manualRestart = false
  })
}

const startMain = async () => {
  const compiler = webpack(mainConfig)

  compiler.hooks.afterEmit.tap('afterEmit', async () => {
    console.log(`\nCompiled ${compiler.name} script!`)

    manualRestart = true
    await restartElectron()

    console.log(`\nWatching file changes for ${compiler.name} script...`)
  })

  compiler.watch(
    {
      aggregateTimeout: 500,
    },
    err => {
      if (err) console.error(err)
    }
  )
}

const start = async () => {
  await startMain()
}

start()
