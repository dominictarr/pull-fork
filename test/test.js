var pull = require('pull-stream')
var assert = require('assert')
var interleaving = require('interleavings')

var N = require('./util').N

var fork = require('../')

interleaving.test(function (async) {

  var done = async(function done (err, ary) {
    var a = ary[0]
    var b = ary[1]

    assert.deepEqual(a, [1, 3, 5, 7])
    assert.deepEqual(b, [2, 4, 6, 8])

    async.done()
  })

  var s = N(2, done)

  pull(
    pull.values([1, 2, 3, 4, 5, 6, 7, 8]),
    async.through('C'),
    fork([
      pull(async.through('A'), pull.collect(s())),
      pull(async.through('B'), pull.collect(s()))
    ],
      function (e) { return (e + 1) % 2 }
    )
  )


})
