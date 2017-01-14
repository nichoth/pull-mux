// var S = require('pull-stream/pull')
var S = require('pull-stream')
// var pushable = require('pull-pushable')
var tee = require('pull-tee')
var pair = require('pull-pair')
// var Notify = require('pull-notify')
var filter = require('pull-stream/throughs/filter')
var map = require('pull-stream/throughs/map')
var Event = require('./event')
function noop () {}

function demux (source, keys) {
    var pairs = keys.map(function (k) {
        var p = pair()
        return { key: k, source: p.source, sink: p.sink }
    })

    var t = tee(pairs.map(function (p) {
        return S(
            S.filter(function (ev) {
                return Event.type(ev) === p.key
            }),
            S.map(function (ev) {
                return Event.data(ev)
            }),
            p.sink
        )
    }))

    var newSource = pairs.reduce(function (acc, p) {
        acc[p.key] = p.source
        return acc
    }, {})

    S(source, t, S.drain())
    return newSource
}

module.exports = demux
