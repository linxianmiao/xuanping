/**
 * 判断数组对象中有没有空的value值，false为有空值
 * @param {Object} node
 */
export function checkTriggerConditionValue(node = {}) {
  const { nestingConditions = [], conditionExpressions = [] } = node || {}
  let canSubmit = true

  if (!_.isEmpty(conditionExpressions)) {
    for (let i = 0; i <= conditionExpressions.length - 1; i++) {
      if (
        !conditionExpressions[i].value &&
        !['IS_NULL', 'IS_NOT_NULL'].includes(conditionExpressions[i].comparison)
      ) {
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
      const flag = checkTriggerConditionValue(nestingConditions[i])
      if (!flag) {
        return false
      }
    }
  }
  return canSubmit
}

/**
 * 判断触发条件中的 嵌套和条件 是否都为空
 */
export function isTriggerConditionEmpty(data) {
  const { nestingConditions = [], conditionExpressions = [] } = data

  return _.isEmpty(nestingConditions) && _.isEmpty(conditionExpressions)
}
