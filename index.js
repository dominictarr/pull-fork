'use strict';

//split one stream into two.
//if the stream ends, end both streams.
//if a reader stream aborts,
//continue to write to the other stream.

module.exports = function (sinks, select) {
  var cbs = new Array(sinks.length), ended, j, data, read, reading

  sinks.map(function (reader, i) {
    reader(function (abort, cb) {
      console.error('read', i, j)
      if(j === i) {
        var _j = j
        j = null
        cb(null, data)
      } else if(ended)
        return cb(ended)
      else
        cbs[i] = cb
      pull()
    })
  })

  function endAll () {
    for(var k in cbs) {
      if(cbs[k]) {
        var cb = cbs[k]
        cbs[k] = null
        cb (ended)
      }
    }
  }

  function pull () {
    if(reading || !read) return
    reading = true
    read(null, function (end, _data) {
      reading = false
      console.log('route to', _j, cbs)
      var _j
      if(end) {
        ended = end
        return endAll()
      }
      else
        _j = select(_data)

      if(cbs[_j]) {
        var cb = cbs[_j]
        cbs[_j] = null
        cb(null, _data)
      } else {
        j = _j
        data = _data
      }
    })
  }

  return function (_read) {
    read = _read
    pull()
  }

}
