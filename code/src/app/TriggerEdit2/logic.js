import { checkTriggerConditionValue } from '~/components/common/checkTriggerConditionValue'

// 校验时间策略
export function validateTimeStrategy(value = {}) {
  const {
    executeType,
    executeTime,
    executeDayOfWeek,
    executeMonth,
    executeDayOfMonth,
    timeInterval
  } = value
  let isError = false

  if (!executeTime) {
    isError = true
  }
  if (executeType === '2') {
    isError = _.isEmpty(executeDayOfWeek)
  }
  if (executeType === '3') {
    isError = _.isEmpty(executeMonth) || _.isEmpty(executeDayOfMonth)
  }
  if (executeType === '4') {
    isError = timeInterval === undefined
  }

  return isError
}

// 动作下的字段值改变
export function handleActionFieldChange(fieldValue, fieldKey, action, actionsValue = []) {
  const index = actionsValue.findIndex(
    (item) => action.actionCode === item.actionCode && action.type === item.type
  )
  const nextActionsValue = [...actionsValue]

  // 初始该动作下没有值
  if (index === -1) {
    const newValue = {
      type: action.type,
      actionCode: action.actionCode,
      [fieldKey]: fieldValue
    }
    nextActionsValue.push(newValue)
  } else {
    nextActionsValue[index][fieldKey] = fieldValue
  }

  return nextActionsValue
}

// 是否是同一个action
export function isEqualAction(a, b) {
  return a.type === b.type && a.actionCode === b.actionCode
}

/**
 * 校验触发器的基础数据（不包含动作）
 * 用于保存时
 * @param {object} trigger 触发器数据
 */
export function validateTriggerBasicData(trigger = {}) {
  const { name, description, triggerType, incident, triggerConditions, timeStrategyVo } = trigger
  let hasError = false

  if (validateRequired(name)) {
    hasError = true
  }
  if (validateRequired(description)) {
    hasError = true
  }

  if (triggerType === '1') {
    if (validateRequired(incident)) {
      hasError = true
    }
    if (validateTriggerConditions(triggerConditions)) {
      hasError = true
    }
  }
  if (triggerType === '2' && validateTimeStrategy(timeStrategyVo)) {
    hasError = true
  }

  return hasError
}

// 校验必填项
export function validateRequired(value) {
  return _.isEmpty(value)
}
// 校验触发条件
export function validateTriggerConditions(value) {
  return !checkTriggerConditionValue(value)
}
/**
 * 校验动作值
 * @param {array} value 所有动作值
 * @param {array} actions 当前触发类型下的动作，用于校验动作数据
 * @param {array} formRefs 创建工单动作下的表单ref集合
 */
export function validateActionsValue(value = [], actions = [], formRefs = []) {
  const funcs = []
  const formValues = [] // 创建工单动作中的表单值
  // const needValidateValue = value.filter(item => item.useable)
  _.forEach(value, (item) => {
    // 校验只针对选中的动作
    const needValidate = !!item.useable
    const action = actions.find((a) => isEqualAction(a, item)) || {}
    const { fields = [] } = action

    fields.forEach((field) => {
      const { key } = field

      // 创建工单中，每个表单都要校验
      if (key === 'ticketInfoList') {
        const formInstances = formRefs.map((item) => item.current)
        formInstances.forEach((item) => {
          if (needValidate) {
            const promise = new Promise((resolve) => {
              item.validateFields((error, values) => {
                formValues.push(values)
                if (error) {
                  resolve(true)
                } else {
                  resolve(false)
                }
              })
            })
            funcs.push(promise)
          } else {
            formValues.push(item.getFieldsValue())
            funcs.push(false)
          }
        })
      } else if (key === 'configTicket') {
        // 设置工单动作的校验
        const val = item[key]
        if (needValidate) {
          funcs.push(
            !val || val.length === 0 || val.some((item) => !item.paramName || !item.paramValue)
          )
        } else {
          funcs.push(false)
        }
      } else if (field.required) {
        if (needValidate) {
          funcs.push(_.isEmpty(item[key]))
        } else {
          funcs.push(false)
        }
      }
    })
  })

  return Promise.all(funcs).then((result) => ({ hasError: result.some(Boolean), formValues }))
}

/**
 * 检查当前是否有选中动作
 * @param {array} value 所有动作值
 * @param {*} actions 当前触发类型下的动作
 */
export function hasActinoSelect(value = [], actions = []) {
  return actions.some((action) => {
    const valueAction = value.find((item) => isEqualAction(item, action))

    return !!(valueAction && valueAction.useable)
  })
}
