var S = require('pull-stream/pull')
var map = require('pull-stream/throughs/map')
var many = require('pull-many')
var Event = require('./event')

// take a hash of streams and return a namespaced stream
function muxObj (streams, muxer) {
    var _muxer = muxer || Event

    // return array of streams
    function namespace (streams) {
        var names = Object.keys(streams)
        return names.reduce(function (acc, n) {
            var stream = streams[n]
            var childKeys = Object.keys(stream)
            if (childKeys.length) {
                acc.push(S(
                    muxObj(stream, _muxer),
                    map(function (ev) {
                        return Event(n, ev)
                    })
                ))
            }

            if (typeof stream === 'function') {
                acc = acc.concat(S(
                    stream,
                    map(function (ev) {
                        return _muxer(n, ev)
                    })
                ))
            }
            return acc
        }, [])
    }

    var namespacedStreams = namespace(streams)
    return many(namespacedStreams)
}

module.exports = muxObj

