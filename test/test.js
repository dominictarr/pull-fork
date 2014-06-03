var pull = require('pull-stream')
var assert = require('assert')
var interleaving = require('interleavings')

var N = require('./util').N

var fork = require('../')

interleaving.test(function (async) {

  function p (read) {
    return function (abort, cb) {
      read(abort, async(cb))
    }
  }

  var s = N(2, done)

  pull(
    pull.values([1, 2, 3, 4, 5, 6, 7, 8]),
    fork([
      pull.collect(s()),
      pull.collect(s())
    ].map(p),
      function (e) { return (e + 1) % 2 }
    )
  )

  function done (err, ary) {
    var a = ary[0]
    var b = ary[1]

    assert.deepEqual(a, [1, 3, 5, 7])
    assert.deepEqual(b, [2, 4, 6, 8])

    console.log(a, b)
    async.done()
  }

}, function (err, results, stats) {
  console.error(results)
  assert.equal(stats.failures, 0)
})
