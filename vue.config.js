module.exports = {
  transpileDependencies: ['vuetify'],
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true,
    },
  },
  css: {
    extract: { ignoreOrder: true },
  },
  configureWebpack: {
    performance: {
      hints: false,
    },
  },
}
