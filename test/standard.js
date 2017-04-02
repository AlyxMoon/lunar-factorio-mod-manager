const standard = require('mocha-standard')

describe('coding style', function () {
  this.timeout(20000)

  it('server-side code conforms to standard', standard.files([
    '*.js',
    'lib/**/*.js'
  ], {
    ignore: ['webpack.config.js']
  }))

  it('client-side code conforms to standard', standard.files([
    'src/**/**/*.jsx',
    'src/**/**/*.js'
  ]))

  it('tests conform to standard', standard.files([
    'test/**/*.js',
    'test/**/*.jsx'
  ], {
    global: ['describe', 'it', 'before', 'beforeEach', 'after', 'afterEach']
  }))
})
