const standard = require('mocha-standard')

describe('coding style', function () {
  this.timeout(5000)

  it('lib conforms to standard', standard.files([
    '*.js',
    'lib/**/*.js'
  ]))

  it('view conforms to standard', standard.files([
    'view/js/inc.js'
  ], {
    global: ['$']
  }))

  it('tests conform to standard', standard.files([
    'test/**/*.js'
  ], {
    global: ['describe', 'it', 'before', 'beforeEach', 'after', 'afterEach']
  }))
})
