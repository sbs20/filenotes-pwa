process.env.VUE_APP_VERSION = require('./package.json').version;

const NAME = 'Filenotes';

module.exports = {
  configureWebpack: {        
    devServer: {
      headers: {
        'Access-Control-Allow-Origin': '*'            
      }
    }
  },

  pages: {
    index: {
      entry: 'src/main.ts',
      title: NAME
    }
  },

  pwa: {
    name: NAME,
    themeColor: '#ffffff',
    msTileColor: '#808080',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',

    manifestOptions: {
      'icons': [
        {
          'src': './img/icons/android-chrome-192x192.png',
          'sizes': '192x192',
          'type': 'image/png'
        },
        {
          'src': './img/icons/android-chrome-512x512.png',
          'sizes': '512x512',
          'type': 'image/png'
        },
        {
          'src': './img/icons/android-chrome-maskable-192x192.png',
          'sizes': '192x192',
          'type': 'image/png',
          'purpose': 'maskable'
        },
        {
          'src': './img/icons/android-chrome-maskable-512x512.png',
          'sizes': '512x512',
          'type': 'image/png',
          'purpose': 'maskable'
        },
        {
          'src': './img/icons/apple-touch-icon-60x60.png',
          'sizes': '60x60',
          'type': 'image/png'
        },
        {
          'src': './img/icons/apple-touch-icon-76x76.png',
          'sizes': '76x76',
          'type': 'image/png'
        },
        {
          'src': './img/icons/apple-touch-icon-120x120.png',
          'sizes': '120x120',
          'type': 'image/png'
        },
        {
          'src': './img/icons/apple-touch-icon-152x152.png',
          'sizes': '152x152',
          'type': 'image/png'
        },
        {
          'src': './img/icons/apple-touch-icon-180x180.png',
          'sizes': '180x180',
          'type': 'image/png'
        },
        {
          'src': './img/icons/apple-touch-icon.png',
          'sizes': '180x180',
          'type': 'image/png'
        },
        {
          'src': './img/icons/favicon-16x16.png',
          'sizes': '16x16',
          'type': 'image/png'
        },
        {
          'src': './img/icons/favicon-32x32.png',
          'sizes': '32x32',
          'type': 'image/png'
        },
        {
          'src': './img/icons/msapplication-icon-144x144.png',
          'sizes': '144x144',
          'type': 'image/png'
        },
        {
          'src': './img/icons/mstile-150x150.png',
          'sizes': '150x150',
          'type': 'image/png'
        }
      ]
    },

    workboxOptions: {
      // https://stackoverflow.com/a/51716150/1229065
      skipWaiting: true,
      clientsClaim: true,
    }
  },
  transpileDependencies: [
    'vuetify'
  ]
};