import { definitionsInstalledMod } from './_shared'

export default {
  type: 'object',
  properties: {
    list: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
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
