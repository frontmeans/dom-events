import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EventNotifier, EventReceiver } from '@proc7ts/fun-events';
import type { Mock } from 'jest-mock';
import { OnDomEvent, onDomEventBy } from '../on-dom-event.js';
import { captureDomEvents } from './capture-dom-events.js';

describe('captureDomEvents', () => {
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
    onDomEvent.do(captureDomEvents)(mockListener);
    expect(mockRegister).toHaveBeenCalled();
  });
  it('captures events by default', () => {
    onDomEvent.do(captureDomEvents)(mockListener);
    expect(mockRegister).toHaveBeenCalledWith(
      expect.anything() as unknown as EventReceiver.Generic<[Event]>,
      true,
    );
  });
  it('respects non-capturing registration', () => {
    onDomEvent.do(captureDomEvents)(mockListener, false);
    expect(mockRegister).toHaveBeenCalledWith(
      expect.anything() as unknown as EventReceiver.Generic<[Event]>,
      false,
    );
  });
  it('captures events by default when options passed', () => {
    const opts: AddEventListenerOptions = {
      once: true,
      passive: true,
    };

    onDomEvent.do(captureDomEvents)(mockListener, opts);
    expect(mockRegister).toHaveBeenCalledWith(
      expect.anything() as unknown as EventReceiver.Generic<[Event]>,
      { ...opts, capture: true },
    );
  });
  it('respects non-capturing options', () => {
    const opts: AddEventListenerOptions = {
      once: true,
      capture: false,
    };

    onDomEvent.do(captureDomEvents)(mockListener, opts);
    expect(mockRegister).toHaveBeenCalledWith(
      expect.anything() as unknown as EventReceiver.Generic<[Event]>,
      opts,
    );
  });
});
