/**
 * Hook for DOM events.
 * Wrap DOM events' callbacks to execute a given function before running the expected behaviour.
 * @module event-listener-hook
 */

'use strict';

class Rule {
  setOptions(opts) {
    if ('enabled' in opts) {
      this.enabled = Boolean(opts.enabled);
    }

    if ('types' in opts) {
      this.types = opts.types;
    }

    if ('selector' in opts) {
      this.selector = opts.selector;
    }

    this.onEvent = function (event) {
      const data = {
        topic: 'dom-events',
        element: event.target.nodeName,
        event: event.type
      };
      opts.callback(null, data);
    };
  }

  _matches(type, elem) {
    return (!this.types || this.types.includes(type)) &&
           (!this.selector ||
              (this.selector === 'document' && elem instanceof Document) ||
              (this.selector === 'window' && elem instanceof Window) ||
              (elem.matches && elem.matches(this.selector)));
  }

  _onEvent(event, handler) {
    if (this.enabled && this._matches(event.type, event.target)) {
      return this.onEvent(event, handler);
    }

    return undefined;
  }
}

/** @class */
class EventListenerHook {
  constructor(name) {
    this.name = name;

    this.targetInstance = this;
    this.rules = [new Rule()];

    this.handlerProxies = new WeakMap();

    this.oldAEL = EventTarget.prototype.addEventListener;
    this.oldREL = EventTarget.prototype.removeEventListener;

    const me = this;

    EventTarget.prototype.addEventListener = function (type, handler, opts) {
      return me.onAddListener(this, type, handler, opts);
    };

    EventTarget.prototype.removeEventListener = function (type, handler, opts) {
      return me.onRemoveListener(this, type, handler, opts);
    };
  }

  onAddListener(elem, type, handler, options) {
    if (!handler) { // No handler, so this call will fizzle anyway
      return undefined;
    }

    const me = this;
    const proxy = this.handlerProxies.get(handler) || function (event) {
      return me.targetInstance.onEvent(this, event, handler);
    };

    const returnValue = this.oldAEL.call(elem, type, proxy, options);
    this.handlerProxies.set(handler, proxy);

    return returnValue;
  }

  onRemoveListener(elem, type, handler, options) {
    if (handler && this.handlerProxies.has(handler)) {
      const proxy = this.handlerProxies.get(handler);
      this.oldREL.call(elem, type, proxy, options);
    } else {
      this.oldREL.call(elem, type, handler, options);
    }
  }

  onEvent(thisObj, event, originalHandler) {
    let stopEvent = false;

    for (const rule of this.rules) {
      if (rule._onEvent(event, originalHandler) === false) {
        stopEvent = true;
      }
    }

    if (!stopEvent) {
      if (originalHandler.handleEvent) {
        return originalHandler.handleEvent.call(thisObj, event);
      }

      return originalHandler.call(thisObj, event);
    }

    return undefined;
  }

  /**
   * Set options for the EventListener hook.
   * @param {Object} opts
   * @param {boolean} opts.enabled - Tell wether or not the hook should be enabled.
   * @param {Array<string>} opts.types - The list of DOM events for which the behavior should be wrapped.
   * @param {function} opts.callback - The function to call before triggering the expected behavior.
   */
  setOptions(opts) {
    this.rules[0].setOptions(opts);
    this.enabled = this.rules[0].enabled;
  }
}

module.exports = {
  EventListenerHook
};
