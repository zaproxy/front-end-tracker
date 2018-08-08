'use strict';

const mailbox = require('pubsub-js');

/**
 * Exposed to the `global` scope (in a browser, it would be the `window` or an `iframe`).
 * <br/>
 * See <a href="https://github.com/mroderick/PubSubJS">github.com/mroderick/PubSubJS</a> for description, list of properties, and functions signatures.
 * @global
 */
global.mailbox = mailbox;

const {EVENTS} = require('./events.js');
const {EventListenerHook} = require('./hooks/event-listener-hook.js');
const {StorageHook} = require('./hooks/storage-hook');

const eventListenerOptions = {
  enabled: true,
  types: EVENTS,
  callback: publishToMailbox
};

const storageOptions = {
  enabled: true,
  callback: publishToMailbox
};

/**
 * Callback to be called when something that we hooked into is triggered.
 * <br/>
 * Follow the convention: "expose an error-first callback interface".
 * @function
 * @param {Object} err
 * @param {Object} data
 * @param {('dom-events'|'storage')} data.topic - Which hook the data is from.
 */
function publishToMailbox(err, data) {
  if (err) {
    console.log(err);
  } else {
    const time = new Date().getTime();
    const {topic} = data;
    data.timestamp = time;

    mailbox.publish(topic, data);
  }
}

const hooksAndOptions = [{
  Hook: EventListenerHook,
  options: eventListenerOptions
}, {
  Hook: StorageHook,
  options: storageOptions
}];

hooksAndOptions.forEach(x => {
  const hook = new x.Hook();
  hook.setOptions(x.options);
});
