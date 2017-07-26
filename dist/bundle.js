
const nop = Function.prototype;
const aggregation = (base, ...mixins) => {

    /*  create aggregation class  */
    const aggregate = class __Aggregate extends base {
        constructor(...args) {
            /*  call base class constructor  */
            super(...args)

            /*  call mixin's initializer  */
            mixins.forEach((mixin) => {
                if (typeof mixin.prototype.initializer === "function")
                    mixin.prototype.initializer.apply(this, args)
            })
        }
    };

    /*  copy properties  */
    const copyProps = (target, source) => {
        Object.getOwnPropertyNames(source)
            .concat(Object.getOwnPropertySymbols(source))
            .forEach((prop) => {
                if (prop.match(/^(?:initializer|constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/))
                    return
                Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop))
            })
    }

    /*  copy all properties of all mixins into aggregation class  */
    mixins.forEach((mixin) => {
        copyProps(aggregate.prototype, mixin.prototype)
        copyProps(aggregate, mixin)
    })

    return aggregate
}

class Protected {

    get _proxyHandler() {
        return {
            get: (target, property) => {
                if (this._protectedFilter(property)) throw new Error(`Cannot get private property ${property} of ${target.constructor.name}`);
                else return target[property];
            },
            set: (target, property, value, receiver) => {
                if (this._protectedFilter(property)) throw new Error(`Cannot set private property ${property} of ${target.constructor.name}`);
                else target[property] = value;
            },
            has: (target, property) => {
                if (this._protectedFilter(property)) return false;
                else return property in target;
            },
            deleteProperty: (target, property) => {
                if (this._protectedFilter(property)) throw new Error(`Cannot delete private property ${property} of ${target.constructor.name}`);
                else return delete target[property];
            },
            ownKeys: target => Object.getOwnPropertyNames(target).filter(this._protectedFilter)
        }
    }

    _protectedFilter(propertyName) {
        return key[0] !== '_';
    }

    constructor() {
        return this.protected;
    }

    get protected() {
        return new Proxy(this, this._proxyHandler);
    }
}

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

class DirectiveCore extends aggregation(HTMLElement, ProtectedEventEmitter) {
    static get EVENTS() {
        return {
            PROPERTY_CHANGED: 'property.changed',
            PROPERTY_DELETED: 'property.deleted'
        }
    }

    get _proxyHandler() {
        return Object.assign(super._proxyHandler, {
            set: (target, property, newValue, receiver) => {
                if (property[0] === '_') throw new Error(`Cannot set private property ${property} of ${target.constructor.name}`);
                else {
                    const oldValue = target[property];
                    target[property] = newValue;
                    this.emit('property.changed', { property, newValue, oldValue });
                };
            },
            deleteProperty: (target, property) => {
                if (property[0] === '_') throw new Error(`Cannot delete private property ${property} of ${target.constructor.name}`);
                else {
                    const oldValue = target[property];
                    this.emit('property.deleted', { property, oldValue });
                    return delete target[property];
                }
            }
        });
    }

    _propertyChanged(evt) {
        const { onChange } = this.properties[evt.details.property] || {};
        if (onChange) onChange.call(this, evt.newValue, evt.oldValue);
    }

    _propertyDeleted(evt) {
        const { onDelete } = this.properties[evt.details.property] || {};
        if (onDelete) onDelete.call(this, evt.oldValue);
    }
}

class Directive extends DirectiveCore {

    static get layoutRegex() {
        return /{{.*}}/g;
    }

    constructor(layout, style, properties) {
        super();
        this.on(Directive.EVENTS.PROPERTY_CHANGED, this._propertyChanged);
        this.on(Directive.EVENTS.PROPERTY_DELETED, this._propertyDeleted);
        this._createShadow(layout, style)
        this._properties = properties;
        return this.protected;
    }

    _createShadow(layout = '', style = '') {
        const root = this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._translateLayout();
        this.properties.forEach(property => {
            layout = layout.replace(new RegExp(`{{\s${property.key}\s}}`, 'g'), `<span class="replaceTo${property.key}"></span>`);
        });
        root.innerHTML = `
        ${style}
        ${layout}
      `;
        this.properties.forEach(property => {
            [...root.getElementsByClassName(`replaceTo${property.key}`)]
                .forEach(node => node.replaceWith(property.textNode));
        });
    }

    _translateLayout() {
        if (this.properties) throw 'This instance is already initialized';
        this.properties = (layout.match(Directive.layoutRegex) || [])
            .filter(key = key in this._properties)
            .map(key => ({
                key,
                textNode: document.createTextNode(this._properties[key]),
                get value() {
                    return this.textNode.textContent;
                },
                set value(v) {
                    this.textNode.textContent = v;
                }
            }));
    }
}

const Layout = `
    <style>
        span {
            background-color: darkred;
            font-size: 18pt;
            color: white;
        }
    </style>
    <div>
        <span>{{ test }}</span>
        <span>Some static text</span>
    </div>
`;
const pho3nixTest = customElements.define('pho3nix-test', class extends Directive {
    constructor() {
        super(Layout);
    }

    get properties() {
        return {
            test: 'TaDa!'
        }
    }
});
