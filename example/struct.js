var Struct = require('../struct')
var assert = require('assert')

var myState = Struct({
    hello: 'world',
    foo: 'bar'
})

myState.set({ hello: 'ok' })

// should do a shallow merge
assert.deepEqual(myState.state(), {
    hello: 'ok',
    foo: 'bar'
})

