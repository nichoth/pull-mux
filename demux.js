var S = require('pull-stream/pull')
var filter = require('pull-stream/filter')
var Event = require('./event')
function noop () {}

function demux (stream, manifest) {
    var cb = typeof manifest === 'function' ?
        manifest :
        noop
    var hasCb = cb !== noop
    if (!hasCb) return createDemuxed(manifest)
    S(
        stream,
        S.take(1),
        S.collect(function (err, res) {
            if (err) return cb(err)
            cb(null, createDemuxed(res[0]))
        })
    )
}

function createDemuxed (manifest) {
    if (Array.isArray(manifest)) {
        return manifest.map(function (node) {
            return filter(function (ev) {
                return Event.type(ev) === node
            })
        })
    }
    // is object
    return Object.keys(manifest).reduce(function (acc, k) {
        acc[k] = createDemuxed(manifest[k])
        return acc
    }, {})
}

module.exports = demux
