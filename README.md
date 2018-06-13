# old school mutable state

Abstract state container

This package provides minimal prototypes for creating state machines. The core is `index.js`, a class with 2 methods for subscribing to changes and publishing updates. All children inherit from this.

Sorted lists are also included here in `list.js`, which has methods for basic crud operations.

`struct.js` is a simple observable object.

There are several utility functions also -- `extend`, a helper for inheriting, `Merge`, which composes multiple state machines, and `map`.

## install 

    $ npm install @nichoth/state


## example

### inherit from this module

```js
var Store = require('../')
var xtend = require('xtend')
var assert = require('assert')

// you need to implement _state
// if _state is an object, it is deep cloned whenever we instantiate a
// new FooStore
// _state can also be a function that returns a new object. It will
// be called during construction
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
```

### State.Merge

Compose multiple state machines, and get change events whenever one of
them changes

```js
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
```

### State.map

Take an existing store and return a new store that is mapped
by a predicate function

```js
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

### struct
A simple observable object with one method, `.set`.

```js
var Struct = require('@nichoth/state/struct')
var assert = require('assert')

var myState = Struct({
    hello: 'world',
    foo: 'bar'
})

// do a shallow merge
myState.set({ hello: 'ok' })

assert.deepEqual(myState.state(), {
    hello: 'ok',
    foo: 'bar'
})
```

### List
A sorted list of objects

```js
var Store = require('../')
var ListStore = require('../list')
var assert = require('assert')

var Foos = Store.extend({
    // these are required
    idKey: 'id',
    sortBy: 'hello',
}, ListStore)

var foos = Foos()

console.log(foos.state())
assert.deepEqual(foos.state(), {
    data: {},
    sorted: [],
    hasFetched: false
})
```

#### list.get(array) => list

Set this store's list of sorted data
```js
// the get method assumes the list is *already* sorted
foos.get([{ id: 2, hello: 'ham' }, { id: 1, hello: 'world' }])
console.log(foos.state())
assert.deepEqual(foos.state(), {
    data: {
        '1': { id: 1, hello: 'world' },
        '2': { id: 2, hello: 'ham' }
    },
    sorted: [ { id: 2, hello: 'ham' }, { id: 1, hello: 'world' } ],
    hasFetched: true
})
```

#### list.add(object) => list

Add an element in the correct sorted position
```js
foos.add({ id: 3, hello: 'bar' })
assert.equal(foos.state().sorted[0].hello, 'bar')
```

#### list.edit(object) => list

Lookup an object by id, and update the given properties
```js
foos.edit({ id: 3, hello: 'baz' })
assert.equal(foos.state().sorted[0].hello, 'baz')
assert.equal(foos.state().data['3'].hello, 'baz')
```

#### list.delete(object) => list

Lookup an object by id and delete it from the store
```js
foos.delete({ id: 2 })
console.log(foos.state())
assert.deepEqual(foos.state(), {
    data: {
        '1': { id: 1, hello: 'world' },
        '3': { id: 3, hello: 'baz' }
    },
    sorted: [ { id: 3, hello: 'baz' }, { id: 1, hello: 'world' } ],
    hasFetched: true
})
```

