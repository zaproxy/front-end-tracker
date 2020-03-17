/**
 * Hook for DOM events.
 * Wrap DOM events' callbacks to execute a given function before running the expected behaviour.
 * @module event-listener-hook
 */

'use strict';

class Rule {
  setOptions(options) {
    if ('enabled' in options) {
      this.enabled = Boolean(options.enabled);
    }

    if ('types' in options) {
      this.types = options.types;
    }

    if ('selector' in options) {
      this.selector = options.selector;
    }

    this.onEvent = function (event) {
      const data = {
        topic: 'dom-events',
        element: event.target.nodeName,
        event: event.type
      };
      options.callback(null, data);
    };
  }

  _matches(type, element) {
    return (!this.types || this.types.includes(type)) &&
           (!this.selector ||
              (this.selector === 'document' && element instanceof Document) ||
              (this.selector === 'window' && element instanceof Window) ||
              (element.matches && element.matches(this.selector)));
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

    EventTarget.prototype.addEventListener = function (type, handler, options) {
      return me.onAddListener(this, type, handler, options);
    };

    EventTarget.prototype.removeEventListener = function (type, handler, options) {
      return me.onRemoveListener(this, type, handler, options);
    };
  }

  onAddListener(element, type, handler, options) {
    if (!handler) { // No handler, so this call will fizzle anyway
      return undefined;
    }

    const me = this;
    const proxy = this.handlerProxies.get(handler) || function (event) {
      return me.targetInstance.onEvent(this, event, handler);
    };

    const returnValue = this.oldAEL.call(element, type, proxy, options);
    this.handlerProxies.set(handler, proxy);

    return returnValue;
  }

  onRemoveListener(element, type, handler, options) {
    if (handler && this.handlerProxies.has(handler)) {
      const proxy = this.handlerProxies.get(handler);
      this.oldREL.call(element, type, proxy, options);
    } else {
      this.oldREL.call(element, type, handler, options);
    }
  }

  onEvent(thisObject, event, originalHandler) {
    let stopEvent = false;

    for (const rule of this.rules) {
      if (rule._onEvent(event, originalHandler) === false) {
        stopEvent = true;
      }
    }

    if (!stopEvent) {
      if (originalHandler.handleEvent) {
        return originalHandler.handleEvent.call(thisObject, event);
      }

      return originalHandler.call(thisObject, event);
    }

    return undefined;
  }

  /**
   * Set options for the EventListener hook.
   * @param {Object} options
   * @param {boolean} options.enabled - Tell wether or not the hook should be enabled.
   * @param {Array<string>} options.types - The list of DOM events for which the behavior should be wrapped.
   * @param {function} options.callback - The function to call before triggering the expected behavior.
   */
  setOptions(options) {
    this.rules[0].setOptions(options);
    this.enabled = this.rules[0].enabled;
  }
}

module.exports = {
  EventListenerHook
};
