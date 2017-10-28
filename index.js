var Bus = require('nanobus')
var CHANGE_EVENT = '_change'
var deepExtend = require('deep-extend')
var inherits = require('inherits')
var mxtend = require('xtend/mutable')

function Store (args) {
    if (!(this instanceof Store)) return new Store(args)
    this._bus = Bus()
    this._state = typeof this._state === 'function' ?
        this._state.apply(this, arguments) :
        deepExtend({}, this._state)
}

Store.prototype.publish = function () {
    this._bus.emit(CHANGE_EVENT, this._state)
    return this
}

Store.prototype.state = function (listener) {
    if (!listener) return this._state
    var self = this
    this._bus.on(CHANGE_EVENT, listener)
    return function removeListener () {
        self._bus.removeListener(CHANGE_EVENT, listener)
    }
}

Store.Merge = function (stores) {
    var newStore = Store()
    newStore._state = Object.keys(stores).reduce(function (acc, k) {
        acc[k] = stores[k]._state
        return acc
    }, {})

    Object.keys(stores).forEach(function (k) {
        newStore[k] = stores[k]
    })

    Object.keys(stores).forEach(function (k) {
        stores[k].state(onChange)
    })

    newStore.state = function (listener) {
        if (!listener) return newStore._state
        var unlisten = Store.prototype.state.call(newStore, listener)

        return function stopListening () {
            unlisten()
        }
    }

    function onChange () {
        newStore.publish()
    }

    return newStore
}

Store.map = function (predicate, store) {
    var newStore = Store()
    newStore._state = store._state
    store.state(function onChange (state) {
        newStore._state = predicate(state)
        newStore.publish()
    })
    return newStore
}

Store.extend = function (obj, _super) {
    obj = obj || {}
    _super = _super || Store
    function ExtendedStore (args) {
        if ( !(this instanceof ExtendedStore) ) return new ExtendedStore(args)
        _super.call(this, args)
    }
    inherits(ExtendedStore, _super)

    mxtend(ExtendedStore.prototype, obj)
    return ExtendedStore
}

module.exports = Store

