# state

State container

## example

```js
var Store = require('../')
var xtend = require('xtend')
var assert = require('assert')

// you need to implement _state
// _state is deep cloned whenever we instantiate a new FooStore
var FooStore = Store.extend({
    _state: { foo: 'foo' },

    // **all methods should be synchronous**
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
var stop = fooStore.state(state => assert.equal(state.foo, 'baz'))
fooStore.setFoo('baz')
stop()


// `_state` can be a function that returns initial state
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


// -------- merge -------------

// emit a change event whenever one of the children changes
var merged = Store.Merge({
    foo: fooStore,
    bar: barStore
})

var unlisten = merged.state(function onChange (state) {
    console.log('merged', state)
    assert.deepEqual(state, {
        foo: { foo: 'aaaaa' },
        bar: { bar: 'baz' }
    })
})

fooStore.setFoo('aaaaa')

unlisten()


// -------- map -------------

var mapped = Store.map(function (state) {
    return xtend(state, {
        woo: 'woo'
    })
}, fooStore)

mapped.state(function onChange (state) {
    console.log('mapped', state)
    assert.deepEqual(state, { foo: 'hello', woo: 'woo' })
})

fooStore.setFoo('hello')

```
