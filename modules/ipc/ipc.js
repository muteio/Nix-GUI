const Observable  = require('rxjs/Observable').Observable;
const rxIpc       = require('rx-ipc-electron/lib/main').default;
const log         = require('electron-log');

const daemon = require('../daemon/daemon');
const rpc    = require('../rpc/rpc.js');

/*
** Prompt wallet choosing
** instructs the GUI to display a multiwallet choosing modal
** resolves the wallets that the user chose or the wallet if there was just one
** rejects if no wallet was found
*/
exports.promptWalletChoosing = function(wallets, webContents) {
  return new Promise ((resolve, reject) => {

    if (wallets.length === 0) {
      log.warn('No walet found in userData.');
      reject();
    } else if (wallets.length == 1) {
      resolve(wallets);
    }

    console.log('test')
    rxIpc.checkRemoteListener('multiwallet', webContents)
    .then(() => {
      console.log('then')
      rxIpc.runCommand('multiwallet', webContents, wallets).subscribe(chosen => {
        console.log('got response')
        if (chosen.length === 0) {
          log.error('GUI returned no chosen walllet !');
          reject(chosen);
        } else {
          console.log(chosen)
          resolve(chosen);
        }
      }, err => log.error(err));
    }).catch(() => {
      console.log('checking...');
    });

  }).catch(error => log.error(error))
}

/*
** prepares `rpc-channel` to receive RPC calls from the renderer
*/
exports.init = function() {

  rxIpc.registerListener('rpc-channel', (event, method, params) => {
    return Observable.create(observer => {

      if (['restart-daemon'].includes(method)) {
        daemon.start(true, () => observer.next(true));

      } else {
        rpc.call(method, params, (error, response) => {
          error ? observer.error(error) : observer.next(response);
        });
      }

    });
  });
}
