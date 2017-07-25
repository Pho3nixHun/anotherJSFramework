'use const';

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

export default aggregation;
