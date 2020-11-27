const Constants = {
  APP_ID: process.env.VUE_APP_DROPBOX_CLIENT_ID,
  HOST_URL: process.env.VUE_APP_HOST_URL,

  Settings: {
    Name: 'name',
    Email: 'email',
    OAuth: 'oauth',
    Pkce: 'pkce',
    Theme: 'theme'
  },

  Themes: {
    Light: 'light',
    Dark: 'dark'
  }
};

export default Constants;