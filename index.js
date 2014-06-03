 'use strict';

//split one stream into two.
//if the stream ends, end both streams.
//if a reader stream aborts,
//continue to write to the other stream.

module.exports = function (sinks, select) {
  var cbs = new Array(sinks.length), ended, j, data, read, reading
  var aborted = new Array(sinks.length)
  var running = sinks.length

  sinks.map(function (reader, i) {
    reader(function (abort, cb) {
      if(abort) {
        aborted[i] = abort;
        --running
        cbs[i] = cb
        //if all sinks have aborted, abort the sink.
        if(!running) return pull(abort)
        //continue, incase we have already read something
        //for this stream. might need to drop that.
      }
      if(j === i) {
        var _j = j
        j = null
        //
        if(aborted[i]) return
        cb(null, data)
      }
      else if(ended)
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

  function pull (abort) {
    if(reading || !read) return
    reading = true
    read(abort, function (end, _data) {
      reading = false
      var _j
      if(end) {
        ended = end
        return endAll()
      }
      else
        _j = select(_data)

      if(cbs[_j]) {
        if(!abort && aborted[_j]) return pull()

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
