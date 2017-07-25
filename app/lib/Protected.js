'use const';

export default class Protected {

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