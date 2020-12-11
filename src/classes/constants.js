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
    AutoName: 'auto-name',
    AutoSync: 'auto-sync',
    AutoSave: 'auto-save',
    SortBy: 'sort-by'
  },

  Themes: {
    Light: 'light',
    Dark: 'dark'
  },

  SortBy: {
    FolderThenNameAsc: 'folder-name-asc',
    FolderThenNameDesc: 'folder-name-desc',
    NameAsc: 'name-asc',
    NameDesc: 'name-desc',
    SizeAsc: 'size-asc',
    SizeDesc: 'size-desc',
    ModifiedAsc: 'modified-asc',
    ModifiedDesc: 'modified-desc'
  },

  Event: {
    Snackbar: 'snackbar',
    Sync: {
      Listen: 'sync.listen',
      Start: 'sync.start',
      Finish: 'sync.finish'
    }
  },

  ParentDirectory: '../ (parent)'
};

export default Constants;