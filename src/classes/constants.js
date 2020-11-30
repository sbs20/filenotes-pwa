const Constants = {
  ApplicationId: process.env.VUE_APP_DROPBOX_CLIENT_ID,
  HostUrl: process.env.VUE_APP_HOST_URL,
  Version: process.env.VUE_APP_VERSION,
  
  Settings: {
    Name: 'name',
    Email: 'email',
    OAuth: 'oauth',
    Pkce: 'pkce',
    Theme: 'theme',
    Cursor: 'cursor',
    SyncOnChange: 'sync-on-change',
    AutoSave: 'auto-save'
  },

  Themes: {
    Light: 'light',
    Dark: 'dark'
  }
};

export default Constants;