var inherits = require('inherits')
var mxtend = require('xtend/mutable')
var Store = require('./')

function Struct (init) {
    if (!(this instanceof Struct)) return new Struct(init)
    Store.call(this, init)
}
inherits(Struct, Store)

Struct.prototype._state = function (init) {
    return init
}

Struct.prototype.set = function (newState) {
    mxtend(this._state, newState)
    return this.publish()
}

Struct.extend = function (opts) {
    return Store.extend(opts, Struct)
}

module.exports = Struct

