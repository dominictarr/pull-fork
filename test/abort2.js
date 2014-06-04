
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

;interleave.test
(function h(async) {

  var n = 3
  var err = new Error('closes both streams')

  var aborted1, aborted2, ended, seen = []
  pull(
    pull.values([1,2,3,5,7]),
    async.through(),
    function (read) {
      return function (abort, cb) {
        read(abort, function (end, data) {
          if(data) seen.push(data)
          if(end) {ended = end; done()}
          cb(end, data)
        })
      }
    },
    fork([
      pull(
        async.through(),
        function (read) {
          read(null, function (err, data) {
            read(true, function (end) {
              //abort should wait until all the streams have ended
              //before calling back.
              aborted1 = end
              done()
            })
          })
        }),
      pull(
        async.through(),
        function (read) {
          read(null, function (err, data) {
            read(true, function (end) {
              //abort should wait until all the streams have ended
              //before calling back.
              aborted2 = end
              done()
            })
          })
        })
      ],
      function (e) { return (e+1)%2 }
    )
  )

  function done(err, ary) {
    if(--n) return
    //since each sink aborts after 1
    //item, we should have only read the first two items
    assert.deepEqual(seen, [1, 2])
    assert.ok(ended, 'source *must* end')
    if(!aborted1 || !aborted2)
      throw new Error('test failed')

    async.done()
  }

})//(interleave(1))
