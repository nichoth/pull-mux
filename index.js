var S = require('pull-stream/pull')
var map = require('pull-stream/throughs/map')
var many = require('pull-many')

// take a hash of streams and return a namespaced stream
function muxObj (streams, muxer) {
    var _muxer = muxer || Event
    var names = Object.keys(streams)
    var namespacedStreams = names.map(function (n) {
        return S(
            streams[n],
            map(function (ev) {
                return _muxer(n, ev)
            })
        )
    })
    var muxedStream = many(namespacedStreams)
    return muxedStream
}

function Event (type, data) {
    return [type, data]
}

module.exports = muxObj

