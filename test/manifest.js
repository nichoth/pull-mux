var test = require('tape')
var createManifest = require('../manifest')

test('create manifest', function (t) {
    t.plan(1)
    var manifest = createManifest({
        a: {
            aa: function () {},
            ab: function () {}
        },
        b: {
            bb: function () {}
        },
        c: {
            d: {
                e: function () {}
            }
        }
    })

    t.deepEqual(manifest, {
        a: ['aa', 'ab'],
        b: ['bb'],
        c: {
            d: ['e']
        }
    }, 'should serialize the tree')
})

