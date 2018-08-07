'use strict';

const mailbox = require('pubsub-js');

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
