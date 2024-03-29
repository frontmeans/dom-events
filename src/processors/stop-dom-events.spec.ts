import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EventNotifier, EventReceiver } from '@proc7ts/fun-events';
import type { Mock } from 'jest-mock';
import { OnDomEvent, onDomEventBy } from '../on-dom-event.js';
import { stopDomEvents } from './stop-dom-events.js';

describe('stopDomEvents', () => {
  let mockRegister: Mock<
    (receiver: EventReceiver.Generic<[Event]>, options?: AddEventListenerOptions | boolean) => void
  >;
  let onDomEvent: OnDomEvent<Event>;
  let mockListener: Mock<(event: Event) => void>;
  let events: EventNotifier<[Event]>;

  beforeEach(() => {
    events = new EventNotifier();
    mockRegister = jest.fn((listener, _opts?) => {
      events.on(listener);
    });
    onDomEvent = onDomEventBy<Event>((c, opts) => mockRegister(c, opts));
    mockListener = jest.fn();
  });

  it('registers event listener', () => {
    onDomEvent.do(stopDomEvents)(mockListener);
    expect(mockRegister).toHaveBeenCalled();
  });
  it('prevents default', () => {
    onDomEvent.do(stopDomEvents)(mockListener);

    const event = new KeyboardEvent('click');
    const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

    events.send(event);

    expect(stopPropagationSpy).toHaveBeenCalledWith();
    expect(mockListener).toHaveBeenCalledWith(event);
  });
});
