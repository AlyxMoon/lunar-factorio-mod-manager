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
