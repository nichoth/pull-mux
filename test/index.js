var test = require('tape')
var S = require('pull-stream')
var mux = require('../')

test('create a namespaced stream from an object', function (t) {
    t.plan(2)
    var streams = {
        a: S.values([1,2,3]),
        b: S.values([4,5,6])
    }
    var stream = mux(streams)

    S(
        stream,
        S.collect(function (err, res) {
            t.error(err)
            t.deepEqual(res, [
                ['a', 1],
                ['b', 4],
                ['a', 2],
                ['b', 5],
                ['a', 3],
                ['b', 6]
            ], 'should namespace the events')
        })
    )
})
