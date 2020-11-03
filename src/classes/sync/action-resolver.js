import FilePath from '../files/file-path';
import FileSystem from './file-system';

const fs = new FileSystem();

export default class ActionResolver {
  /**
   * Creates actions for a given file
   * @param {Metadata} local - The local file
   * @param {Metadata} delta - The change
   * @param {Metadata} remote - The remote file
   * @returns {Promise.<Array.<SyncAction>>}
   */
  static async resolve(local, delta, remote) {
    if (local && remote && local.tag === 'file' && local.hash === remote.hash) {
      return [];
    }
    
    const value = `${delta && delta.tag || 'null'}:${remote && remote.tag || 'null'}`;
    switch (value) {
      case 'deleted:deleted':
        // No action
        return [];

      case 'deleted:file':
        // Prefer downloading
        return [{ type: 'file-download', metadata: remote }];

      case 'deleted:folder':
        // Prefer creating the folder
        return [{ type: 'mkdir-local', metadata: remote }];

      case 'deleted:null':
        // Do delete
        return [{ type: 'delete-remote', metadata: delta }];

      case 'file:deleted':
        // Prefer uploading
        return [{ type: 'file-upload', metadata: delta }];

      case 'file:file': {
        // Rename local and sync both ways
        let filepath = new FilePath(delta.path);
        let destinationPath = `${filepath.directory}/${filepath.stem}.${Date.now()}.conflict.${filepath.extension}`;
        let destination = await fs.move(delta.path, destinationPath);
        return [
          { type: 'file-download', metadata: remote },
          { type: 'file-upload', metadata: destination }  
        ];
      }
      case 'file:folder':
        // There is a file with the same name as a folder. Rename the file
        return [];

      case 'file:null':
        return [{ type: 'file-upload', metadata: delta }];


      case 'folder:deleted':
        // Prefer creating the folder
        return [{ type: 'mkdir-remote', metadata: delta }];

      case 'folder:file':
        // There is a file with the same name as a folder. Rename the file
        return [];
      case 'folder:folder':
        // No action
        return [];

      case 'folder:null':
        return [{ type: 'mkdir-remote', metadata: delta }];

      case 'null:deleted':
        return [{ type: 'delete-local', metadata: remote }];

      case 'null:file':
        return [{ type: 'file-download', metadata: remote }];

      case 'null:folder':
        return [{ type: 'mkdir-local', metadata: remote }];

      case 'null:null':
        // No action
        return [];
    }
  }
}