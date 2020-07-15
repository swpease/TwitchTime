/*
  A user pointed out that the storage.sync feature actually doesn't work at all.
  This background script attempts to copy any old data stored in `storage.sync` 
  over to `storage.local`, which will be used from now on.
*/

function onError(error) {
  console.log(error);
}

function mergeSyncData(localData) {
    if (Object.keys(localData).length == 0) {
        return;
    }  // Already moved, or new user.
    else {
        let gettingSync = browser.storage.sync.get();
        // `.set()` failure has no backup plan
        gettingSync.then(syncData => browser.storage.local.set(syncData)).catch(onError);
    }
}

function switchToLocalStorage() {
    let gettingLocal = browser.storage.local.get();
    gettingLocal.then(mergeSyncData, onError);
}

browser.runtime.onInstalled(switchToLocalStorage);