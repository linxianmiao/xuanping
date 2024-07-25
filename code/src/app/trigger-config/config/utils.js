import * as R from 'ramda'

// 用来给mobx里的store设置属性
export const setProps = R.curry(
  (context, obj) => {
    const keys = Object.keys(obj)
    if (!keys) return
    keys.forEach(key => {
      if (key in context) {
        context[key] = obj[key]
      }
    })
  }
)
