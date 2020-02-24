export default {
  type: 'object',
  default: {},
  properties: {
    // Whether the app will close when Factorio is started through the app
    closeOnStartup: {
      type: 'boolean',
      default: true,
    },
    // How long before last check of online mods before the app will check again. In milliseconds.
    onlinePollingInterval: {
      type: 'number',
      default: 86400000,
    },
  },
}
