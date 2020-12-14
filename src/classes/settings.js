import Constants from './constants';
import Storage from './data/storage';

const storage = new Storage();

class StoredProperty {
  constructor(name, defaultValue) {
    this.name = name;
    this.defaultValue = defaultValue;
  }

  /**
   * @returns {Promise.<any>}
   */
  async get() {
    const value = await storage.settings.get(this.name);
    return value !== undefined ? value : this.defaultValue;
  }

  /**
   * @param {any} [value]
   * @returns {Promise.<void>}
   */
  async set(value) {
    await storage.settings.set(this.name, value);
  }

  /**
   * @returns {Promise.<void>}
   */
  async delete() {
    await storage.settings.delete(this.name);
  }
}

let settings = null;

export default class Settings {
  /**
   * Constructor
   */
  constructor() {
    this.autoName = new StoredProperty(Constants.Settings.AutoName, true);
    this.autoSave = new StoredProperty(Constants.Settings.AutoSave, true);
    this.autoSync = new StoredProperty(Constants.Settings.AutoSync, true);
    this.oauth = new StoredProperty(Constants.Settings.OAuth);
    this.pkce = new StoredProperty(Constants.Settings.Pkce);
    this.name = new StoredProperty(Constants.Settings.Name, '');
    this.email = new StoredProperty(Constants.Settings.Email, '');
    this.cursor = new StoredProperty(Constants.Settings.Cursor, '');
    this.sortBy = new StoredProperty(Constants.Settings.SortBy);
    this.theme = new StoredProperty(Constants.Settings.Theme, Constants.Themes.Light);
    this.textEditor = new StoredProperty(Constants.Settings.TextEditor, Constants.TextEditor.Plain);
  }

  /**
   * @returns {Settings}
   */
  static instance() {
    if (settings === null) {
      settings = new Settings();
    }
    return settings;
  }
}