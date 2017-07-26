import ProtectedEventEmitter from './ProtectedEventEmitter';
import aggregation from './aggregation';

'use const';

const nop = Function.prototype;

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

    static get layoutRegex () {
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

    _createShadow(layout = '', style = ''){
      const root = this._shadowRoot = this.attachShadow({mode: 'open'});
      this._translateLayout();
      this.properties.forEach(property => {
        layout = layout.replace(new RegExp(`{{\s${property.key}\s}}`,'g'), `<span class="replaceTo${property.key}"></span>`);
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

export default Directive;