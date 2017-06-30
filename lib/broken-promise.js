'use strict'

function BrokenPromise (promises, timeout) {
  let unwrap = !(promises instanceof Array)
  if (unwrap) {
    promises = [promises]
  }

  let isTimedOut = false
  let results = Array(promises.length).fill(new Error('ETIMEOUT'))

  function setValue (v, i) {
    if (!isTimedOut) {
      results[i] = v
    }
  }

  return new Promise((resolve, reject) => {
    function timedOut () {
      isTimedOut = true
      resolve(unwrap ? results[0] : results)
    }

    let timeoutHandle = setTimeout(timedOut, timeout)

    Promise.all(
      promises.map((p, i) =>
        p.then(v => setValue(v, i))
          .catch(e => setValue(e instanceof Error ? e : new Error(e), i))
      )
    ).then(data => {
      if (!isTimedOut) {
        clearTimeout(timeoutHandle)
        timedOut()
      }
    })
  })
}

module.exports = BrokenPromise
