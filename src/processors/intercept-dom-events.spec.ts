import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EventNotifier, EventReceiver } from '@proc7ts/fun-events';
import type { Mock } from 'jest-mock';
import { OnDomEvent, onDomEventBy } from '../on-dom-event';
import { interceptDomEvents } from './intercept-dom-events';

describe('interceptDomEvents', () => {

  let mockRegister: Mock<void, [EventReceiver.Generic<[Event]>, (AddEventListenerOptions | boolean)?]>;
  let onDomEvent: OnDomEvent<Event>;
  let mockListener: Mock<void, [Event]>;
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
    onDomEvent.do(interceptDomEvents)(mockListener);
    expect(mockRegister).toHaveBeenCalled();
  });
  it('prevents default', () => {
    onDomEvent.do(interceptDomEvents)(mockListener);

    const event = new KeyboardEvent('click');
    const stopImmediatePropagationSpy = jest.spyOn(event, 'stopImmediatePropagation');

    events.send(event);

    expect(stopImmediatePropagationSpy).toHaveBeenCalledWith();
    expect(mockListener).toHaveBeenCalledWith(event);
  });
});
