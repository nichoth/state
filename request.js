var AbstractStore = require('./')
var inherits = require('inherits')

function RequestState () {
    if (!(this instanceof RequestState)) return new RequestState()
    AbstractStore.call(this)
}
inherits(RequestState, AbstractStore)

RequestState.prototype._state = {
    resolving: {},
    errors: {},
    isResolving: false
}

RequestState.prototype.start = function (data) {
    this._state.resolving[data.cid] = data
    this._state.isResolving = true
    return this.publish()
}

RequestState.prototype.error = function (data) {
    this._state.errors[data.cid] = data
    delete this._state.resolving[data.cid]
    this._state.isResolving = !!Object.keys(this._state.resolving).length
    return this.publish()
}

RequestState.prototype.clearError = function (cid) {
    delete this._state.errors[cid]
    return this.publish()
}

RequestState.prototype.resolve = function (data) {
    delete this._state.resolving[data.cid]
    this._state.isResolving = !!Object.keys(this._state.resolving).length
    return this.publish()
}

module.exports = RequestState

