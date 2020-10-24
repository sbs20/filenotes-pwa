import Constants from './constants';
import DropboxService from './dropbox-service';
import LocalProvider from './local-provider';
import Log from './log';
import Storage from './storage';

export default {
  storage: Storage,

  local: new LocalProvider(),

  log: Log,
  
  remote: new DropboxService(),

  // Goes in DropboxService
  async start(window) {
    const connect = async (accessToken) => {
      if (accessToken === undefined) {
        return false;
      }
      this.remote.configure({ clientId: Constants.APP_ID, accessToken: accessToken });
      return await this.remote.connect();
    };

    // Try local storage first
    let accessToken = await Storage.settings.get('accessToken');
    if (accessToken !== undefined && await connect(accessToken)) {
      return;
    }

    if (window === undefined) {
      throw new Error('window parameter must be specified');
    }

    // If that didn't work, see if there's anything in the URL
    accessToken = this.remote.authenticationToken(window.location.hash);
    if (accessToken !== undefined && await connect(accessToken)) {
      await Storage.settings.set('accessToken', accessToken);
      return;
    }

    // Initiate sign in
    this.remote.configure({ clientId: Constants.APP_ID, authUrl: Constants.HOST_URL });
    const uri = this.remote.authenticationUrl();
    window.location.href = uri;
  },
};
