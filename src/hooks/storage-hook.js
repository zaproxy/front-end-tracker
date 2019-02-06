/**
 * Hook for Storage interactions.
 * Wrap Storage events' callbacks to execute a given function before running the expected behaviour.
 * @module storage-hook
 */

'use strict';

const hooks = [];
const oldGetItem = Storage.prototype.getItem;
const oldRemoveItem = Storage.prototype.removeItem;
const oldSetItem = Storage.prototype.setItem;

function getStorageType(storage) {
  let type;

  if (storage === window.sessionStorage) {
    type = 'sessionStorage';
  } else if (storage === window.localStorage) {
    type = 'localStorage';
  } else {
    type = 'unknown';
  }

  return type;
}

Storage.prototype.getItem = function (...args) {
  const keyName = args[0];
  const keyValue = oldGetItem.call(this, keyName);
  for (const hook of hooks) {
    hook.onStorage({
      key: keyName,
      action: 'get',
      value: keyValue,
      type: getStorageType(this)
    });
  }
  return keyValue;
};

Storage.prototype.removeItem = function (...args) {
  const keyName = args[0];
  const keyValue = oldGetItem.call(this, keyName);
  const returnValue = oldRemoveItem.call(this, keyName);
  for (const hook of hooks) {
    hook.onStorage({
      key: keyName,
      action: 'remove',
      value: keyValue,
      type: getStorageType(this)
    });
  }
  return returnValue;
};

Storage.prototype.setItem = function (...args) {
  const keyName = args[0];
  const keyValue = args[1];
  const returnValue = oldSetItem.call(this, keyName, keyValue);
  for (const hook of hooks) {
    hook.onStorage({
      key: keyName,
      action: 'set',
      value: keyValue,
      type: getStorageType(this)
    });
  }
  return returnValue;
};

/** @class StorageHook */
class StorageHook {
  constructor() {
    hooks.push(this);
  }

  /**
   * Set options for the Storage hook.
   * @param {Object} opts
   * @param {boolean} opts.enabled - Tell wether or not the hook should be enabled.
   * @param {function} opts.callback - The function to call before triggering the expected behavior.
   */
  setOptions(opts) {
    if ('enabled' in opts) {
      this.enabled = Boolean(opts.enabled);
    }
    this.onStorage = function (obj) {
      const data = {...obj, topic: 'storage'};
      opts.callback(null, data);
    };
  }
}

module.exports = {
  StorageHook
};
