'use strict';

const hooks = [];
const oldAEL = EventTarget.prototype.addEventListener;
const oldREL = EventTarget.prototype.removeEventListener;
const registrations = {};

EventTarget.prototype.addEventListener = function() {
  const elem = this;
  const type = arguments[0];
  const fn = arguments[1];
  const options = arguments[2];
  if (!fn) { // no handler, so this call will fizzle anyway
    return undefined;
  }
  if (!(type in registrations)) {
    registrations[type] = new WeakMap();
  }
  const replacementHandler = function(event) {
    let stopEvent = false;
    for (const hook of hooks) {
      if (hook._onEvent(event) === true) {
        stopEvent = true;
      }
    }
    if (!stopEvent) {
      return fn.apply(this, arguments);
    }
    return undefined;
  };
  const returnValue = oldAEL.call(this, arguments[0], replacementHandler, options);
  if (!registrations[type].has(fn)) {
    registrations[type].set(fn, replacementHandler);
  }
  return returnValue;
};

EventTarget.prototype.removeEventListener = function() {
  const elem = this;
  const type = arguments[0];
  const fn = arguments[1];
  const options = arguments[2];
  if (fn && registrations[type] && registrations[type].has(fn)) {
    const replacementHandler = registrations[type].get(fn);
    oldREL.call(this, arguments[0], replacementHandler, options);
    registrations[type].delete(fn);
  } else {
    oldREL.apply(this, arguments);
  }
};

class EventListenerHook {
  constructor() {
    hooks.push(this);
  }

  setOptions(opts) {
    if ("enabled" in opts) {
      this.enabled = !!opts.enabled;
    }
    this.types = opts.types;
    this.selector = opts.selector;
    this.onEvent = function(event) {
      const data = {
        'topic': 'dom-events',
        'element': event.target.nodeName,
        'event': event.type
      };
      opts.callback(null, data);
    };
  }

  _onEvent(event) {
    if (this.enabled &&
        (!this.types || this.types.includes(event.type)) &&
        (!this.selector ||
          (this.selector === "document" && event.target instanceof Document) ||
          (this.selector === "window" && event.target instanceof Window) ||
          (event.target.matches && event.target.matches(this.selector)))) {
      this.onEvent(event);
    }
  }
}

module.exports = {
  EventListenerHook: EventListenerHook
};
