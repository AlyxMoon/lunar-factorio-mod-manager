export default {
  type: 'object',
  properties: {
    width: {
      type: 'number',
      minimum: 0,
      default: 400,
    },
    height: {
      type: 'number',
      minimum: 0,
      default: 600,
    },
    x: {
      type: 'number',
      default: 0,
    },
    y: {
      type: 'number',
      default: 0,
    },
  },
}
