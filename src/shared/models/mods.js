import { definitionsInstalledMod } from './_shared'
import { version } from './_validators'

export default {
  type: 'object',
  default: {},
  properties: {
    installed: {
      type: 'array',
      items: {
        ...definitionsInstalledMod,
      },
      default: [],
    },
    factorioVersion: {
      type: 'string',
      pattern: version,
    },
  },
}
