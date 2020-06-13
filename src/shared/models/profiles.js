import { definitionsInstalledMod } from './_shared'

export default {
  type: 'object',
  default: {},
  properties: {
    list: {
      type: 'array',
      default: [],
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          environment: {
            type: 'number',
          },
          mods: {
            type: 'array',
            items: {
              ...definitionsInstalledMod,
            },
          },
        },
        required: ['name', 'mods'],
      },
    },
    active: {
      type: 'number',
      minimum: 0,
    },
  },
}
