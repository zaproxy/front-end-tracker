# Front-End Tracker

![](https://api.travis-ci.com/Pamplemousse/front-end-tracker.svg?branch=master)

Keep track of events that can happen in a webpage.


## Usage

When imported into a webpage, it exposes a `mailbox` variable in the global scope, which is a [PubSub object](https://github.com/mroderick/PubSubJS) with the following topics:
  * dom-events
  * storage

You can then react to this topics by subscribing to the `mailbox`.

For example, one can log DOM events informations using the following code:

```javascript
const topic = 'dom-events';
mailbox.subscribe(topic, function(_, data) {
  console.log(data);
});
```


## Use with ZAP

#### inject in all responses

[inject.js](https://github.com/zaproxy/community-scripts/blob/master/httpsender/inject_js_in_html_page.js) is an HttpSender script (see more [here](https://github.com/zaproxy/community-scripts/tree/master/httpsender)) to inject any kind of Javascript content into webpages that interest us.

Requirements:

  * install the `script console` from the add-on marketplace
  * install the `community scripts` from the add-on marketplace

Replace `/tmp/test.js` by the **absolute path** of the generated `bundle.js` from this project.


## Build the app (standalone)

```
npm run build
```

  * [Browserify](https://github.com/browserify/browserify) takes care of generating the bundle to be injected into webpages.
  * [uglify-es](https://www.npmjs.com/package/uglify-es) takes care of minifying the bundle to be injected into webpages.

Then `dist/front-end-tracker.js` contains the application to be imported into the webpages you want to track.


## Dev

```
npm run watch
```

[Watchify](https://github.com/browserify/watchify) takes care of the rebuild on file changes and generates the `bundle.js` to be injected into webpages.


## Resources

  * [full list of DOM Events](https://developer.mozilla.org/en-US/docs/Web/Events)
  * [webcompat/tinker-tester-developer-spy](https://github.com/webcompat/tinker-tester-developer-spy): some hooks have been copy/pasted in the [hooks folder](https://github.com/zaproxy/front-end-tracker/tree/master/hooks).
