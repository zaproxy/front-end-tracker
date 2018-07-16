'use strict';

global.mailbox = require('pubsub-js');

const EVENTS = require('./events.js').EVENTS;
const EventListenerHook = require('./hooks/EventListenerHook.js').EventListenerHook;
const StorageHook = require('./hooks/StorageHook.js').StorageHook;

const eventListenerOptions = {
  'enabled': true,
  'types': EVENTS,
  'callback': publishToMailbox
};
const storageOptions = {
  'enabled': true,
  'callback': publishToMailbox
};

function publishToMailbox(err, data) {
  if (err) {
    console.log(err);
  } else {
    const time = new Date().getTime();
    const topic = data.topic;
    data['timestamp'] = time;

    mailbox.publish(topic, data);
  }
}

const hooksAndOptions = [{
  'hook': EventListenerHook,
  'options': eventListenerOptions
}, {
  'hook': StorageHook,
  'options': storageOptions
}];

hooksAndOptions.forEach(x => {
  const hook = new x['hook']();
  hook.setOptions(x['options']);
});
