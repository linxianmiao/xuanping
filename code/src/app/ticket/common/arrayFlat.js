function arrayFlat(arr) {
  if (!_.isArray(arr)) {
    throw new Error('传入的不是数组')
  }
  return arr.reduce((prev, item) => {
    return _.isArray(item) ? [...prev, ...arrayFlat(item)] : [...prev, item]
  }, [])
}

export default arrayFlat