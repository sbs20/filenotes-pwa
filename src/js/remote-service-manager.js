import DropboxService from './dropbox-service';
import Constants from '../js/constants';
import Storage from '../js/storage';

const service = new DropboxService();

async function connect(accessToken) {
  if (accessToken === undefined) {
    return false;
  }
  service.configure({ clientId: Constants.APP_ID, accessToken: accessToken });
  return await service.connect();
}

export default {
  service: service,

  async start(window) {
    // Try local storage first
    let accessToken = await Storage.settings.get('accessToken');
    if (accessToken !== undefined && await connect(accessToken)) {
      return;
    }

    if (window === undefined) {
      throw new Error('window paramater must be specified');
    }

    // If that didn't work, see if there's anything in the URL
    accessToken = service.authenticationToken(window.location.hash);
    if (accessToken !== undefined && await connect(accessToken)) {
      await Storage.settings.set('accessToken', accessToken);
      return;
    }

    // Initiate sign in
    service.configure({ clientId: Constants.APP_ID, authUrl: Constants.HOST_URL });
    const uri = service.authenticationUrl();
    window.location.href = uri;
  },
};
