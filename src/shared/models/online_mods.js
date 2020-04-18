import { definitionsOnlineMod } from './_shared'

export default {
  type: 'object',
  default: {},
  properties: {
    mods: {
      type: 'array',
      items: { ...definitionsOnlineMod },
      default: [],
    },
    count: {
      type: 'number',
      default: 0,
    },
    lastFetch: {
      type: 'number',
    },
  }
}
