let timeout
const delayQuery = (fn, time) => {
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }
  time = time || 500
  timeout = setTimeout(fn, time)
}

export default delayQuery
