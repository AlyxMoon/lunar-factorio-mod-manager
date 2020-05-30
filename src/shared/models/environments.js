
const environment = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
    default: {
      type: 'boolean',
      default: false,
    },
    paths: {
      type: 'object',
      default: {},
      properties: {
        factorioDataDir: {
          type: 'string',
        },
        factorioExe: {
          type: 'string',
        },
        modDir: {
          type: 'string',
        },
        playerDataFile: {
          type: 'string',
        },
        saveDir: {
          type: 'string',
        },
      },
    },
  },
}

export default {
  type: 'object',
  default: {},
  properties: {
    active: {
      type: 'number',
      minimum: 0,
    },
    list: {
      type: 'array',
      default: [],
      items: environment,
    },
  },
}
