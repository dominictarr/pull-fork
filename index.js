 'use strict';

//split one stream into two.
//if the stream ends, end both streams.
//if a reader stream aborts,
//continue to write to the other stream.

module.exports = function (sinks, select, create) {
  if('function' === typeof sinks) {
    create = select
    select = sinks
    sinks = []
  }

  var running = sinks.length
  var cbs     = new Array(running)
  var aborted = new Array(running)
  var open = false, ended, j, data, read, reading

  function init (key, reader) {
    reader(function (abort, cb) {
      if(abort) {
        aborted[key] = abort;
        --running
        cbs[key] = cb
        //if all sinks have aborted, abort the sink.
        if(!running) return pull(abort)
        //continue, incase we have already read something
        //for this stream. might need to drop that.
      }

      if(j === key) {
        var _j = j; j = null
        if(aborted[key]) return
        cb(null, data)
      }
      else if(ended) {
        return cb(ended)
      }
      else
        cbs[key] = cb

      pull()
    })
  }

  for(var k in sinks)
    init(k, sinks[k])

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
    if(reading || !read || j != null) return
    reading = true
    read(abort, function (end, _data) {
      reading = false
      var _j

      if(end) {
        ended = end
        return endAll()
      }
      else
        _j = select(_data, sinks)

      if(!sinks[_j]) {
        //edgecase: if select returns a new stream
        //          but user did not provide create?
        sinks[_j] = create(_j, sinks)
        //init will pass the sink read,
        //which will then grab data.
        //so we don't need to be in this callback anymore.
        j = _j
        data = _data
        return init(_j, sinks[_j])
      }

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
