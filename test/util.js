exports.N = function N (n, cb) {
  var result = [], error
  var i = 0
  function done () {
    if(--n) return
    cb(error, result)
  }
  return function () {
    var j = i ++
    return function (err, value) {
      error = error || err; result[j] = value; done()
    }
  }
}


