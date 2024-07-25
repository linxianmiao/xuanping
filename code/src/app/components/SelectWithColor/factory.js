// 可选颜色
export const COLORS = ['#267BFF', '#3CB3FD', '#2EDDBD', '#3CD768', '#FFCD3D', '#FF8C3D', '#FF4848']

// 默认颜色
export const DEFAULT_COLOR = COLORS[0]

// 获取带颜色选项的classname
export const getColorItemClsName = color => {
  if (!color || typeof color !== 'string') {
    return `bg${DEFAULT_COLOR.slice(1)}`
  }

  if (color.indexOf('#') > -1) {
    return `bg${color.slice(1)}`
  }

  // 比如color='red'
  return `bg${color}`
}

// 判断两个值是否相等
export const isValueEqual = (a, b) => `${a}` === `${b}`
