/**
 * List of DOM events to be tracked.
 * <br/>
 * An exhaustive list of DOM events can be found on MDN:
 * <br/>
 * <a href="https://developer.mozilla.org/en-US/docs/Web/Events" target="_blank">https://developer.mozilla.org/en-US/docs/Web/Events</a>
 * <br/>
 * Note that the more events are tracked, the slower the scanner will be.
 *
 * @module events
 */

'use strict';

const FORM_EVENTS = ['reset', 'submit'];
const CLIPBOARD_EVENTS = ['cut', 'copy', 'paste'];
const KEYBOARD_EVENTS = ['keydown', 'keypress', 'keyup'];
const MOUSE_EVENTS = [
  'mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu', 'wheel', 'select',
  'pointerlockchange', 'pointerlockerror'
];
const DRAG_AND_DROP_EVENTS = [
  'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop'
];

/**
 * List of DOM events.
 * @constant
 * @memberOf module:events
 * @type {Array<String>}
 * */
const EVENTS = Array.prototype.concat(
  FORM_EVENTS, CLIPBOARD_EVENTS, KEYBOARD_EVENTS,
  MOUSE_EVENTS, DRAG_AND_DROP_EVENTS
);

module.exports = {
  EVENTS
};
