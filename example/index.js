var Store = require('../')
var assert = require('assert')

// you need to implement _state
// this is deep cloned whenever we instantiate FooStore
var FooStore = Store.extend({
    _state: { foo: 'foo' },

    setFoo: function (value) {
        this._state.foo = value
        return this.publish()
    }
})

var fooStore = FooStore()

// get state
var state = fooStore.state()
console.log('initial state', state)
assert.deepEqual(state, { foo: 'foo' })

// subscribe to changes
var stopListening = fooStore.state(function onChange (state) {
    console.log('new state', state)
    assert.equal(state.foo, 'bar')
})
fooStore.setFoo('bar')

// unsubscribe
stopListening()
fooStore.state(state => assert.equal(state.foo, 'baz'))
fooStore.setFoo('baz')


// _state can be a function that returns initial state
var BarStore = Store.extend({
    _state: function (init) {
        return { bar: init }
    },

    setBar: function (val) {
        this._state.bar = val
        return this.publish()
    }
})

var barStore = BarStore('baz')
assert.equal(barStore.state().bar, 'baz')


