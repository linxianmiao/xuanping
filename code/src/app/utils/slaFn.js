/**
 * 判断数组对象中有没有空的value值
 * @param {Object} node
 */
const checkValue = node => {
  const { nestingConditions = [], conditionExpressions = [] } = node
  let canSubmit = true
  if (!_.isEmpty(conditionExpressions)) {
    for (let i = 0; i <= conditionExpressions.length - 1; i++) {
      if (!conditionExpressions[i].value) {
        canSubmit = false
        break
      }
    }
  }
  if (canSubmit && !_.isEmpty(nestingConditions)) {
    for (let i = 0; i <= nestingConditions.length - 1; i++) {
      if (!canSubmit) {
        break
      }
      const flag = checkValue(nestingConditions[i])
      if (!flag) {
        return false
      }
    }
  }
  return canSubmit
}

export default { checkValue }
