//var tape = require('tape')
var pull = require('pull-stream')
var fork = require('../')
var assert = require('assert')
var interleave = require('interleavings')

interleave.test(function (async) {
  var n = 2, results = []

  function create (i) {
    return pull(
      //      async.through(),
            function (read) {
              return function (abort, cb) {
                return read(abort, function (end, data) {
                  async(cb)(end, data)
                })
              }
            },
            pull.collect(function (err, value) {
              if(err) throw err
              results[i] = value
              done()
            }))
  }

  var f = fork(
    function (data, sinks) {
      return data % 2
    },
    function (id, sinks) {
      console.log('createStream', id, sinks)
      throw new Error('do not call this')
    })

  f.add(0, create(0))
  f.add(1, create(1))

  pull(pull.values([1,2,3,4,5,6,7,8]), async.through(), f)

  var values

  function done () {
    if(--n) return
    assert.deepEqual(results, [
      [2, 4, 6, 8],
      [1, 3, 5, 7]
    ])
    async.done()
  }

})


