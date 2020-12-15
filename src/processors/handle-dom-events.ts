/**
 * @packageDocumentation
 * @module @frontmeans/dom-events
 */
import { eventReceiver } from '@proc7ts/fun-events';
import { DomEventListener, OnDomEvent, onDomEventBy } from '../on-dom-event';

/**
 * Creates a DOM events processor that enables or disables default DOM event handlers.
 *
 * @typeParam TEvent - DOM event type.
 * @param enable - Whether to enable default handlers. `true` to enable (default value, corresponds to specifying
 * `{ passive: true }` as a second argument to `EventTarget.addEventListener()`), or `false` to disable
 * (causes listeners to invoke an `Event.preventDefault()` method prior to event handling).
 *
 * @returns {@link OnDomEvent} mapper function.
 */
export function handleDomEvents<TEvent extends Event>(
    enable = true,
): (this: void, supplier: OnDomEvent<TEvent>) => OnDomEvent<TEvent> {
  return enable ? listenDomEventsPassively : preventDefaultDomEventHandler;
}

/**
 * @internal
 * @hidden
 */
function listenDomEventsPassively<TEvent extends Event>(supplier: OnDomEvent<TEvent>): OnDomEvent<TEvent> {
  return onDomEventBy((
      listener: DomEventListener<TEvent>,
      opts?: AddEventListenerOptions | boolean,
  ) => {
    if (opts == null) {
      return supplier(listener, { passive: true });
    }
    if (typeof opts === 'boolean') {
      return supplier(listener, { capture: opts, passive: true });
    }
    if (opts.passive == null) {
      return supplier(listener, { ...opts, passive: true });
    }

    return supplier(listener, opts);
  });
}

/**
 * @internal
 * @hidden
 */
function preventDefaultDomEventHandler<TEvent extends Event>(supplier: OnDomEvent<TEvent>): OnDomEvent<TEvent> {
  return onDomEventBy((
      listener: DomEventListener<TEvent>,
      opts?: AddEventListenerOptions | boolean,
  ) => {

    const receiver = eventReceiver(listener);

    return supplier(
        {
          supply: receiver.supply,
          receive(context, event) {
            event.preventDefault();
            receiver.receive(context, event);
          },
        },
        opts,
    );
  });
}
