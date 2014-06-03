# pull-fork

split chunks in a pull stream between multiple sinks,
with back pressure and handling all errors and abort.

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

## License

MIT
