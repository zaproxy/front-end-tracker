# Front-End Tracker

![](https://api.travis-ci.com/zaproxy/front-end-tracker.svg?branch=master)

Keep track of events that can happen in a webpage.

**Disclaimer:**
This add-on is not for web development. It is meant for testing web sites (debug, security). Its features may cause sites to break entirely, and which can cause privacy or even security issues. Use at your own risk.


## Installation

```bash
npm install --save @zaproxy/front-end-tracker
```

## Usage

When imported into a webpage, it exposes a `mailbox` variable in the global scope, which is a [PubSub object](https://github.com/mroderick/PubSubJS) with the following topics:
  * dom-events
  * storage

You can then react to these topics by subscribing to the `mailbox`.

For example, one can log DOM events' information using the following code:

```javascript
const topic = 'dom-events';
mailbox.subscribe(topic, (_, data) => {
  console.log(data);
});
```


#### Import in your application

##### If you use a Javascript bundler

Such as [webpack](https://webpack.github.io/), [rollup](https://rollupjs.org/guide/en), [browserify](http://browserify.org/), ...
All you need to do is to require this package in your application.

```bash
require('@zaproxy/front-end-tracker');
```


##### If you do not

There is a [pending feature request](https://github.com/zaproxy/front-end-tracker/issues/5) to make a bundled version of this package available from a CDN.


#### Import in any HTML page

You can use [ZAP](https://github.com/zaproxy/zaproxy/#-owasp-zap) to inject a bundle of this package in HTTP responses.

[inject.js](https://github.com/zaproxy/community-scripts/blob/master/httpsender/inject_js_in_html_page.js) is an HTTP Sender script (see more [here](https://github.com/zaproxy/community-scripts/tree/master/httpsender)) to inject any kind of Javascript content into webpages that interest us.

  * Install the `Script Console` from the add-on marketplace.
  * Install the `Community Scripts` from the add-on marketplace.
  * Bundle the tracker from the source
  ```bash
  git clone git@github.com:zaproxy/front-end-tracker.git
  cd front-end-tracker
  npm install
  npm run build
  ```
  * Copy the bundled content to the imported location: `cp dist/front-end-tracker.js /tmp/test.js`
  * Enable the `HTTP Sender > inject_js_in_html_page.js` script from ZAP's interface
