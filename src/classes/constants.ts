const Constants = {
  ApplicationId: process.env.VUE_APP_DROPBOX_CLIENT_ID as string,
  HostUrl: process.env.VUE_APP_HOST_URL as string,
  Version: process.env.VUE_APP_VERSION as string,
  
  Keys: {
    s: 83,
    enter: 13,
    escape: 27
  },
  
  Settings: {
    Name: 'name',
    Email: 'email',
    Avatar: 'avatar',
    OAuth: 'oauth',
    Pkce: 'pkce',
    Theme: 'theme',
    StorageService: 'storage-service',
    Cursor: 'cursor',
    AutoName: 'auto-name',
    AutoSync: 'auto-sync',
    AutoSave: 'auto-save',
    AutoFocus: 'auto-focus',
    ForegroundSync: 'foreground-sync',
    SortBy: 'sort-by',
    TextEditor: 'text-editor'
  },

  StorageServices: {
    None: 'none',
    Dropbox: 'dropbox'
  },

  Themes: {
    Dark: 'dark',
    Light: 'light',
    System: 'system'
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
      Finish: 'sync.finish',
      Progress: 'sync.progress'
    }
  },

  ParentDirectory: '../ (parent)'
};

export default Constants;