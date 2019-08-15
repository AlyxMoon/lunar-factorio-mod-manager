process.env.NODE_ENV = 'development'

const electron = require('electron')
const webpack = require('webpack')
const webpackHotMiddleware = require('webpack-hot-middleware')
const WebpackDevServer = require('webpack-dev-server')
const treeKill = require('tree-kill')

const path = require('path')
const { spawn } = require('child_process')

const mainConfig = require('./webpack.main.config')
const rendererConfig = require('./webpack.renderer.config')

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

const startRenderer = () => {
  rendererConfig.entry.renderer = [
    path.join(__dirname, 'dev-client'),
    rendererConfig.entry.renderer,
  ]

  return new Promise(resolve => {
    const compiler = webpack(rendererConfig)
    const { name } = compiler
    const hotMiddleware = webpackHotMiddleware(compiler, {
      log: false,
      noInfo: true,
      quiet: true,
    })

    compiler.hooks.afterEmit.tap('afterEmit', () => {
      console.log(`\nCompiled ${name} script!`)
      console.log(`\nWatching file changes for ${name} script...`)
    })

    const server = new WebpackDevServer(compiler, {
      contentBase: path.join(__dirname, '../'),
      hot: true,
      noInfo: true,
      overlay: true,
      clientLogLevel: 'error',
      before (app, ctx) {
        app.use(hotMiddleware)

        ctx.middleware.waitUntilValid(() => {
          resolve()
        })
      },
    })

    server.listen(9080)
  })
}

const start = async () => {
  await startRenderer()
  await startMain()
}

start()
