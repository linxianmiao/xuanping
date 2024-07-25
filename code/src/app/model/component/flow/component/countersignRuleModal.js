import React, { Component } from 'react'
import { Form, Input, Radio, Checkbox } from '@uyun/components'
import TriggerRules from '~/components/triggerRules'
import { checkTriggerConditionValue, isTriggerConditionEmpty } from '~/components/common/checkTriggerConditionValue'
import UserAndGroupList from './userAndGroupList'
import MatrixCondition from './matrixCondition'
import uuid from '~/utils/uuid'
import '../../style/countersignRuleModal.less'
const FormItem = Form.Item
class CountersignRuleModal extends Component {
  state = {
    variableSelectionVo: undefined  // 暂时存放变量数据
  }

  validate = () => {
    return new Promise((resolve, reject) => {
      this.props.form.validateFieldsAndScroll((errors, values) => {
        if (errors) reject(errors)
        const { rulesName, triggerConditions, usersWrapData, userMatrix, matrixCondition, enableVariable, variableSelectionVo } = values
        // 触发条件层级较多，所以提交的时候进行校验
        const istriggerConditions = checkTriggerConditionValue(triggerConditions)
        const triggerConditionEmpty = isTriggerConditionEmpty(triggerConditions)
        const triggerConditionsRequired = this.isTriggerConditionsRequired()

        if (!istriggerConditions || (triggerConditionsRequired && triggerConditionEmpty)) {
          this.props.form.setFields({
            triggerConditions: {
              value: triggerConditions,
              errors: [new Error('触发条件不能为空')]
            }
          })
          reject(errors)
        }

        // 验证矩阵
        if (userMatrix === 1) {
          const { matrixId, matrixTarget, fromMatrix, toMatrix } = matrixCondition

          if (!matrixId || !matrixTarget || !fromMatrix || !toMatrix) {
            this.props.form.setFields({
              matrixCondition: {
                value: matrixCondition,
                errors: [new Error(i18n('please.improve.matrix'))]
              }
            })
            reject(errors)
          }
        }

        let { rulesId } = this.props.rule
        if (!rulesId) {
          rulesId = uuid()
        }
        let data = {
          rulesId,
          rulesName,
          userMatrix,
          triggerConditions,
          enableVariable,
          variableSelectionVo
        }
        if (userMatrix === 0) {
          let { userAndGroupList } = usersWrapData || {}
          userAndGroupList = _.map(userAndGroupList, item => _.pick(item, ['id', 'name', 'type']))
          data = _.assign({}, data, { userAndGroupList })
        } else {
          data = _.assign({}, data, { matrixCondition })
        }
        resolve(data)
      })
    })
  }

  validateUser = (rule, value, callback) => {
    const { getFieldValue } = this.props.form
    if (getFieldValue('userMatrix') === 1) {
      callback()
    }
    const { userAndGroupList } = value
    // 选了变量，人员就不是必选了
    if (!getFieldValue('enableVariable') && _.isEmpty(userAndGroupList)) {
      callback(i18n('ticket.comment.user', '请选择人员'))
    } else {
      callback()
    }
  }

  validateVariable = (rule, value, callback) => {
    if (_.isEmpty(value.variableList)) {
      callback(i18n('conf.model.proces.selectParam', '请选择变量'))
    } else {
      callback()
    }
  }

  isTriggerConditionsRequired = () => {
    const {
      form: { getFieldValue },
      rule: { userMatrix }
    } = this.props
    const fieldValue = getFieldValue('userMatrix')
    const nextUserMatrix = fieldValue !== undefined ? fieldValue : userMatrix

    // 人员选择 选择矩阵时，触发条件非必填
    return nextUserMatrix !== 1
  }

  getEnableVariable = () => {
    const { rule, form } = this.props
    let enableVariable = form.getFieldValue('enableVariable')

    if (enableVariable === undefined) {
      enableVariable = rule.enableVariable || false
    }

    return enableVariable
  }

  render () {
    const { modelId, rule } = this.props
    const { rulesName, triggerConditions, userAndGroupList, userMatrix, matrixCondition } = rule
    const { getFieldDecorator, getFieldError, getFieldValue } = this.props.form
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 }
    }
    const formItemLayout1 = {
      wrapperCol: { span: 20, offset: 4 }
    }
    const triggerConditionsRequired = this.isTriggerConditionsRequired()
    const triggerConditionsError = !!getFieldError('triggerConditions')
    const enableVariable = this.getEnableVariable()
    const variableSelectionVo = this.state.variableSelectionVo || rule.variableSelectionVo || {}

    return (
      <Form style={{ paddingRight: 50, paddingLeft: 0 }} className="counter-sign-rule-form">
        <FormItem {...formItemLayout} label={i18n('rule-name', '规则名称')}>
          {getFieldDecorator('rulesName', {
            initialValue: rulesName,
            rules: [{
              required: true,
              message: i18n('rule-name-tip', '请输入规则名称')
            }]
          })(
            <Input
              maxLength={20}
              placeholder={i18n('rule-name-tip', '请输入规则名称')} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          className="trigger-conditions-form-item"
          validateStatus="success"
          help={triggerConditionsError ? '触发条件不能为空' : ''}
          label={i18n('trigger_condition', '触发条件')}
        >
          {getFieldDecorator('triggerConditions', {
            initialValue: triggerConditions || {
              when: 'all',
              conditionExpressions: [],
              nestingConditions: []
            },
            rules: [{
              required: triggerConditionsRequired
            }]
          })(
            <TriggerRules
              modelId={modelId}
              isError={triggerConditionsError}
              excludeCodes={['modelId']} />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('ticket-new-user-title', '人员选择')}>
          {getFieldDecorator('userMatrix', {
            initialValue: userMatrix || 0,
            rules: [{
              required: true
            }]
          })(
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={0}>{i18n('choose_user', '选择人员')}</Radio.Button>
              <Radio.Button value={1}>{i18n('choose_matrix', '选择矩阵')}</Radio.Button>
            </Radio.Group>
          )}
        </FormItem>
        {
          getFieldValue('userMatrix') === 0
            ? <FormItem {...formItemLayout1} style={{ marginBottom: 0 }}>
              {getFieldDecorator('usersWrapData', {
                initialValue: { userAndGroupList } || {},
                rules: [{
                  required: true,
                  type: 'object',
                  validator: this.validateUser
                }]
              })(
                <UserAndGroupList modelId={modelId} tabs={[0, 1, 2, 3, 4]} showTypes={['groups','users','departs_custom','roles_custom','duty_custom']}/>
              )}
            </FormItem>
            : <FormItem {...formItemLayout1} style={{ marginBottom: 0 }}>
              {getFieldDecorator('matrixCondition', {
                initialValue: matrixCondition || {},
                rules: [{
                  required: true,
                  type: 'object'
                }]
              })(
                <MatrixCondition />
              )}
            </FormItem>
        }

        <FormItem {...formItemLayout1} style={{ marginBottom: 0 }}>
          {
            getFieldDecorator('enableVariable', {
              initialValue: enableVariable,
              valuePropName: 'checked'
            })(<Checkbox>{i18n('use.process.variable', '使用流程变量')}</Checkbox>)
          }
        </FormItem>

        {
          enableVariable && (
            <FormItem {...formItemLayout1}>
              {
                getFieldDecorator('variableSelectionVo', {
                  initialValue: { useVariable: false, ...variableSelectionVo },
                  rules: [{
                    validator: this.validateVariable
                  }],
                  onChange: value => this.setState({ variableSelectionVo: value })
                })(
                  <UserAndGroupList modelId={modelId} tabs={[5]} showTypes={['variable_custom']} dataKeyName="variableList" />
                )
              }
            </FormItem>
          )
        }
      </Form>
    )
  }
}

export default Form.create()(CountersignRuleModal)
