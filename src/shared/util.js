// Pass a function to this to only have it be called once it stops firing after `wait` milliseconds
// Passing `immediate` = true will keep behavior but have function fire first and then stop subsequent calls until `wait` milliseconds
export const debounce = (func, wait = 1000, immediate = false) => {
  let timer

  return function () {
    const context = this
    const args = arguments

    const later = function () {
      timer = null
      if (!immediate) func.apply(context, args)
    }

    const callNow = immediate && !timer

    clearTimeout(timer)
    timer = setTimeout(later, wait)

    if (callNow) func.apply(context, args)
  }
}

export const isVersionHigher = (currentVersion, checkedVersion) => {
  // Expecting version to be the following format: major.minor.patch
  const version1 = currentVersion.split('.')
  const version2 = checkedVersion.split('.')

  for (let i = 0; i < 3; i++) {
    const temp1 = parseInt(version1[i])
    const temp2 = parseInt(version2[i])

    if (temp1 < temp2) return true
    if (temp1 > temp2) return false
  }

  return false
}

export const parseModDependencies = (dependencies = [], mods = []) => {
  const newDependencies = typeof dependencies === 'string'
    ? [dependencies]
    : dependencies.slice()
  if (newDependencies.length === 0) newDependencies.push('base')

  return newDependencies.map(dependency => {
    const prefix = dependency.match(/^\W*/)[0].trim()
    dependency = dependency.replace(/^\W*/, '')

    const name = dependency.match(/^[^<>=]*/)[0].trim()
    dependency = dependency.replace(/^[^<>=]*/, '').trim()

    const operator = (dependency.match(/^<=|^>=|^=|^<|^>/) || [''])[0]
    dependency = dependency.replace(/^<=|^>=|^=|^<|^>/, '').trim()

    const version = dependency

    const installed = mods.some(m => m.name === name)

    return {
      installed,
      name,
      operator,
      version,
      type: (() => {
        if (prefix === '!') return 'incompatible'
        if (prefix === '?') return 'optional'
        if (prefix === '(?)') return 'optional-hidden'
        return 'required'
      })(),
    }
  })
}
