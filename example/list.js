var Store = require('../')
var ListStore = require('../list')
var assert = require('assert')

var Foos = Store.extend({
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

foos.add({ id: 3, hello: 'bar' })
assert.equal(foos.state().sorted[0].hello, 'bar')

foos.edit({ id: 3, hello: 'baz' })
assert.equal(foos.state().sorted[0].hello, 'baz')
assert.equal(foos.state().data['3'].hello, 'baz')

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


