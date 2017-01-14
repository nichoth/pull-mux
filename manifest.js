// take an object whos leaf nodes are functions
// return an object whos leaves are arrays of key names of fns
function keys (obj) {
    var ks = Object.keys(obj)
    var child = obj[ks[0]]
    if (typeof child !== 'object') return ks
    return ks.reduce(function (acc, k) {
        acc[k] = keys(obj[k])
        return acc
    }, {})
}

module.exports = keys

