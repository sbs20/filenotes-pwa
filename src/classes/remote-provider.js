import Constants from './constants';
import DropboxProvider from './dropbox/dropbox-provider';
import Log from './log';
import { StorageService } from './service';

const remote = new DropboxProvider();
const log = Log.get('RemoteProvider');

/**
 * Attempts to connect and if not forces authentication
 * @param {Window} window
 * @returns {Promise.<void>} Promise<void>
 */
export async function connect(window) {
  // Try local storage first
  let accessToken = await StorageService.settings.get('accessToken');
  if (await remote.connect({ clientId: Constants.APP_ID, accessToken: accessToken })) {
    log.debug('Connected using stored access token');
    log.info(`Logged in as ${remote.accountName} (${remote.accountEmail})`);
    return;
  }

  if (window === undefined) {
    log.error('window parameter must be specified');
    throw new Error('window parameter must be specified');
  }

  // If that didn't work, see if there's anything in the URL
  accessToken = remote.authenticationToken(window.location.hash);
  if (await remote.connect({ clientId: Constants.APP_ID, accessToken: accessToken })) {
    log.debug('Connected using url access token');
    log.info(`Logged in as ${remote.accountName} (${remote.accountEmail})`);
    await StorageService.settings.set('accessToken', accessToken);
    return;
  }

  // Initiate sign in
  remote.configure({ clientId: Constants.APP_ID, authUrl: Constants.HOST_URL });
  const uri = remote.authenticationUrl();
  window.location.href = uri;
}

export default remote;
