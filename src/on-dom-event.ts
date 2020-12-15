/**
 * @packageDocumentation
 * @module @frontmeans/dom-events
 */
import { eventReceiver, EventReceiver, OnEvent, OnEvent__symbol, onEventBy } from '@proc7ts/fun-events';
import { noop, Supply } from '@proc7ts/primitives';

/**
 * DOM event listener.
 *
 * DOM events are never recurrent.
 *
 * May be constructed using {@link onDomEventBy} function.
 *
 * @typeParam TEvent - Supported DOM event type.
 */
export type DomEventListener<TEvent extends Event> = EventReceiver<[TEvent]>;

/**
 * Signature of {@link EventSender} implementation able to register DOM event listeners.
 *
 * @typeParam TEvent - Supported DOM event type.
 */
export interface OnDomEvent<TEvent extends Event> extends OnEvent<[TEvent]> {

  /**
   * Starts sending DOM events to the given `listener`.
   *
   * @param listener - Target listener of DOM events.
   * @param opts - DOM event listener options to pass to `EventTarget.addEventListener()`.
   *
   * @returns A supply of DOM events from this sender to the given `listener`.
   */
  (listener: DomEventListener<TEvent>, opts?: AddEventListenerOptions | boolean): Supply;

}

/**
 * @internal
 * @hidden
 */
const OnDomEvent$sample = (/*#__PURE__*/ onEventBy<any>(noop));

/**
 * Converts a plain DOM event listener registration function to {@link OnDomEvent} sender.
 *
 * @typeParam TEvent - Supported DOM event type.
 * @param register - A generic DOM event listener registration function.
 *
 * @returns An {@link OnDomEvent} sender registering event listeners with the given `register` function.
 */
export function onDomEventBy<TEvent extends Event>(
    register: (
        this: void,
        listener: EventReceiver.Generic<[TEvent]>,
        opts?: AddEventListenerOptions | boolean,
    ) => void,
): OnDomEvent<TEvent> {

  const onDomEvent = ((listener: DomEventListener<TEvent>, opts?: AddEventListenerOptions | boolean): Supply => {

    const receiver = eventReceiver(listener);
    const { supply } = receiver;

    if (!supply.isOff) {
      register(receiver, opts);
    }

    return supply;
  }) as OnDomEvent<TEvent>;

  onDomEvent[OnEvent__symbol] = OnDomEvent$sample[OnEvent__symbol];
  onDomEvent.do = OnDomEvent$sample.do;
  onDomEvent.then = OnDomEvent$sample.then;

  return onDomEvent;
}
