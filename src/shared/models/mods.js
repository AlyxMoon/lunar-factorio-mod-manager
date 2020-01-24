import { definitionsInstalledMod, definitionsOnlineMod } from './_shared'
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
    online: {
      type: 'array',
      items: {
        ...definitionsOnlineMod,
      },
      default: [],
    },
    onlineCount: {
      type: 'number',
      default: 0,
    },
    onlineLastFetch: {
      type: 'number',
    },
    factorioVersion: {
      type: 'string',
      pattern: version,
    },
  },
}
