/**
 * Class representing an event manager
 */
export default class EventManager {

  #events = new Map<string, Listener[]>();

  /**
   * Listen to an event
   * @arg event The name of the event
   * @arg listeners Listeners to run when the event dispatches
   */
  listen(event: string, ...listeners: Listener[]) {
    if (listeners.length > 0) {
      const eventListeners = this.#events.get(event);
      eventListeners?.push(...listeners) ?? this.#events.set(event, listeners);
    }
    return this;
  }

  /**
   * Listen to an event once
   * @arg event The name of the event
   * @arg listeners Listeners to run when the event dispatches
   */
  listenOnce(event: string, ...listeners: Listener[]) {
    return this.listen(event, ...listeners.map((listener) => {
      const listenerOnce = (...args: unknown[]) => {
        this.deafen(event, listenerOnce);
        listener(...args);
      };
      return listenerOnce;
    }));
  }

  /**
   * Deafen an event
   * @arg event The name of the event
   * @arg listeners The listeners to remove
   */
  deafen(event: string, ...listeners: Listener[]) {
    const newListeners = this.#events.get(event)
      ?.filter((listener) => !listeners.includes(listener));
    if (newListeners) {
      if (newListeners.length < 1) {
        return this.deafenAll(event);
      }
      this.#events.set(event, newListeners);
    }
    return this;
  }

  /**
   * Deafen an entire event
   * @arg event The name of the event
   */
  deafenAll(event: string) {
    this.#events.delete(event);
    return this;
  }

  /**
   * Dispatch an event
   * @arg event The name of the event
   * @arg args Arguments to pass into the event's listeners
   */
  dispatch(event: string, ...args: unknown[]) {
    const listeners = this.#events.get(event);
    listeners?.forEach((listener) => listener(...args));
    return !!listeners;
  }

  /**
   * Determines if the provided event has listeners
   * @arg event The name of the event
   */
  hasListeners(event: string) {
    return this.#events.has(event);
  }
}

export type Listener = (...args: unknown[]) => void;
