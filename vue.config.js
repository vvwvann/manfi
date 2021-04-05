module.exports = {
  productionSourceMap: false,
  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.js',
      title: 'Popup',
    },
  },

  css: {
    extract: false,
  },

  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/background.js',
        },
        contentScripts: {
          entries: {
            aliexpress: ['src/stores/aliexpress.js'],
          },
        },
      },
    },
  },
};
