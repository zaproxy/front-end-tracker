'use strict';

const hooks = [];
const oldAEL = EventTarget.prototype.addEventListener;
const oldREL = EventTarget.prototype.removeEventListener;
const registrations = {};

EventTarget.prototype.addEventListener = function (...args) {
  const type = args[0];
  const fn = args[1];
  const options = args[2];
  if (!fn) { // No handler, so this call will fizzle anyway
    return undefined;
  }
  if (!(type in registrations)) {
    registrations[type] = new WeakMap();
  }
  const replacementHandler = function (event) {
    let stopEvent = false;
    for (const hook of hooks) {
      if (hook._onEvent(event) === true) {
        stopEvent = true;
      }
    }
    if (!stopEvent) {
      return fn.apply(this, args);
    }
    return undefined;
  };
  const returnValue = oldAEL.call(this, args[0], replacementHandler, options);
  if (!registrations[type].has(fn)) {
    registrations[type].set(fn, replacementHandler);
  }
  return returnValue;
};

EventTarget.prototype.removeEventListener = function (...args) {
  const type = args[0];
  const fn = args[1];
  const options = args[2];
  if (fn && registrations[type] && registrations[type].has(fn)) {
    const replacementHandler = registrations[type].get(fn);
    oldREL.call(this, args[0], replacementHandler, options);
    registrations[type].delete(fn);
  } else {
    oldREL.apply(this, args);
  }
};

class EventListenerHook {
  constructor() {
    hooks.push(this);
  }

  setOptions(opts) {
    if ('enabled' in opts) {
      this.enabled = Boolean(opts.enabled);
    }
    this.types = opts.types;
    this.selector = opts.selector;
    this.onEvent = function (event) {
      const data = {
        topic: 'dom-events',
        element: event.target.nodeName,
        event: event.type
      };
      opts.callback(null, data);
    };
  }

  _onEvent(event) {
    if (this.enabled &&
        (!this.types || this.types.includes(event.type)) &&
        (!this.selector ||
          (this.selector === 'document' && event.target instanceof Document) ||
          (this.selector === 'window' && event.target instanceof Window) ||
          (event.target.matches && event.target.matches(this.selector)))) {
      this.onEvent(event);
    }
  }
}

module.exports = {
  EventListenerHook
};
