const Constants = {
  ApplicationId: process.env.VUE_APP_DROPBOX_CLIENT_ID,
  HostUrl: process.env.VUE_APP_HOST_URL,
  Version: process.env.VUE_APP_VERSION,
  
  Keys: {
    s: 83,
    enter: 13,
    escape: 27
  },
  
  Settings: {
    Name: 'name',
    Email: 'email',
    OAuth: 'oauth',
    Pkce: 'pkce',
    Theme: 'theme',
    StorageService: 'storage-service',
    Cursor: 'cursor',
    AutoName: 'auto-name',
    AutoSync: 'auto-sync',
    AutoSave: 'auto-save',
    SortBy: 'sort-by',
    TextEditor: 'text-editor'
  },

  StorageServices: {
    None: 'none',
    Dropbox: 'dropbox'
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

  TextEditor: {
    Plain: 'plain',
    Prism: 'prism'
  },

  Event: {
    App: {
      Reload: 'app.reload'
    },
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