import Constants from './constants';
import Storage from './data/storage';

const storage = new Storage();

class StoredProperty<T> {
  private name: string;
  private defaultValue?: T;

  constructor(name: string, defaultValue?: T) {
    this.name = name;
    this.defaultValue = defaultValue;
  }

  async get(): Promise<T | undefined> {
    const value = await storage.settings.get(this.name) as T;
    return value !== undefined ? value : this.defaultValue;
  }

  async set(value: T): Promise<void> {
    await storage.settings.set(this.name, value);
  }

  async delete(): Promise<void> {
    await storage.settings.delete(this.name);
  }
}

let settings: Settings | null = null;

export default class Settings {
  autoName: StoredProperty<boolean>;
  autoSave: StoredProperty<boolean>;
  autoSync: StoredProperty<boolean>;
  autoFocus: StoredProperty<boolean>;
  foregroundSync: StoredProperty<boolean>;
  storageService: StoredProperty<string>;
  oauth: StoredProperty<OAuthToken>;
  pkce: StoredProperty<PkceParameters>;
  name: StoredProperty<string>;
  email: StoredProperty<string>;
  avatar: StoredProperty<string>;
  cursor: StoredProperty<string>;
  sortBy: StoredProperty<string>;
  theme: StoredProperty<string>;
  textEditor: StoredProperty<string>;

  constructor() {
    this.autoName = new StoredProperty(Constants.Settings.AutoName, true);
    this.autoSave = new StoredProperty(Constants.Settings.AutoSave, true);
    this.autoSync = new StoredProperty(Constants.Settings.AutoSync, true);
    this.autoFocus = new StoredProperty(Constants.Settings.AutoFocus, true);
    this.foregroundSync = new StoredProperty(Constants.Settings.ForegroundSync, true);
    this.storageService = new StoredProperty(Constants.Settings.StorageService, Constants.StorageServices.Dropbox);
    this.oauth = new StoredProperty(Constants.Settings.OAuth);
    this.pkce = new StoredProperty(Constants.Settings.Pkce);
    this.name = new StoredProperty(Constants.Settings.Name, '');
    this.email = new StoredProperty(Constants.Settings.Email, '');
    this.avatar = new StoredProperty(Constants.Settings.Avatar, '');
    this.cursor = new StoredProperty(Constants.Settings.Cursor);
    this.sortBy = new StoredProperty(Constants.Settings.SortBy);
    this.theme = new StoredProperty(Constants.Settings.Theme, Constants.Themes.System);
    this.textEditor = new StoredProperty(Constants.Settings.TextEditor, Constants.TextEditor.Plain);
  }

  static instance(): Settings {
    if (settings === null) {
      settings = new Settings();
    }
    return settings;
  }
}