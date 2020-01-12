module.exports = {
  presets: [
    [
      "@babel/env",
      {
        "targets": {
          "chrome": "73",
          "node": 12
        }
      }
    ]
  ],
  plugins: [
    '@babel/plugin-proposal-export-default-from',
  ],
}