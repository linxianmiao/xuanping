const setProps = context => obj => {
  for (const key of _.keys(obj)) {
    context[key] = obj[key]
  }
}

export default setProps