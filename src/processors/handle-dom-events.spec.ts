import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EventNotifier, EventReceiver } from '@proc7ts/fun-events';
import type { Mock } from 'jest-mock';
import { OnDomEvent, onDomEventBy } from '../on-dom-event.js';
import { captureDomEvents } from './capture-dom-events.js';
import { handleDomEvents } from './handle-dom-events.js';

describe('handleDomEvents', () => {
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

  describe('allow', () => {
    it('registers event listener', () => {
      onDomEvent.do(handleDomEvents())(mockListener);
      expect(mockRegister).toHaveBeenCalled();
    });
    it('passivates event listener by default', () => {
      onDomEvent.do(handleDomEvents())(mockListener);
      expect(mockRegister).toHaveBeenCalledWith(
        expect.anything() as unknown as EventReceiver.Generic<[Event]>,
        { passive: true },
      );
    });
    it('respects capturing registration', () => {
      onDomEvent.do(handleDomEvents())(mockListener, false);
      expect(mockRegister).toHaveBeenCalledWith(
        expect.anything() as unknown as EventReceiver.Generic<[Event]>,
        {
          passive: true,
          capture: false,
        },
      );
    });
    it('passivates event listener by default when options passed', () => {
      const opts: AddEventListenerOptions = {
        once: true,
        capture: true,
      };

      onDomEvent.do(handleDomEvents())(mockListener, opts);
      expect(mockRegister).toHaveBeenCalledWith(
        expect.anything() as unknown as EventReceiver.Generic<[Event]>,
        { ...opts, passive: true },
      );
    });
    it('respects non-passive options', () => {
      const opts: AddEventListenerOptions = {
        once: true,
        passive: false,
      };

      onDomEvent.do(handleDomEvents())(mockListener, opts);
      expect(mockRegister).toHaveBeenCalledWith(
        expect.anything() as unknown as EventReceiver.Generic<[Event]>,
        opts,
      );
    });
    it('combines with `captureDomEvents`', () => {
      onDomEvent.do(captureDomEvents, handleDomEvents())(mockListener);
      expect(mockRegister).toHaveBeenCalledWith(
        expect.anything() as unknown as EventReceiver.Generic<[Event]>,
        {
          capture: true,
          passive: true,
        },
      );
    });
  });

  describe('prevent', () => {
    it('registers event listener', () => {
      onDomEvent.do(handleDomEvents(false))(mockListener);
      expect(mockRegister).toHaveBeenCalled();
    });
    it('prevents default', () => {
      onDomEvent.do(handleDomEvents(false))(mockListener);

      const event = new KeyboardEvent('click');
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      events.send(event);

      expect(preventDefaultSpy).toHaveBeenCalledWith();
      expect(mockListener).toHaveBeenCalledWith(event);
    });
  });
});
