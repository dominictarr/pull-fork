//var tape = require('tape')
var pull = require('pull-stream')
var fork = require('../')
var assert = require('assert')
var interleave = require('interleavings')

interleave.test(function (async) {
  var n = 2, results = []

  var f = fork(
    function (data, sinks) {
      return data % 2
    },
    function (i, sinks) {
      return pull(
              async.through(),
              pull.collect(function (err, value) {
                if(err) throw err
                results[i] = value
                done()
              }))
    })

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

interleave.test(function (async) {
  var n = 2, results = []

  var f = fork(
    function (data, sinks) {
      return data % 2
    },
    function (i, sinks) {
      return pull(
              async.through(),
              pull.collect(function (err, value) {
                if(err) throw err
                results[i] = value
                done()
              }))
    })

  pull(pull.values([]), async.through(), f)

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

