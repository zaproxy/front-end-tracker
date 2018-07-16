'use strict';

const hooks = [];
const oldGetItem = Storage.prototype.getItem;
const oldRemoveItem = Storage.prototype.removeItem;
const oldSetItem = Storage.prototype.setItem;

Storage.prototype.getItem = function (...args) {
  const keyName = args[0];
  const keyValue = oldGetItem.call(this, keyName);
  for (const hook of hooks) {
    hook.onStorage({
      key: keyName,
      action: 'get',
      value: keyValue
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
      value: keyValue
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
      value: keyValue
    });
  }
  return returnValue;
};

class StorageHook {
  constructor() {
    hooks.push(this);
  }

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
