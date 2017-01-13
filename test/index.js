var test = require('tape')
var S = require('pull-stream')
var mux = require('../')
var SS = require('../pipe')

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


test('pass in a mux function', function (t) {
    t.plan(2)
    var streams = {
        a: S.values([1,2]),
        b: S.values([3,4])
    }
    var stream = mux(streams, function muxer (type, ev) {
        return { type: type, data: ev }
    })

    S(
        stream,
        S.collect(function (err, res) {
            t.error(err)
            t.deepEqual(res, [
                { type: 'a', data: 1 },
                { type: 'b', data: 3 },
                { type: 'a', data: 2 },
                { type: 'b', data: 4 },
            ], 'should use the given map function')
        })
    )
})

test('nested object', function (t) {
    t.plan(2)
    var dx = {
        a: S.values([1]),
        b: {
            c: S.values([2])
        }
    }
    var muxed = mux(dx)
    S(
        muxed,
        S.collect(function (err, res) {
            t.error(err)
            t.deepEqual(res, [
                ['a', 1],
                ['b', ['c', 2]]
            ], 'should mux nested object')
        })
    )
})

test('mux streams that have children', function (t) {
    t.plan(2)
    var b = S.values([2])
    b.c = S.values([3])
    var dx = {
        a: S.values([1]),
        b: b
    }
    var muxed = mux(dx)
    S(
        muxed,
        S.collect(function (err, res) {
            t.error(err)
            t.deepEqual(res, [
                ['a', 1],
                ['b', 2],
                ['b', ['c', 3]]
            ], 'should mux functions with keys')
        })
    )
})

test('demuxed pipe', function (t) {
    t.plan(4)
    var demuxed = {
        a: S.values([1,2]),
        b: S.values([3,4]),
    }
    var sink = {
        a: S.collect(function (err, res) {
            t.error(err)
            t.deepEqual(res, [1,2], 'should pipe by key')
        }),
        b: S.collect(function (err, res) {
            t.error(err)
            t.deepEqual(res, [3,4], 'should pipe by key')
        })
    }
    SS( demuxed, sink )
})

test('invalid demuxed streams', function (t) {
    t.plan(1)
    var demuxed = {
        a: S.values([1,2]),
        b: S.values([3,4]),
    }
    var sink = {
        b: S.collect(function (err, res) {
            t.fail('should not stream this')
        })
    }
    function pipe () {
        SS( demuxed, sink )
    }
    t.throws(pipe, 'should throw if the sink does\'t have all keys')
})

test("it's ok if through objects don't have all keys", function (t) {
    t.plan(4)
    var demuxed = {
        a: S.values([1,2]),
        b: S.values([3,4]),
    }
    var map = {
        a: S.map(function (n) { return n + 10 })
    }
    var sink = {
        a: S.collect(function (err, res) {
            t.error(err)
            t.deepEqual(res, [11,12], 'should map one key')
        }),
        b: S.collect(function (err, res) {
            t.error(err)
            t.deepEqual(res, [3,4], 'should not map this key')
        })
    }
    SS( demuxed, map, sink )
})

test('return a new source', function (t) {
    t.plan(4)
    var demuxed = {
        a: S.values([1,2]),
        b: S.values([3,4]),
    }
    var map = {
        a: S.map(function (n) { return n + 10 }),
        b: S.map(function (n) { return n + 1 })
    }
    var sink = {
        a: S.collect(function (err, res) {
            t.error(err)
            t.deepEqual(res, [11,12], 'should return new source')
        }),
        b: S.collect(function (err, res) {
            t.error(err)
            t.deepEqual(res, [4,5], 'should return new source')
        })
    }
    var newSource = SS( demuxed, map )
    SS( newSource, sink )
})

