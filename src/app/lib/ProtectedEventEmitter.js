import Protected from './Protected';

'use const';

class ProtectedEventEmitter extends Protected {
    constructor() {
        super();
        this._handlers = [];
        return this.protected;
    }

    _protectedFilter(propertyName) {
        return super._protectedFilter(propertyName) && ['emit'].indexOf(propertyName) === -1;
    }

    emit(event, details, target = this) {
        if (typeof event === 'string') event = new ProtectedEvent(event, target, details);
        this._handlers
            .filter(handler => handler.event === event.name)
            .find(handler => handler.fire(event));
        return event;
    }

    on(event, listener) {
        return this._handlers.push({
            event,
            fire(evt) {
                listener.call(evt.target, evt);
                return evt.ended;
            }
        })
    }

    once(event, listener) {
        let self = this;
        return this._handlers.push({
            event,
            fire(evt) {
                listener.call(evt.target, evt);
                self.removeListener(this);
                return evt.ended;
            }
        });
    }

    removeListener(listener) {
        this._handlers = this._handlers.filter(handler => listener !== handler);
    }

    removeAllListeners() {
        this._handlers = [];
    }

    listenerCount() {
        return this._handlers.length;
    }
}

class ProtectedEvent extends ProtectedEventEmitter {
    /**
     * 
     * @param {string} event 
     * @param {any} target 
     * @param {Object} details 
     */
    constructor(event, target, details) {
        super();
        this._event = event;
        this._details = details;
        this._target = target;
        return this.protected;
    }

    get target() {
        return this._target;
    }

    get event() {
        return this._event;
    }

    get name() {
        return this._event;
    }

    get details() {
        return this._details || {};
    }

    /**
     * Stops propagating the event.
     */
    end() {
        this._emit('ended', this);
        this._ended = true;
    }

    /**
     * Boolean value indicating if the propagation of event was stopped.
     */
    get ended() {
        return this._ended;
    }
}

export default ProtectedEventEmitter;
