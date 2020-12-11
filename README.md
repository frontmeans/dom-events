Functional DOM Events Processor 
===============================

[![NPM][npm-image]][npm-url]
[![Build Status][build-status-img]][build-status-link]
[![codecov][codecov-image]][codecov-url]
[![GitHub Project][github-image]][github-url]
[![API Documentation][api-docs-image]][api-docs-url]

Extension of [@proc7ts/fun-events] for DOM event processing in reactive style.

[npm-image]: https://img.shields.io/npm/v/@frontmeans/dom-events.svg?logo=npm
[npm-url]: https://www.npmjs.com/package/@frontmeans/dom-events
[build-status-img]: https://github.com/frontmeans/dom-events/workflows/Build/badge.svg
[build-status-link]: https://github.com/frontmeans/dom-events/actions?query=workflow%3ABuild
[codecov-image]: https://codecov.io/gh/frontmeans/dom-events/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/frontmeans/dom-events
[github-image]: https://img.shields.io/static/v1?logo=github&label=GitHub&message=project&color=informational
[github-url]: https://github.com/frontmeans/dom-events
[api-docs-image]: https://img.shields.io/static/v1?logo=typescript&label=API&message=docs&color=informational
[api-docs-url]: https://frontmeans.github.io/dom-events/index.html

[@proc7ts/fun-events]: https://www.npmjs.com/package/@proc7ts/fun-events


DOM Events
----------

DOM events are supported by `OnDomEvent` and `DomEventDispatcher`.

`OnDomEvent` extends an `OnEvent` sender with DOM-specific functionality. It sends DOM `Events` to `DomEventListener`s

`DomEventDispatcher` can be attached to arbitrary `EventTarget`. It constructs an `OnDomEvent` senders for each event
type and dispatches DOM events.

```typescript
import { DomEventDispatcher } from '@frontmeans/dom-events';

const dispatcher = new DomEventDispatcher(document.getElementById('my-button'));

dispatcher.on('click')(submit);
dispatcher.dispatch(new MouseEvent('click'));
```

### DOM-specific Actions

Along with basic API this library provides DOM-specific actions.


#### `captureDomEvents()`

Creates an `OnDomEvent` sender that enables event capturing by default.

This corresponds to specifying `true` or `{ capture: true }` as a second argument to `EventTarget.addEventListener()`.

```typescript
import { captureDomEvents, DomEventDispatcher } from '@frontmeans/dom-events';

const container = document.getElementById('my-container');

// Clicking on the inner elements would be handled by container first.
new DomEventDispatcher(container).on('click').do(captureDomEvents)(handleContainerClick);

// The above is the same as
container.addEventListener('click', handleContainerClick, true);
```


### `handleDomEvents()`

Creates a DOM event sender mapper function that enables or disables default DOM event handlers.

Corresponds to specifying `{ passive: true }` as a second argument to `EventTarget.addEventListener()` when
`true` passed as parameter, or no parameters passes.

```typescript
import { DomEventDispatcher, handleDomEvents } from '@frontmeans/dom-events';

// Scrolling events won't be prevented.
new DomEventDispatcher(document.body).on('scroll').do(handleDomEvents())(handleScroll);

// The above is the same as
document.body.addEventListener('scroll', handleScroll, { passive: true });
```

Causes listeners to invoke an `Event.preventDefault()` method prior to event handling when `false` passed as parameter.

```typescript
import { DomEventDispatcher, handleDomEvents } from '@frontmeans/dom-events';

// Clicking on the link won't lead to navigation.
new DomEventDispatcher(document.getElementById('my-href')).on('click').do(handleDomEvents(false))(doSomething);

// The above is the same as
document.getElementById('my-href').addEventListener('click', event => {
  event.preventDefault();
  doSomething(event);
});
```


#### `interceptDomEvents()`

Creates an `OnDomEvent` sender preventing other listeners of the same event from being called.

Causes listeners to invoke an [Event.stopImmediatePropagation()] method prior to event handing.

```typescript
import { DomEventDispatcher, interceptDomEvents } from '@frontmeans/dom-events';

const dispatcher = new DomEventDispatcher(document.getElementById('my-div'))
const onClick = dispatcher.on('click');

// The ascendants won't receive a click the div.
onClick.do(interceptDomEvents)(() => console.log('1')); // This is the last handler 
onClick(() => console.log('2'));                        // This one won't be called

dispatcher.dispatch(new MouseEvent('click')); // console: 1

// The first listener registration above is the same as
document.getElementById('my-div').addEventListener('click', event => {
  event.stopImmediatePropagation();
  console.log('1');
});
```

[Event.stopImmediatePropagation()]: https://developer.mozilla.org/en-US/docs/Web/API/Event/stopImmediatePropagation


#### `stopDomEvents()`

Creates an {@link OnDomEvent} sender preventing further propagation of events in the capturing and bubbling phases.

Causes listeners to invoke an [Event.stopPropagation()] method prior to event handing.

```typescript
import { DomEventDispatcher, stopDomEvents } from '@frontmeans/dom-events';

// The ascendants won't receive a click the div.
new DomEventDispatcher(document.getElementById('my-div')).on('click').do(stopDomEvents)(handleClick);

// The above is the same as
document.getElementById('my-div').addEventListener('click', event => {
  event.stopPropagation();
  handleClick(event);
});
```

[Event.stopPropagation()]: https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation
