import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EventNotifier, EventReceiver, onceOn, supplyOn } from '@proc7ts/fun-events';
import { neverSupply, Supply } from '@proc7ts/supply';
import type { Mock, SpyInstance } from 'jest-mock';
import { OnDomEvent, onDomEventBy } from './on-dom-event';

describe('OnDomEvent', () => {

  let mockRegister: Mock<(
      receiver: EventReceiver.Generic<[Event]>,
      options?: AddEventListenerOptions | boolean,
  ) => void>;
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

  describe('onceOn', () => {

    let supply: Supply;
    let offSpy: SpyInstance<(reason?: unknown) => Supply>;

    beforeEach(() => {
      mockRegister = jest.fn(receiver => {
        events.on(receiver);
        supply = receiver.supply;
        offSpy = jest.spyOn(supply, 'off');
      });
    });

    it('registers event receiver', () => {
      expect(onDomEvent.do(onceOn)(mockListener)).toBe(supply);
      expect(mockRegister).toHaveBeenCalled();
    });
    it('unregisters notified event receiver', () => {
      onDomEvent.do(onceOn)(mockListener);
      expect(offSpy).not.toHaveBeenCalled();

      const event = new KeyboardEvent('click');

      events.send(event);
      expect(mockListener).toHaveBeenCalledWith(event);
      expect(offSpy).toHaveBeenCalled();
    });
    it('unregisters immediately notified event receiver', () => {

      const event = new KeyboardEvent('click');

      mockRegister.mockImplementation(receiver => {
        events.on(receiver);
        supply = receiver.supply;
        offSpy = jest.spyOn(supply, 'off');
        events.send(event);
      });

      onDomEvent.do(onceOn)(mockListener);

      expect(offSpy).toHaveBeenCalled();
      expect(mockListener).toHaveBeenCalledWith(event);
    });
    it('never sends events if their supply is initially cut off', () => {

      const event = new KeyboardEvent('click');

      supply = neverSupply();
      onDomEvent.do(onceOn)({ supply, receive: (_context, e) => mockListener(e) });
      events.send(event);
      expect(mockListener).not.toHaveBeenCalled();
    });
    it('never sends events after their supply is cut off', () => {
      onDomEvent.do(onceOn)(mockListener).off();
      events.send(new KeyboardEvent('click'));
      expect(mockListener).not.toHaveBeenCalled();
    });
    it('sends only one event', () => {
      onDomEvent.do(onceOn)(mockListener);

      const event1 = new KeyboardEvent('keydown');

      events.send(event1);
      events.send(new KeyboardEvent('keyup'));
      expect(mockListener).toHaveBeenCalledTimes(1);
      expect(mockListener).toHaveBeenLastCalledWith(event1);
    });
  });

  describe('supplyOn', () => {

    let supply: Supply;
    let offSpy: Mock<(reason?: unknown) => void>;
    let requiredSupply: Supply;

    beforeEach(() => {
      mockRegister = jest.fn(receiver => {
        events.on(receiver);
        supply = receiver.supply;
        supply.whenOff(offSpy = jest.fn());
      });
      requiredSupply = new Supply();
    });

    it('sends original events', () => {

      const event1 = new KeyboardEvent('keydown');
      const event2 = new KeyboardEvent('keyup');

      onDomEvent.do(supplyOn(requiredSupply))(mockListener);
      events.send(event1);
      events.send(event2);

      expect(mockListener).toHaveBeenCalledWith(event1);
      expect(mockListener).toHaveBeenLastCalledWith(event2);
    });
    it('does not send any events if required supply is initially cut off', () => {

      const event = new KeyboardEvent('click');
      const whenOff = jest.fn();

      onDomEvent.do(supplyOn(neverSupply()))(mockListener).whenOff(whenOff);
      events.send(event);
      expect(mockListener).not.toHaveBeenCalled();
      expect(whenOff).toHaveBeenCalled();
    });
    it('no longer sends events after original supply is cut off', () => {

      const event1 = new KeyboardEvent('keydown');
      const event2 = new KeyboardEvent('keyup');
      const whenOff = jest.fn();

      onDomEvent.do(supplyOn(requiredSupply))(mockListener).whenOff(whenOff);
      events.send(event1);
      supply.off('reason');
      events.send(event2);

      expect(mockListener).toHaveBeenLastCalledWith(event1);
      expect(mockListener).toHaveBeenCalledTimes(1);
      expect(whenOff).toHaveBeenCalledWith('reason');
      expect(offSpy).toHaveBeenCalledWith('reason');
    });
    it('no longer sends events after required supply is cut off', () => {

      const event1 = new KeyboardEvent('keydown');
      const event2 = new KeyboardEvent('keyup');
      const whenOff = jest.fn();

      onDomEvent.do(supplyOn(requiredSupply))(mockListener).whenOff(whenOff);
      events.send(event1);
      requiredSupply.off('reason');
      events.send(event2);

      expect(mockListener).toHaveBeenLastCalledWith(event1);
      expect(mockListener).toHaveBeenCalledTimes(1);
      expect(whenOff).toHaveBeenCalledWith('reason');
      expect(offSpy).toHaveBeenCalledWith('reason');
    });
  });

});
