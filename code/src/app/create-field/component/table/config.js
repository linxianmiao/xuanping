
export function getConstValue () {
  return {
    observableCellExpandCode: '', // 列的扩展值
    cellCode: '' // 列编码
  }
}

export function getApiValue () {
  return {
    observerCell: undefined, // 列编码
    conditions: [{
      paramName: '', // 用户输入
      observableCellExpandCode: '' // observableCell 列的扩展中的一个
    }]
  }
}

export function getHideValue () {
  return {
    observerCell: undefined, // 列编码
    conditions: [{
      observableCellExpandCode: '', // 列编码
      condition: '', // 等于，不等于。包含，不包含
      value: '' // 用户输的
    }]
  }
}
/**
 * 对传入的对象进行判断有没有空值
 * @param {object} item
 */
function objhasEmpty(item) {
  if (_.includes(['EMPTY', 'NOTEMPTY'], item.condition)) {
    return _.keys(item).length - 1 !== _.compact(_.values(item)).length
  }
  return _.keys(item).length !== _.compact(_.values(item)).length
}
/**
 * 对关联规则进行校验，如果有空则返回true
 * @param {Array} rules  规则
 * @param {string} visible const | api | hide   常量 | API | 隐藏
 */
export function checkRules(rules, visible) {
  if (visible === 'const') {
    return _.some(rules, item => objhasEmpty(item))
  }
  return _.some(rules, item => objhasEmpty(item) || _.some(item.conditions, condition => objhasEmpty(condition)))
}
