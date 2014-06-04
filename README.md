# pull-fork

split chunks in a pull stream between multiple sinks,
with back pressure and handling all errors and abort.

## basic example

use an array of streams to write into.

``` js
pull(
  theIntegers,
  //fork is a sink, so it's the last thing in the pipeline.
  fork([
    evenSink, oddSink
  ], function (e) {
    return e%2 //return the index of the sink to send this to.
  })
)
```

## advanced example

use a function to create a sink streams on the fly.

``` js
pull(
  theIntegers,
  //fork is a sink, so it's the last thing in the pipeline.
  fork(function (e) {
    return e%2 //return the index of the sink to send this to.
  }, function (e) {
    return pull.collect(function (err, ary) {

    })
  })
)
```

## advanced example 2

read the first 10 even and odd integers to two collect streams.
`pull.take` will abort the source of the stream when it's test
returns falsey - `fork` will continue reading until all it's
sinks are aborted. Any subsequent data for an aborted stream
will be dropped.

``` js
pull(
  theIntegers,
  //fork is a sink, so it's the last thing in the pipeline.
  fork(function (data) {
    return data%2 //return the index of the sink to send this to.
  }, function (id) {
    return pull(
      pull.take(function (data) {
        return data < 20
      }),
      pull.collect(function (err, ary) {
        if(err) throw err
        console.log(ary)
      })
    )
  })
)
```


## License

MIT
