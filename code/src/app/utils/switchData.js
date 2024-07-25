
const classOf = o => Object.prototype.toString.call(o).slice(8, -1)

// 将复杂数据结构按照给定的模版数据转换
// 基本数据类型不能转换
// 一定要注意模版的数据类型，如果模版定义错误，可能会得到意料之外的结果
export default function switchData(source, template) {
  // 不是对象、数组、null、的直接返回
  if (source === null) return typeof template === 'undefined' ? source : template
  if (typeof source !== 'object') return source
  const keys = Object.keys(source)
  keys.forEach(key => {
    const sourceValue = source[key]
    const tempValue = Array.isArray(source) ? template[0] : template[key]
    if (typeof tempValue === 'undefined') {
      source[key] = sourceValue
      // 注意：当两者类型不相同的时候，以模版的定义为准
    } else if (classOf(tempValue) !== classOf(sourceValue)) {
      source[key] = tempValue
    } else {
      source[key] = switchData(sourceValue, tempValue)
    }
  })
  return source
}

// eslint-disable-next-line no-unused-vars
function test() {
  const template = [{ rowId: '', columns: [{ valueList: [] }] }]

  const source = [
    { rowId: '1', columns: [{ columnId: 'a', valueList: [] }], rowNum: 2 },
    { rowId: null, columns: [{ valueList: null }] }
  ]
  const res = switchData(source, template)
  console.log(res)
  // [
  //   { rowId: '1', columns: [{ columnId: 'a', valueList: [] }], rowNum: 2 },
  //   { rowId: '', columns: [{ valueList: [] }] }
  // ]
}

// test()