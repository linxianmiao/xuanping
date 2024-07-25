// 默认的几个优先级颜色： 依次是 1-极低, 2-低, 3-中, 4-高, 5-极高
export const defaultPriorityColors = ['#B3C1D4', '#76DD6C', '#fad541', '#FF794C', '#FB4D4A']
// 自定义一些颜色
export const customColor = [
  '#267BFF',
  '#3CB3FD',
  '#2EDDBD',
  '#3CD768',
  '#FFCD3D',
  '#FF8C3D',
  '#FF4848',
  '#ff0000',
  '#ff522a',
  '#ffae2f',
  '#fadc23',
  '#fdd74a',
  '#2db7f5',
  '#52edcb',
  '#5be570',
  '#58b7af',
  '#88aeaf'
]

export const allColor = [].concat(defaultPriorityColors, customColor)
// 优先级自定义
const mockData = [
  {
    color: defaultPriorityColors[0],
    name: '极低',
    value: '1'
  },
  {
    color: defaultPriorityColors[1],
    name: '低',
    value: '2'
  },
  {
    color: defaultPriorityColors[2],
    name: '中',
    value: '3'
  },
  {
    color: defaultPriorityColors[3],
    name: '高',
    value: '4'
  },
  {
    color: defaultPriorityColors[4],
    name: '极高',
    value: '5'
  }
]

export const getPriorityList = (data = []) => {
  if (!Array.isArray(data.color) || !data.color.length) return mockData
  return data.color.map(({ label, color, priority }, i) => {
    return {
      name: label,
      value: priority,
      // 如果没有开启自定义颜色，就沿用前端写死的颜色来
      color: data.isChooseColor ? color : allColor[priority - 1] || allColor[i]
    }
  })
}
