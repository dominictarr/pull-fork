
var N = require('./util').N
var pull = require('pull-stream')
var cat = require('pull-cat')
var fork = require('../')
var interleave = require('interleavings')
var assert = require('assert')

function error (err) {
  return function (abort, cb) {
    cb(err)
  }
}

interleave.test(function (async) {

  var n = 2
  var err = new Error('closes both streams')

  var ary1, aborted2
  pull(
    pull.values([1,2,3,5,7]),
    async.through(),
    fork([
      pull(
        async.through(),
        pull.collect(function (err, ary) {
          ary1 = ary
          done()
        })), 
      pull(
        async.through(),
        function (read) {
          read(null, function (err, data) {
            read(true, function () {
              aborted2 = true
              done()
            })
          })
        }
      )],
      function (e) { return (e+1)%2 }
    )
  )

  function done(err, ary) {
    if(--n) return
    console.log(aborted2, ary1)
    assert.deepEqual(ary1, [1, 3, 5, 7])
    if(!aborted2 || !ary1)
      throw new Error('test failed')

    async.done()
  }

})
