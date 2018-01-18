var mxtend = require('xtend/mutable')
var Store = require('./')
var inherits = require('inherits')
var _ = {
    sortedLastIndexBy: require('lodash/sortedLastIndexBy'),
    remove: function remove (list, item) {
        var i = list.indexOf(item)
        if (i > -1) list.splice(i, 1)
        return list
    }
}

// abstract store for lists of things
function ListStore (args) {
    if (!(this instanceof ListStore)) return new ListStore(args)
    Store.call(this, args)
}
inherits(ListStore, Store)

mxtend(ListStore.prototype, {
    idKey: 'id',
    sortBy: 'id',

    _state: {
        data: {},
        sorted: [],
        hasFetched: false
    },

    add: function (item) {
        var self = this
        self._state.data[item[self.idKey]] = item
        var i = _.sortedLastIndexBy(self._state.sorted, item, function (item) {
            return item[self.sortBy]
        })
        self._state.sorted.splice(i, 0, item)
        return self.publish()
    },

    edit: function (newData) {
        mxtend(this._state.data[newData[this.idKey]], newData)
        return this.publish()
    },

    get: function (items) {
        var self = this
        this._state.hasFetched = true
        this._state.data = items.reduce(function (acc, ev) {
            acc[ev[self.idKey]] = ev
            return acc
        }, {})
        this._state.sorted = items
        return this.publish()
    },

    delete: function (item) {
        if (this._state.data[item[this.idKey]]) {
            var _item = this._state.data[item[this.idKey]]
            delete this._state.data[item[this.idKey]]
            _.remove(this._state.sorted, _item)
            return this.publish()
        }
        return this
    }
})

ListStore.containes = function (store, item) {
    return !!store._state.data[item[store.idKey]]
}

module.exports = ListStore

